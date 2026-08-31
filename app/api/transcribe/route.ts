import { NextResponse } from 'next/server';
import Groq, { toFile } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('file') as Blob;
    
    if (!audioBlob) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert the Blob to a File object using Groq's toFile utility
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    const file = await toFile(buffer, 'audio.webm', { type: audioBlob.type || 'audio/webm' });

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
      language: 'en'
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
