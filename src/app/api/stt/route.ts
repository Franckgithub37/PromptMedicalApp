import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.MISTRAL_API_KEY || process.env.VOXTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Voxtral non configurée.' },
        { status: 500 }
      );
    }

    const data = await request.formData();
    const audio = data.get('audio');

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: 'Fichier audio manquant.' },
        { status: 400 }
      );
    }

    const upstreamFormData = new FormData();
    upstreamFormData.append('model', process.env.VOXTRAL_MODEL || 'voxtral-mini-latest');
    upstreamFormData.append('file', audio, audio.name || 'dictation.webm');
    upstreamFormData.append('language', 'fr');

    const upstreamResponse = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: upstreamFormData
    });

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      console.error('Voxtral STT error:', errorBody);
      return NextResponse.json(
        { error: 'Erreur de transcription Voxtral.' },
        { status: upstreamResponse.status }
      );
    }

    const transcription = await upstreamResponse.json();
    const text =
      typeof transcription?.text === 'string'
        ? transcription.text
        : typeof transcription?.transcript === 'string'
          ? transcription.transcript
          : '';

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error('STT route error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la dictée vocale.' },
      { status: 500 }
    );
  }
}
