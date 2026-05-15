'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Lock, X } from 'lucide-react';
import { type AIModel } from '@vel-ai/shared/types/models';
import { useModelPreferencesStore } from '@/lib/stores/model-preferences.store';
import { BaseModal } from '@/components/workspace/BaseModal';

type ProviderKey = 'openai' | 'google' | 'deepseek' | 'anthropic' | 'perplexity' | 'xai';

type ProviderConfig = {
  id: ProviderKey;
  label: string;
  enabled: boolean;
  modelId: string;
  locked: boolean;
};

const PROVIDERS: Array<Omit<ProviderConfig, 'enabled' | 'modelId'>> = [
  { id: 'openai', label: 'OpenAI', locked: false },
  { id: 'google', label: 'Gemini', locked: false },
  { id: 'deepseek', label: 'DeepSeek', locked: true },
  { id: 'anthropic', label: 'Anthropic', locked: false },
  { id: 'perplexity', label: 'Perplexity', locked: true },
  { id: 'xai', label: 'xAI', locked: true },
];

interface ModelPreferencesModalProps {
  open: boolean;
  onClose: () => void;
  models: AIModel[];
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function ModelPreferencesModal({ open, onClose, models }: ModelPreferencesModalProps) {
  const { enabledModelIds, setEnabledModelIds } = useModelPreferencesStore();

  const modelsByProvider = useMemo(() => {
    const map = new Map<ProviderKey, AIModel[]>();
    for (const provider of PROVIDERS) map.set(provider.id, []);

    for (const model of models) {
      const provider = model.provider as ProviderKey;
      if (map.has(provider)) {
        map.get(provider)?.push(model);
      }
    }

    return map;
  }, [models]);

  const [providerConfigs, setProviderConfigs] = useState<ProviderConfig[]>([]);

  useEffect(() => {
    const defaults: ProviderConfig[] = PROVIDERS.map((provider) => {
      const providerModels = modelsByProvider.get(provider.id) ?? [];
      const enabledModel = providerModels.find((model) => enabledModelIds.includes(model.id));

      return {
        ...provider,
        enabled: provider.locked ? false : Boolean(enabledModel),
        modelId: enabledModel?.id ?? providerModels[0]?.id ?? '',
      };
    });

    setProviderConfigs(defaults);
  }, [modelsByProvider, enabledModelIds]);

  const savePreferences = () => {
    const nextEnabled = providerConfigs
      .filter((provider) => provider.enabled && !provider.locked)
      .map((provider) => provider.modelId)
      .filter(Boolean);

    if (nextEnabled.length > 0) {
      setEnabledModelIds(nextEnabled);
    }

    onClose();
  };

  return (
    <BaseModal open={open} onClose={onClose} titleId="model-preferences-title" widthClassName="max-w-3xl">
      <div className="flex items-start justify-between border-b border-[var(--vel-border-subtle)] px-6 py-5">
        <div>
          <h2 id="model-preferences-title" className="font-display text-2xl font-bold tracking-tight text-[var(--vel-text)]">
            AI Model Preferences
          </h2>
          <p className="mt-2 text-sm text-[var(--vel-text-secondary)]">
            Reorder providers, select default models, and control what stays active.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="rounded-md p-1 text-[var(--vel-text-secondary)] transition-colors hover:bg-[var(--vel-card)] hover:text-[var(--vel-text)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 px-6 py-5">
        {providerConfigs.map((provider, index) => {
          const providerModels = modelsByProvider.get(provider.id) ?? [];

          return (
            <div
              key={provider.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--vel-border)] bg-[var(--vel-card)] p-3 md:grid-cols-[88px_1fr_220px_110px] md:items-center"
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={() => index > 0 && setProviderConfigs((prev) => moveItem(prev, index, index - 1))}
                  className="rounded border border-[var(--vel-border)] p-1 text-[var(--vel-text-secondary)] disabled:opacity-40"
                  disabled={index === 0}
                  aria-label={`Move ${provider.label} up`}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    index < providerConfigs.length - 1 &&
                    setProviderConfigs((prev) => moveItem(prev, index, index + 1))
                  }
                  className="rounded border border-[var(--vel-border)] p-1 text-[var(--vel-text-secondary)] disabled:opacity-40"
                  disabled={index === providerConfigs.length - 1}
                  aria-label={`Move ${provider.label} down`}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--vel-text)]">{provider.label}</p>
                <p className="text-xs text-[var(--vel-text-secondary)]">Provider routing preference</p>
              </div>

              <select
                value={provider.modelId}
                onChange={(event) => {
                  const value = event.target.value;
                  setProviderConfigs((prev) =>
                    prev.map((entry) => (entry.id === provider.id ? { ...entry, modelId: value } : entry)),
                  );
                }}
                disabled={provider.locked || providerModels.length === 0}
                className="h-10 rounded-lg border border-[var(--vel-border)] bg-[var(--vel-overlay)] px-3 text-sm text-[var(--vel-text)] outline-none focus:border-[var(--vel-border-focus)] disabled:opacity-60"
              >
                {providerModels.length === 0 && <option value="">No models available</option>}
                {providerModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between md:justify-end">
                {provider.locked ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[var(--vel-border)] bg-[var(--vel-overlay)] px-2 py-1 text-xs text-[var(--vel-warning)]">
                    <Lock className="h-3 w-3" /> Premium
                  </span>
                ) : null}
                <button
                  onClick={() => {
                    if (provider.locked) return;
                    setProviderConfigs((prev) =>
                      prev.map((entry) =>
                        entry.id === provider.id ? { ...entry, enabled: !entry.enabled } : entry,
                      ),
                    );
                  }}
                  role="switch"
                  aria-checked={provider.enabled}
                  disabled={provider.locked}
                  className={`relative ml-3 h-6 w-11 rounded-full border border-[var(--vel-border)] transition-colors disabled:opacity-50 ${
                    provider.enabled ? 'bg-[var(--vel-violet-alpha-20)]' : 'bg-[var(--vel-overlay)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-[var(--vel-text)] transition-all ${
                      provider.enabled ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--vel-border-subtle)] px-6 py-4">
        <button onClick={onClose} className="btn-ghost rounded-md px-4 py-2">
          Cancel
        </button>
        <button onClick={savePreferences} className="btn-primary rounded-md px-4 py-2">
          Save Preferences
        </button>
      </div>
    </BaseModal>
  );
}
