'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles, X } from 'lucide-react';
import { BaseModal } from '@/components/workspace/BaseModal';

type Template = {
  id: string;
  name: string;
  description: string;
};

const TEMPLATES: Template[] = [
  { id: 'blank', name: 'Blank Workspace', description: 'Start from a clean setup' },
  { id: 'research', name: 'Research Workspace', description: 'Best for analysis and comparison' },
  { id: 'build', name: 'Build Workspace', description: 'Best for coding and iteration' },
  { id: 'content', name: 'Content Workspace', description: 'Best for writing and generation' },
];

interface NewWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewWorkspaceModal({ open, onClose }: NewWorkspaceModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('blank');

  const canCreate = useMemo(() => name.trim().length > 1, [name]);

  const createWorkspace = () => {
    if (!canCreate) return;

    router.push(
      `/workspace/new?name=${encodeURIComponent(name.trim())}&template=${encodeURIComponent(templateId)}`,
    );
    onClose();
  };

  return (
    <BaseModal open={open} onClose={onClose} titleId="create-workspace-title" widthClassName="max-w-3xl">
      <div className="flex items-start justify-between border-b border-[var(--vel-border-subtle)] px-6 py-5">
        <div>
          <h2 id="create-workspace-title" className="font-display text-2xl font-bold tracking-tight text-[var(--vel-text)]">
            Create Workspace
          </h2>
          <p className="mt-2 text-sm text-[var(--vel-text-secondary)]">Set up a new workspace with a template that fits your workflow.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-[var(--vel-text-secondary)] transition-colors hover:bg-[var(--vel-card)] hover:text-[var(--vel-text)]"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="space-y-2">
          <label htmlFor="workspace-name" className="text-sm font-medium text-[var(--vel-text)]">
            Workspace Name
          </label>
          <input
            id="workspace-name"
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 60))}
            placeholder="Enter workspace name"
            className="h-11 w-full rounded-lg border border-[var(--vel-border)] bg-[var(--vel-card)] px-3 text-sm text-[var(--vel-text)] outline-none transition-colors placeholder:text-[var(--vel-text-muted)] focus:border-[var(--vel-border-focus)]"
            autoFocus
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--vel-text)]">Choose a Template</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {TEMPLATES.map((template) => {
              const isActive = templateId === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setTemplateId(template.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    isActive
                      ? 'border-[var(--vel-border-focus)] bg-[var(--vel-violet-alpha-12)]'
                      : 'border-[var(--vel-border)] bg-[var(--vel-card)] hover:border-[var(--vel-border-focus)]/70'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--vel-text)]">
                    <Sparkles className="h-4 w-4 text-[var(--vel-violet)]" />
                    {template.name}
                  </div>
                  <p className="mt-1 text-xs text-[var(--vel-text-secondary)]">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--vel-border-subtle)] px-6 py-4">
        <button
          onClick={onClose}
          className="btn-ghost rounded-md px-4 py-2"
        >
          Cancel
        </button>
        <button
          onClick={createWorkspace}
          disabled={!canCreate}
          className="btn-primary inline-flex items-center gap-2 rounded-md px-4 py-2"
        >
          <Plus className="h-4 w-4" />
          Create Workspace
        </button>
      </div>
    </BaseModal>
  );
}
