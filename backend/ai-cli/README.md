# VEL AI Orchestration CLI

A terminal-based AI orchestration backend that sends prompts simultaneously to OpenAI GPT, Google Gemini, and Anthropic Claude via OpenRouter.

## Features

- **Multi-model orchestration**: Send one prompt to 3 AI models at the same time
- **Concurrent execution**: Uses Promise.all() for simultaneous API calls
- **Error handling**: Graceful failure handling - if one model fails, others still respond
- **Timeout protection**: 30-second timeout per request
- **Colored terminal output**: Color-coded responses for easy readability
- **Modular architecture**: Clean separation of concerns, ready for frontend integration
- **Strong TypeScript typing**: Full type safety across the codebase
- **Request metrics**: Response time tracking and logging

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API keys (get from https://openrouter.ai)

## Installation

```bash
cd ai-cli
npm install
cp .env.example .env
# Edit .env with your OpenRouter API keys
```

## Configuration

Update `.env` with your OpenRouter API keys:

```env
OPENROUTER_API_KEY_GPT=your_gpt_key_here
OPENROUTER_API_KEY_GEMINI=your_gemini_key_here
OPENROUTER_API_KEY_CLAUDE=your_claude_key_here
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Terminal Experience

```
==================================
VEL AI TERMINAL
Multi Model AI Backend
==================================

Type your prompt below, then press Enter.
Type 'exit' or 'quit' to stop.

> explain quantum computing simply

[Sending request to GPT...]
[Sending request to Gemini...]
[Sending request to Claude...]

==================================
GPT RESPONSE (1.2s)
============

Quantum computing uses quantum bits...

==================================
GEMINI RESPONSE (0.9s)
===============

In quantum computing, data is stored...

==================================
CLAUDE RESPONSE (1.4s)
===============

Quantum computers harness the principles...

>
```

## Project Structure

```
ai-cli/
├── src/
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── models/
│   │   ├── gpt.ts          # GPT-4 model interface
│   │   ├── gemini.ts       # Gemini model interface
│   │   └── claude.ts       # Claude model interface
│   ├── services/
│   │   └── aiOrchestrator.ts    # Main orchestration service
│   ├── utils/
│   │   ├── logger.ts       # Logging utilities
│   │   └── terminal.ts     # Terminal UI utilities
│   └── index.ts            # CLI entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Architecture

### Model Files

Each model file exports an async function that:

- Accepts a user prompt
- Calls the OpenRouter API
- Returns the response text
- Handles errors gracefully

### Orchestrator Service

The `aiOrchestrator.ts` service:

- Accepts a single prompt
- Sends it to all 3 models concurrently using Promise.all()
- Aggregates responses into a structured result
- Handles timeouts and errors

### Terminal Interface

The CLI:

- Prompts for user input
- Calls the orchestrator
- Displays color-coded responses
- Continues until user types 'exit' or 'quit'

## API Integration

Uses OpenRouter API format:

```
POST https://openrouter.ai/api/v1/chat/completions

Headers:
- Authorization: Bearer API_KEY
- Content-Type: application/json

Body:
{
  "model": "model_name",
  "messages": [
    {
      "role": "user",
      "content": "prompt_text"
    }
  ]
}
```

## Models Used

- **GPT**: `openai/gpt-4.1-mini`
- **Gemini**: `google/gemini-2.5-flash`
- **Claude**: `anthropic/claude-3.7-sonnet`

## Error Handling

- Network errors → Shows error message, continues
- Timeout (>30s) → Returns timeout message, continues
- Invalid API key → Shows authentication error
- Rate limiting → Retries once after delay
- One model fails → Other models' responses still shown

## Timeout Configuration

Default: 30 seconds per request

Configure in `.env`:

```env
REQUEST_TIMEOUT_MS=30000
```

## Logging

Logs include:

- Request initiation
- Response receipt with timing
- Error messages
- Token usage (if available from API)

## Future Integration

This CLI is designed to be integrated with the VEL AI frontend:

- Business logic is separate from terminal UI
- Easy to adapt orchestrator for API endpoints
- Reusable service layer for web integration
- No tight coupling to CLI interface

## Development

### Building

```bash
npm run build
```

Output goes to `dist/` folder.

### Testing

```bash
npm run dev
# Then test manually in terminal
```

## Performance

- Concurrent requests: ~1-3 seconds for all 3 models
- Individual timeouts: 30 seconds max per model
- Memory efficient: Minimal buffering

## License

MIT
