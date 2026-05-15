import type { CapabilityShowcaseItem } from './types';

export const CAPABILITY_SHOWCASE_ITEMS: CapabilityShowcaseItem[] = [
  {
    title: 'Compare Top Models',
    description:
      'Ask once and instantly compare answers from GPT, Claude, Gemini, Grok, and more in a single thread.',
    prompt: 'Compare GPT vs Claude for this launch plan',
    previewTitle: 'Consensus',
    previewHandle: 'VEL AI Multi-Model View',
    previewBody: [
      'GPT: Strong structure and concrete go-to-market sequencing.',
      'Claude: Better risk framing and dependency mapping across teams.',
      'Gemini: Useful channel mix ideas for content and distribution.',
      'Recommended merge: GPT execution plan + Claude risk controls.',
    ],
  },
  {
    title: 'Deep Research',
    description:
      'Run web-backed analysis with citations so product and strategy decisions stay evidence-driven.',
    prompt: 'Research AI workspace pricing benchmarks',
    previewTitle: 'Research Brief',
    previewHandle: 'Pricing Intelligence Report',
    previewBody: [
      'Analyzed current public pricing pages across major AI assistant platforms.',
      'Most teams optimize for predictable monthly limits plus premium model access tiers.',
      'The strongest conversion pattern is clear per-model value explanations, not feature lists.',
      'Recommendation: keep one primary plan and position credit top-ups for power users.',
    ],
  },
  {
    title: 'Persistent Workspace',
    description:
      'Organize chats, documents, and model outputs on an infinite canvas so context is never lost.',
    prompt: 'Save this as Launch Workspace',
    previewTitle: 'workspace.ts',
    previewHandle: 'Q4 Product Launch',
    previewBody: [
      'const workspace = createWorkspace({',
      '  name: "Q4 Product Launch",',
      '  mode: "multi-model",',
      '  models: ["gpt", "claude", "gemini"],',
      '  tiles: ["strategy", "pricing", "messaging"],',
      '  memory: "persistent",',
      '});',
      '',
      'syncContext(workspace);',
      'shareAcrossTiles(workspace.id);',
    ],
  },
];
