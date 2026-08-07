import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No timetable file uploaded' }, { status: 400 });
    }

    // Simulated OCR Vision Extraction Response
    return NextResponse.json({
      success: true,
      confidence: 96.4,
      fileName: file.name,
      extractedSubjects: [
        'Database Management Systems (CS501)',
        'Operating Systems (CS502)',
        'Design & Analysis of Algorithms (CS503)',
        'Artificial Intelligence & Machine Learning (CS504)',
        'Web Technologies Lab (CS505P)',
      ],
      detectedSlotsCount: 14,
      status: 'OCR_SUCCESS',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'OCR processing failed' }, { status: 500 });
  }
}
