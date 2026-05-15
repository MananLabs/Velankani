import { Injectable } from '@nestjs/common';

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

@Injectable()
export class VoiceService {
  async transcribe(audioBuffer: Buffer, mimeType: string): Promise<{ transcript: string; error?: string }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { transcript: '', error: 'OpenAI API key not configured' };
    }

    try {
      const ext = mimeType === 'audio/webm' ? 'webm' : 'wav';
      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(audioBuffer)], { type: mimeType }), `recording.${ext}`);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch(WHISPER_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { transcript: '', error: `Whisper API error ${response.status}: ${errorText}` };
      }

      const data = (await response.json()) as Record<string, unknown>;
      const transcript = String(data.text || '').trim();

      if (!transcript) {
        return { transcript: '', error: 'No speech detected in audio' };
      }

      return { transcript };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { transcript: '', error: `Transcription failed: ${msg}` };
    }
  }
}
