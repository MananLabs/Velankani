# Quick Start Guide - VEL AI Orchestration CLI

## Prerequisites

- Node.js 18+ (https://nodejs.org)
- npm 8+
- OpenRouter API keys (https://openrouter.ai)

## Setup (5 minutes)

### 1. Navigate to the CLI directory

```bash
cd ai-cli
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API keys:

```env
OPENROUTER_API_KEY_GPT=sk-or-your-gpt-key-here
OPENROUTER_API_KEY_GEMINI=sk-or-your-gemini-key-here
OPENROUTER_API_KEY_CLAUDE=sk-or-your-claude-key-here
```

Get your keys from: https://openrouter.ai/keys

### 4. Start the CLI

```bash
npm run dev
```

You should see:

```
════════════════════════════════════════
   VEL AI TERMINAL
   Multi Model AI Backend
════════════════════════════════════════

Type your prompt and press Enter.
Type "exit" or "quit" to stop.

>
```

### 5. Test it

Type a prompt and press Enter:

```
> explain quantum computing simply
```

The CLI will send your prompt to all 3 AI models simultaneously and display their responses.

## Using the CLI

### Basic Usage

```
> What is machine learning?

[Loading...]

════════════════════════════════════════
GPT-4 RESPONSE (1.2s)
════════════════════════════════════════
Machine learning is...

════════════════════════════════════════
GEMINI RESPONSE (0.9s)
════════════════════════════════════════
Machine learning involves...

════════════════════════════════════════
CLAUDE RESPONSE (1.4s)
════════════════════════════════════════
Machine learning is a subset...

>
```

### Exit

Type `exit` or `quit`:

```
> exit
Goodbye! 👋
```

## Troubleshooting

### "API key not found" error

Make sure your `.env` file exists and has your OpenRouter keys:

```bash
cat .env | grep OPENROUTER_API_KEY
```

### Timeout errors

The default timeout is 30 seconds. Increase it in `.env`:

```env
REQUEST_TIMEOUT_MS=45000
```

### "Cannot find module" errors

Reinstall dependencies:

```bash
rm -rf node_modules
npm install
```

### Port already in use

The CLI doesn't use ports - it's purely a terminal app. Make sure you're running `npm run dev` from the correct directory.

## Building for production

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

Run it:

```bash
npm start
```

## Project Structure

```
ai-cli/
├── src/
│   ├── config/env.ts              # Configuration
│   ├── models/                    # AI Model implementations
│   │   ├── gpt.ts
│   │   ├── gemini.ts
│   │   └── claude.ts
│   ├── services/
│   │   └── aiOrchestrator.ts      # Main orchestration
│   ├── utils/
│   │   ├── logger.ts              # Logging
│   │   └── terminal.ts            # Terminal UI
│   └── index.ts                   # CLI entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Overview

1. **CLI Entry** (`index.ts`)
   - Displays welcome message
   - Prompts for user input
   - Passes prompt to orchestrator

2. **Orchestrator** (`services/aiOrchestrator.ts`)
   - Takes user prompt
   - Sends to all 3 models concurrently
   - Aggregates responses
   - Returns structured result

3. **Model Handlers** (`models/*.ts`)
   - Each model has its own file
   - Handles API calls to OpenRouter
   - Manages errors and timeouts
   - Returns typed responses

4. **Utilities**
   - Logger: Colored terminal output
   - Terminal: CLI interface helper

## API Integration

Each model uses the OpenRouter API format:

```
POST https://openrouter.ai/api/v1/chat/completions

Headers:
- Authorization: Bearer {API_KEY}
- Content-Type: application/json

Body:
{
  "model": "model_id",
  "messages": [{"role": "user", "content": "prompt"}]
}
```

## Performance

- **Orchestration time**: Typically 1-3 seconds
- **Concurrency**: All 3 models called simultaneously
- **Error handling**: If one model fails, others still respond
- **Timeout**: 30 seconds per request (configurable)

## Next Steps

1. **Add streaming**: See responses in real-time
2. **Add memory**: Keep conversation history
3. **Convert to API**: Add Express server for web integration
4. **Connect frontend**: Link to React/Next.js UI

## Support

For issues or questions:

1. Check the [README.md](README.md)
2. Review the [ROADMAP.md](ROADMAP.md)
3. Check OpenRouter documentation: https://openrouter.ai/docs
