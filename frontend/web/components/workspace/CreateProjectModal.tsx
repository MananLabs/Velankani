'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { BaseModal } from '@/components/workspace/BaseModal';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [useMemory, setUseMemory] = useState(false);

  const canCreate = useMemo(() => projectName.trim().length > 1, [projectName]);

  return (
    <BaseModal open={open} onClose={onClose} titleId="create-project-title" widthClassName="max-w-2xl">
      <div className="flex items-start justify-between border-b border-[var(--vel-border-subtle)] px-6 py-5">
        <div>
          <h2 id="create-project-title" className="font-display text-2xl font-bold tracking-tight text-[var(--vel-text)]">
            Create New Project
          </h2>
          <p className="mt-2 text-sm text-[var(--vel-text-secondary)]">Configure project-level context for all chats in this workspace.</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="rounded-md p-1 text-[var(--vel-text-secondary)] transition-colors hover:bg-[var(--vel-card)] hover:text-[var(--vel-text)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="space-y-2">
          <label htmlFor="project-name" className="text-sm font-medium text-[var(--vel-text)]">
            Project Name
          </label>
          <input
            id="project-name"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value.slice(0, 50))}
            placeholder="Enter a project name"
            className="h-11 w-full rounded-lg border border-[var(--vel-border)] bg-[var(--vel-card)] px-3 text-sm text-[var(--vel-text)] outline-none transition-colors placeholder:text-[var(--vel-text-muted)] focus:border-[var(--vel-border-focus)]"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="system-prompt" className="text-sm font-medium text-[var(--vel-text)]">
            System Prompt
          </label>
          <textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value.slice(0, 5000))}
            placeholder="Define the default system prompt for this project"
            className="min-h-40 w-full rounded-lg border border-[var(--vel-border)] bg-[var(--vel-card)] px-3 py-2 text-sm text-[var(--vel-text)] outline-none transition-colors placeholder:text-[var(--vel-text-muted)] focus:border-[var(--vel-border-focus)]"
          />
          <p className="text-xs text-[var(--vel-text-muted)]">All chats in this project inherit this prompt unless overridden.</p>
        </div>

        <button
          onClick={() => setUseMemory((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-lg border border-[var(--vel-border)] bg-[var(--vel-card)] px-3 py-3 text-left"
          role="switch"
          aria-checked={useMemory}
        >
          <div>
            <p className="text-sm font-medium text-[var(--vel-text)]">Use account memory in this project</p>
            <p className="mt-1 text-xs text-[var(--vel-text-secondary)]">Share saved memory context with conversations in this project.</p>
          </div>
          <span className={`relative h-6 w-11 rounded-full border border-[var(--vel-border)] transition-colors ${useMemory ? 'bg-[var(--vel-violet-alpha-20)]' : 'bg-[var(--vel-overlay)]'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-[var(--vel-text)] transition-all ${useMemory ? 'left-5' : 'left-0.5'}`} />
          </span>
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--vel-border-subtle)] px-6 py-4">
        <button onClick={onClose} className="btn-ghost rounded-md px-4 py-2">
          Cancel
        </button>
        <button disabled={!canCreate} className="btn-primary rounded-md px-4 py-2">
          Create Project
        </button>
      </div>
    </BaseModal>
  );
}
