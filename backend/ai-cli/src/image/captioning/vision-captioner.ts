/**
 * Image Pipeline — Vision Captioner
 *
 * Generates ONE semantic caption per image using a vision-capable model
 * via OpenRouter.  This is called EXACTLY ONCE during ingestion and the
 * result is stored permanently — the image is never sent to the API again.
 *
 * Model: google/gemini-2.0-flash-exp:free  (supports vision, free tier)
 * Fallback: openai/gpt-4o-mini
 */

import { CaptionResult } from '../types/index.js';
import { Logger } from '../../utils/logger.js';

const PRIMARY_MODEL   = 'google/gemini-2.0-flash-exp:free';
const FALLBACK_MODEL  = 'openai/gpt-4o-mini';
const OPENROUTER_URL  = 'https://openrouter.ai/api/v1/chat/completions';

const CAPTION_PROMPT =
  'Describe this image in detail. Include: what is shown, any visible text or ' +
  'numbers, charts or diagrams, UI elements, objects, people, colours, and the ' +
  'overall context or purpose of the image. Be thorough but concise.';

export class VisionCaptioner {
  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error('API key required for vision captioning');
  }

  /**
   * Generate a semantic caption for an image.
   *
   * @param imageBuffer  JPEG buffer (output of ImagePreprocessor.prepareForCaptioning)
   */
  async caption(imageBuffer: Buffer): Promise<CaptionResult> {
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    // Try primary model, fall back on error
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const result = await this.callVisionAPI(model, dataUrl);
        if (result) {
          return { caption: result, model };
        }
      } catch (err) {
        Logger.warn(
          `Vision model ${model} failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    // Both models failed — return a placeholder so ingestion can continue
    Logger.warn('Vision captioning unavailable — using placeholder caption');
    return {
      caption: 'Image content could not be described automatically.',
      model: 'none',
    };
  }

  private async callVisionAPI(model: string, dataUrl: string): Promise<string> {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text',      text: CAPTION_PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API ${response.status}: ${err}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) throw new Error('Empty response from vision model');

    return content;
  }
}
