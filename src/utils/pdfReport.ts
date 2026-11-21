import jsPDF from 'jspdf';

interface ReportData {
  user: {
    name?: string;
    email?: string;
    wellness_goal?: string;
    created_at?: string;
  };
  analyses: Array<{
    input_mode: string;
    primary_emotion: string;
    intensity: string;
    confidence: number;
    explanation: string;
    created_at: string;
  }>;
  activities: Array<{
    title: string;
    activity_type: string;
    duration_minutes: number;
    completed_at: string;
  }>;
  generatedAt: string;
}

export function generateWellnessPdfReport(data: ReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // Header Banner Background
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AI-Powered Mental Wellness Assistant', 18, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text('Multimodal Mental Wellness & Emotion Recognition Report', 18, 25);
  doc.text(`Generated on: ${new Date(data.generatedAt).toLocaleDateString()} | User: ${data.user.name || 'Active User'}`, 18, 32);

  y = 52;

  // Disclaimer Box
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.setDrawColor(245, 158, 11); // Amber-500
  doc.rect(18, y, pageWidth - 36, 18, 'FD');
  doc.setTextColor(146, 64, 14); // Amber-800
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT WELLNESS & ETHICAL NOTICE:', 22, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This report is generated for reflective self-awareness and supportive wellness tracking purposes only. It does NOT',
    22,
    y + 11
  );
  doc.text(
    'constitute a clinical psychiatric evaluation, diagnosis, or medical advice. If experiencing acute distress, call 112 / 14416 / 988.',
    22,
    y + 15
  );

  y += 28;

  // Summary Metrics Section
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Interaction Summary', 18, y);
  y += 6;

  // Metric cards
  const boxWidth = (pageWidth - 36 - 8) / 3;
  const metrics = [
    { label: 'Total Analyses', val: String(data.analyses.length) },
    { label: 'Activities Done', val: String(data.activities.length) },
    { label: 'Wellness Goal', val: data.user.wellness_goal || 'General Health' },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 18 + idx * (boxWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, y, boxWidth, 18, 2, 2, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(m.label, xPos + 4, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(m.val.length > 18 ? m.val.slice(0, 16) + '...' : m.val, xPos + 4, y + 14);
  });

  y += 26;

  // 2. Recent Emotion Analyses
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Multimodal Emotion Analysis Log (Recent)', 18, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(18, y, pageWidth - 36, 7, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 22, y + 5);
  doc.text('Modality', 52, y + 5);
  doc.text('Primary Emotion', 85, y + 5);
  doc.text('Intensity', 128, y + 5);
  doc.text('Confidence', 155, y + 5);
  y += 8;

  const recentAnalyses = data.analyses.slice(0, 10);
  if (recentAnalyses.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No emotion analyses recorded yet.', 22, y + 4);
    y += 10;
  } else {
    recentAnalyses.forEach((row, i) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(18, y - 1, pageWidth - 36, 7, 'F');
      }

      const dateStr = new Date(row.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
      doc.text(dateStr, 22, y + 4);
      doc.text(row.input_mode.toUpperCase(), 52, y + 4);
      doc.text(row.primary_emotion, 85, y + 4);
      doc.text(row.intensity, 128, y + 4);
      doc.text(`${Math.round(row.confidence * 100)}%`, 155, y + 4);
      y += 7;
    });
  }

  y += 10;

  // 3. Personalized Supportive Insights
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Algorithmic Wellness Recommendations', 18, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const tips = [
    'Cognitive Grounding: Use structured 4-7-8 diaphragmatic breathing during peak moments of anxiety or cognitive exhaustion.',
    'Restorative Interval: Incorporate 10-minute non-screen intervals every 90 minutes of academic preparation or focused work.',
    'Empathetic Reflection: Continue maintaining honest self-expression in Text Chat sessions for emotional clarity.',
    'Social Cohesion: Sharing concerns with trusted peers, mentors, or family reduces isolation and stress burdens.'
  ];

  tips.forEach((tip) => {
    doc.text(`✓ ${tip}`, 22, y, { maxWidth: pageWidth - 44 });
    y += 7;
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`AI-Powered Mental Wellness Assistant Report | Confidential Personal Document | Generated with Google Gemini AI Studio`, 18, pageHeight - 10);

  doc.save(`Wellness_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
