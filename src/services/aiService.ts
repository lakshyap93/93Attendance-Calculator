import { Subject, TimetableSlot, Holiday, BunkCalculation, SimulationScenario } from '../types';

export class AIService {
  // Simple multilingual language detector based on script and common vocabulary keywords
  static detectLanguage(text: string): string {
    const lower = text.toLowerCase();
    
    // Devanagari script or Hindi / Hinglish keywords
    if (/[\u0900-\u097F]/.test(text)) return 'Hindi (Hindi Script)';
    if (/\b(bunk|kya|bhai|meri|aaj|karlu|ho|jaaye|sakte|hain|kitni|kitne|chutti|chhutti|parso|kal|baat|batao|rahega|bataen)\b/i.test(lower)) {
      return 'Hinglish';
    }

    // Gujarati script or keywords
    if (/[\u0A80-\u0AFF]/.test(text) || /\b(tame|su|kem|che|mate|bhavishya|haajar)\b/i.test(lower)) return 'Gujarati';

    // Tamil script or keywords
    if (/[\u0B80-\u0BFF]/.test(text) || /\b(varugai|vanakkam|en|aam|illai|nalla|bunk|pogalaama)\b/i.test(lower)) return 'Tamil';

    // Marathi script / keywords
    if (/\b(kiti|maza|maazi|aaj|udya|bunk|karaaychay|sar|ahe)\b/i.test(lower)) return 'Marathi';

    // Punjabi script / keywords
    if (/[\u0A00-\u0A7F]/.test(text) || /\b(tuhanu|meri|aaj|kal|chutti|ki|daso|tuhaadi)\b/i.test(lower)) return 'Punjabi';

    // Malayalam script
    if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam';

    // Kannada script
    if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada';

    // Bengali script
    if (/[\u0980-\u09FF]/.test(text)) return 'Bengali';

    // Urdu script
    if (/[\u0600-\u06FF]/.test(text)) return 'Urdu';

    return 'English';
  }

  // Calculate Safe Bunks & Classes Needed for a given subject
  static calculateBunkDetails(subject: Subject, targetGoal: number = 75): BunkCalculation {
    const P = subject.presentCount;
    const T = subject.totalClasses;
    const current = T > 0 ? (P / T) * 100 : 100;

    // Safe bunks left before dropping below target: P / (T + B) >= target/100  => B <= (100*P - target*T)/target
    let safeBunks = 0;
    if (current >= targetGoal) {
      safeBunks = Math.floor((100 * P - targetGoal * T) / targetGoal);
      if (safeBunks < 0) safeBunks = 0;
    }

    // Classes needed to reach target if currently below: (P + N)/(T + N) >= target/100 => N >= (target*T - 100*P)/(100 - target)
    let needed = 0;
    if (current < targetGoal) {
      needed = Math.ceil((targetGoal * T - 100 * P) / (100 - targetGoal));
      if (needed < 0) needed = 0;
    }

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (current < 75) status = 'danger';
    else if (current < 80) status = 'warning';

    return {
      subjectName: subject.name,
      currentPercentage: parseFloat(current.toFixed(2)),
      totalClasses: T,
      presentCount: P,
      safeBunksLeft: safeBunks,
      classesNeededForTarget: needed,
      targetPercentage: targetGoal,
      status,
    };
  }

  // Simulate missed classes
  static simulateMissedClasses(subjects: Subject[], subjectId: string | null, count: number) {
    return subjects.map(sub => {
      if (subjectId && sub.id !== subjectId) return sub;
      const newTotal = sub.totalClasses + count;
      const newPresent = sub.presentCount; // missed = absent
      const newPct = parseFloat(((newPresent / newTotal) * 100).toFixed(2));
      return {
        ...sub,
        simulatedTotal: newTotal,
        simulatedPresent: newPresent,
        simulatedPercentage: newPct,
        drop: parseFloat((sub.currentPercentage - newPct).toFixed(2)),
      };
    });
  }

  // Process user chat prompt and return AI response
  static processUserMessage(
    message: string,
    subjects: Subject[],
    timetable: TimetableSlot[],
    holidays: Holiday[],
    targetGoal: number = 75
  ): { text: string; language: string; actionPayload?: any } {
    const lang = this.detectLanguage(message);
    const lower = message.toLowerCase();

    // 1. Check if user is asking about bunking a specific subject
    const matchedSubject = subjects.find(s => 
      lower.includes(s.name.toLowerCase()) || 
      lower.includes(s.code.toLowerCase()) ||
      (s.name.toLowerCase().includes('dbms') && (lower.includes('dbms') || lower.includes('database'))) ||
      (s.name.toLowerCase().includes('operating') && (lower.includes('os') || lower.includes('operating'))) ||
      (s.name.toLowerCase().includes('algorithms') && (lower.includes('algo') || lower.includes('daa'))) ||
      (s.name.toLowerCase().includes('intelligence') && (lower.includes('ai') || lower.includes('ml'))) ||
      (s.name.toLowerCase().includes('web') && (lower.includes('web') || lower.includes('lab')))
    );

    const isBunkQuery = /\b(bunk|skip|miss|absent|chutti|leave)\b/i.test(lower);
    const isGoalQuery = /\b(maintain|reach|target|goal|percentage|need|attend)\b/i.test(lower);
    const isTodayQuery = /\b(today|aaj)\b/i.test(lower);

    // Scenario A: Bunk specific subject or Today's classes
    if (matchedSubject && isBunkQuery) {
      const calc = this.calculateBunkDetails(matchedSubject, targetGoal);
      const afterBunkTotal = matchedSubject.totalClasses + 1;
      const afterBunkPct = ((matchedSubject.presentCount / afterBunkTotal) * 100).toFixed(2);

      if (lang === 'Hindi (Hindi Script)') {
        return {
          language: lang,
          text: `अगर आप आज **${matchedSubject.name}** की क्लास बंक करते हैं:\n\n• आपकी अटेंडेंस **${matchedSubject.currentPercentage}%** से गिरकर **${afterBunkPct}%** हो जाएगी।\n• सुरक्षित बंक बचे हैं: **${calc.safeBunksLeft}**\n\n${calc.safeBunksLeft > 0 ? '✅ बंक करना सुरक्षित है!' : '⚠️ सावधान! आपका अटेंडेंस लक्ष्य से नीचे गिर जाएगा।'}`,
          actionPayload: { type: 'bunk_summary', data: calc }
        };
      } else if (lang === 'Hinglish') {
        return {
          language: lang,
          text: `Agar aap aaj **${matchedSubject.name}** bunk karte ho:\n\n• Aapka attendance **${matchedSubject.currentPercentage}%** se drop ho ke **${afterBunkPct}%** ho jayega.\n• Safe bunks left: **${calc.safeBunksLeft}**\n\n${calc.safeBunksLeft > 0 ? '✅ Ha, aap aaj bunk kar sakte ho!' : '⚠️ Mat bunk karo! Total attendance ${targetGoal}% se niche chali jayegi.'}`,
          actionPayload: { type: 'bunk_summary', data: calc }
        };
      } else if (lang === 'Gujarati') {
        return {
          language: lang,
          text: `જો તમે આજે **${matchedSubject.name}** બંક કરશો:\n\n• તમારી હાજરી **${matchedSubject.currentPercentage}%** થી ઘટીને **${afterBunkPct}%** થશે.\n• બાકી રહેલા સેફ બંક: **${calc.safeBunksLeft}**\n\n${calc.safeBunksLeft > 0 ? '✅ હા, તમે બંક કરી શકો છો!' : '⚠️ ચેતવણી! તમારી હાજરી લક્ષ્યથી ઓછી થઈ જશે.'}`,
          actionPayload: { type: 'bunk_summary', data: calc }
        };
      } else if (lang === 'Tamil') {
        return {
          language: lang,
          text: `நீங்கள் இன்று **${matchedSubject.name}** வகுப்பை கட் செய்தால்:\n\n• வருகைப் பதிவு **${matchedSubject.currentPercentage}%** லிருந்து **${afterBunkPct}%** ஆக குறையும்.\n• பாதுகாப்பான பங்க்கள்: **${calc.safeBunksLeft}**\n\n${calc.safeBunksLeft > 0 ? '✅ ஆம், நீங்கள் கட் செய்யலாம்!' : '⚠️ கட் செய்ய வேண்டாம், வருகை குறையும்.'}`,
          actionPayload: { type: 'bunk_summary', data: calc }
        };
      } else {
        return {
          language: lang,
          text: `If you bunk **${matchedSubject.name}** today:\n\n• Your attendance will drop from **${matchedSubject.currentPercentage}%** to **${afterBunkPct}%**.\n• Safe bunks available: **${calc.safeBunksLeft}**\n\n${calc.safeBunksLeft > 0 ? '✅ **Safe to Bunk!** You have sufficient margin.' : `⚠️ **Risk Warning!** Bunking will drop you below your ${targetGoal}% goal.`}`,
          actionPayload: { type: 'bunk_summary', data: calc }
        };
      }
    }

    // Scenario B: Overall attendance summary query
    if (lower.includes('total') || lower.includes('overall') || lower.includes('summary') || lower.includes('report') || lower.includes('meri attendance')) {
      const totalP = subjects.reduce((sum, s) => sum + s.presentCount, 0);
      const totalC = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
      const overallPct = totalC > 0 ? ((totalP / totalC) * 100).toFixed(2) : '0';

      const listStr = subjects.map(s => `• **${s.name}**: ${s.currentPercentage}% (${s.presentCount}/${s.totalClasses})`).join('\n');

      if (lang === 'Hinglish') {
        return {
          language: lang,
          text: `Aapki overall attendance **${overallPct}%** hai.\n\nSubject-wise summary:\n${listStr}\n\n${parseFloat(overallPct) >= targetGoal ? '🎉 Aap safe zone me ho!' : '⚠️ Attention: Kuch subjects me attendance low hai.'}`
        };
      } else if (lang === 'Hindi (Hindi Script)') {
        return {
          language: lang,
          text: `आपकी कुल अटेंडेंस **${overallPct}%** है।\n\nविषय-वार विवरण:\n${listStr}\n\n${parseFloat(overallPct) >= targetGoal ? '🎉 आप सुरक्षित क्षेत्र में हैं!' : '⚠️ ध्यान दें: कुछ विषयों में उपस्थिति कम है।'}`
        };
      } else {
        return {
          language: lang,
          text: `Your overall attendance across all subjects is **${overallPct}%** (${totalP}/${totalC} classes attended).\n\n**Subject Breakdown:**\n${listStr}\n\nTarget Goal: **${targetGoal}%**`,
        };
      }
    }

    // Scenario C: Target goal advice / classes needed
    if (isGoalQuery || lower.includes('75') || lower.includes('80') || lower.includes('85') || lower.includes('90')) {
      const target = lower.includes('80') ? 80 : lower.includes('85') ? 85 : lower.includes('90') ? 90 : 75;
      const subCalcs = subjects.map(s => this.calculateBunkDetails(s, target));

      const neededText = subCalcs
        .filter(c => c.classesNeededForTarget > 0)
        .map(c => `• **${c.subjectName}**: Attend **${c.classesNeededForTarget}** more consecutive classes`)
        .join('\n');

      const safeText = subCalcs
        .filter(c => c.safeBunksLeft > 0)
        .map(c => `• **${c.subjectName}**: You can safely bunk **${c.safeBunksLeft}** classes`)
        .join('\n');

      if (lang === 'Hinglish') {
        return {
          language: lang,
          text: `Target **${target}%** maintain karne ke liye:\n\n${neededText ? `**Lagatar Leni Hongi Classes:**\n${neededText}\n\n` : ''}${safeText ? `**Safe Bunks Available:**\n${safeText}` : ''}`
        };
      } else {
        return {
          language: lang,
          text: `To achieve and maintain **${target}%** attendance goal:\n\n${neededText ? `**Classes Required Immediately:**\n${neededText}\n\n` : ''}${safeText ? `**Safe Bunk Margins:**\n${safeText}` : ''}`
        };
      }
    }

    // Scenario D: Today's Schedule Query
    if (isTodayQuery || lower.includes('schedule') || lower.includes('lecture')) {
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayClasses = timetable.filter(t => t.day.toLowerCase() === todayDay.toLowerCase());

      if (todayClasses.length === 0) {
        return {
          language: lang,
          text: `📅 **No classes scheduled for today (${todayDay})!** Enjoy your holiday or free time.`,
        };
      }

      const scheduleStr = todayClasses
        .map(c => `• **${c.startTime} - ${c.endTime}**: ${c.subjectName} (${c.classType.toUpperCase()}) @ ${c.room || 'Room TBA'}`)
        .join('\n');

      return {
        language: lang,
        text: `📅 **Today's Schedule (${todayDay}):**\n\n${scheduleStr}\n\nAll the best for your lectures today!`,
      };
    }

    // Default Fallback (Smart Multilingual Response)
    if (lang === 'Hinglish') {
      return {
        language: lang,
        text: `Maine aapka query samajh liya! Main aapke uploaded timetable aur attendance data ke mutabiq yeh kar sakta hu:\n\n1. *"Can I bunk DBMS today?"* (Bunk Safety Check)\n2. *"What if I miss 3 classes of OS?"* (Simulation)\n3. *"How many classes needed for 80%?"* (Goal Planner)\n4. *"Show today's schedule"* (Timetable lookup)`,
      };
    } else if (lang === 'Hindi (Hindi Script)') {
      return {
        language: lang,
        text: `मैंने आपका प्रश्न समझ लिया है! मैं आपकी अटेंडेंस और टाइमटेबल के अनुसार आपकी सहायता कर सकता हूँ:\n\n1. *"क्या मैं आज DBMS बंक कर सकता हूँ?"*\n2. *"अगर मैं अगले 3 लेक्चर मिस करूँ तो क्या होगा?"*\n3. *"80% लक्ष्य के लिए कितनी क्लासेज चाहिए?"*`,
      };
    } else {
      return {
        language: lang,
        text: `I understood your query! Based on your schedule and attendance records, I can help you with:\n\n• **Bunk Checking**: *"Can I bunk Operating Systems today?"*\n• **Simulation Engine**: *"If I miss all classes next week, what will be my %?"*\n• **Goal Planner**: *"How many classes needed to reach 80%?"*\n• **Holiday Marker**: *"Mark 15 August as holiday"*`,
      };
    }
  }
}
