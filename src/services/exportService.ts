import { Subject, UserProfile, TimetableSlot, Holiday } from '../types';

export class ExportService {
  static exportToCSV(subjects: Subject[], user: UserProfile) {
    const headers = ['Subject Code', 'Subject Name', 'Teacher', 'Present Classes', 'Absent Classes', 'Total Classes', 'Current Attendance %', 'Status'];
    
    const rows = subjects.map(s => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.teacher || 'N/A'}"`,
      s.presentCount,
      s.absentCount,
      s.totalClasses,
      `${s.currentPercentage}%`,
      s.currentPercentage >= user.targetAttendanceGoal ? 'SAFE' : 'LOW ATTENDANCE WARNING'
    ]);

    const csvContent = [
      `"ATTENDANCE AI - ACADEMIC REPORT"`,
      `"Student Name: ${user.name}"`,
      `"College: ${user.collegeName || 'N/A'}"`,
      `"Target Goal: ${user.targetAttendanceGoal}%"`,
      `"Generated On: ${new Date().toLocaleDateString()}"`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_AI_Report_${user.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static printPDFReport(subjects: Subject[], user: UserProfile, holidays: Holiday[]) {
    const windowPrint = window.open('', '_blank');
    if (!windowPrint) return;

    const totalP = subjects.reduce((s, item) => s + item.presentCount, 0);
    const totalC = subjects.reduce((s, item) => s + item.totalClasses, 0);
    const overallPct = totalC > 0 ? ((totalP / totalC) * 100).toFixed(2) : '0';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance AI Report - ${user.name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .meta { font-size: 14px; color: #64748b; line-height: 1.6; }
          .badge { padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 12px; display: inline-block; }
          .badge-safe { background: #dcfce7; color: #166534; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f8fafc; text-align: left; padding: 12px; font-size: 13px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; color: #475569; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .summary-card { background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .stat-val { font-size: 24px; font-weight: bold; color: #1e3a8a; margin-top: 4px; }
          .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">⚡ Attendance AI</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Your Smart AI Attendance Assistant</div>
          </div>
          <div class="meta" style="text-align: right;">
            <strong>${user.name}</strong><br/>
            ${user.collegeName || 'University Student'}<br/>
            Target Target: ${user.targetAttendanceGoal}% | Date: ${new Date().toLocaleDateString()}
          </div>
        </div>

        <div class="summary-card">
          <div>
            <div class="stat-label">Overall Attendance</div>
            <div class="stat-val" style="color: ${parseFloat(overallPct) >= user.targetAttendanceGoal ? '#16a34a' : '#dc2626'}">${overallPct}%</div>
          </div>
          <div>
            <div class="stat-label">Total Classes</div>
            <div class="stat-val">${totalC}</div>
          </div>
          <div>
            <div class="stat-label">Classes Attended</div>
            <div class="stat-val" style="color: #16a34a">${totalP}</div>
          </div>
          <div>
            <div class="stat-label">Classes Missed</div>
            <div class="stat-val" style="color: #dc2626">${totalC - totalP}</div>
          </div>
        </div>

        <h3>Subject Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Name</th>
              <th>Teacher</th>
              <th>Present / Total</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(s => `
              <tr>
                <td><strong>${s.code}</strong></td>
                <td>${s.name}</td>
                <td>${s.teacher || 'N/A'}</td>
                <td>${s.presentCount} / ${s.totalClasses}</td>
                <td><strong>${s.currentPercentage}%</strong></td>
                <td>
                  <span class="badge ${s.currentPercentage >= user.targetAttendanceGoal ? 'badge-safe' : 'badge-danger'}">
                    ${s.currentPercentage >= user.targetAttendanceGoal ? 'SAFE' : 'LOW ATTENDANCE'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
          Generated automatically by Attendance AI Platform &bull; Certified Academic Report
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    windowPrint.document.write(htmlContent);
    windowPrint.document.close();
  }
}
