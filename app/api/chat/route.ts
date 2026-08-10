import { NextResponse } from 'next/server';
import { AIService } from '../../../src/services/aiService';

export async function POST(req: Request) {
  try {
    const { message, subjects, timetable, holidays, targetGoal } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message prompt is required' }, { status: 400 });
    }

    const aiResult = AIService.processUserMessage(
      message,
      subjects || [],
      timetable || [],
      holidays || [],
      targetGoal || 75
    );

    return NextResponse.json({
      success: true,
      sender: 'ai',
      text: aiResult.text,
      detectedLanguage: aiResult.language,
      actionPayload: aiResult.actionPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process AI response' }, { status: 500 });
  }
}
