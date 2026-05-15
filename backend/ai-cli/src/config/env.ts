import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

interface Config {
  openrouter: {
    baseUrl: string;
    apiKeys: {
      gpt: string;
      gemini: string;
      claude: string;
    };
  };
  request: {
    timeoutMs: number;
  };
  log: {
    level: 'info' | 'debug' | 'warn' | 'error';
  };
}

export const config: Config = {
  openrouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKeys: {
      gpt:
        process.env.OPENROUTER_API_KEY_GPT ||
        process.env.OPENROUTER_API_KEY ||
        '',
      gemini:
        process.env.OPENROUTER_API_KEY_GEMINI ||
        process.env.OPENROUTER_API_KEY ||
        '',
      claude:
        process.env.OPENROUTER_API_KEY_CLAUDE ||
        process.env.OPENROUTER_API_KEY ||
        '',
    },
  },
  request: {
    timeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
  },
  log: {
    level: (process.env.LOG_LEVEL as 'info' | 'debug' | 'warn' | 'error') || 'info',
  },
};

export function validateConfig(): void {
  if (!config.openrouter.apiKeys.gpt) {
    throw new Error('OPENROUTER_API_KEY_GPT is not set in .env');
  }
  if (!config.openrouter.apiKeys.gemini) {
    throw new Error('OPENROUTER_API_KEY_GEMINI is not set in .env');
  }
  if (!config.openrouter.apiKeys.claude) {
    throw new Error('OPENROUTER_API_KEY_CLAUDE is not set in .env');
  }
}
