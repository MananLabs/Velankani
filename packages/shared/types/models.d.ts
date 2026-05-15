export type AIProvider = 'anthropic' | 'openai' | 'google' | 'perplexity' | 'xai' | 'meta' | 'deepseek' | 'mistral';
export interface AIModel {
    id: string;
    name: string;
    provider: AIProvider;
    openRouterId: string;
    directApiModel?: string;
    creditsPerMessage: number;
    contextWindow: number;
    description: string;
    badge?: string;
    color: string;
    available: boolean;
    supportsVision: boolean;
    supportsSearch: boolean;
}
export declare const AI_MODELS: AIModel[];
export declare const CONSENSUS_MODEL_IDS: readonly ["claude-sonnet-4", "gpt-4o", "gemini-1-5-pro"];
export declare const CONSENSUS_CREDITS = 19;
export declare const getModel: (id: string) => AIModel | undefined;
export declare const getAvailableModels: () => AIModel[];
export declare const getModelsByProvider: (provider: AIProvider) => AIModel[];
