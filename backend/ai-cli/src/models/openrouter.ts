import { OpenRouter } from '@openrouter/sdk';

export interface OpenRouterResponse {
  success: boolean;
  content: string;
  error?: string;
  responseTime: number;
  reasoningTokens?: number;
}

type StreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  usage?: any;
};

export async function generateStreamingResponse(params: {
  apiKey: string;
  model: string;
  prompt: string;
  /** Optional system prompt injected before the user message. */
  systemPrompt?: string;
}): Promise<OpenRouterResponse> {
  const startTime = Date.now();
  const openrouter = new OpenRouter({ apiKey: params.apiKey });

  // Build message array — prepend system message only when provided
  type Message = { role: 'system' | 'user'; content: string };
  const messages: Message[] = [];

  if (params.systemPrompt) {
    messages.push({ role: 'system', content: params.systemPrompt });
  }

  messages.push({ role: 'user', content: params.prompt });

  try {
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: params.model,
        messages,
        maxTokens: 1500,   // increased for web-search style responses
        stream: true,
        streamOptions: {
          includeUsage: true,
        },
      },
    });

    let content = '';
    let reasoningTokens: number | undefined;

    for await (const chunk of stream as AsyncIterable<StreamChunk>) {
      const deltaContent = chunk.choices?.[0]?.delta?.content;

      if (deltaContent) {
        content += deltaContent;
      }

      const chunkReasoningTokens = chunk.usage?.completionTokensDetails?.reasoningTokens;

      if (chunkReasoningTokens !== undefined) {
        reasoningTokens = chunkReasoningTokens;
      }
    }

    return {
      success: true,
      content,
      responseTime: (Date.now() - startTime) / 1000,
      reasoningTokens,
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: (Date.now() - startTime) / 1000,
    };
  }
}
