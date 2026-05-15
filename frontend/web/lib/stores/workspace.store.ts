// ═══════════════════════════════════════════════════════════
// VEL AI — Workspace Store (Zustand)
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';

interface WorkspaceState {
  currentWorkspaceId: string | null;
  workspaceName: string;
  isSaving: boolean;
  lastSaved: number | null;
  setCurrentWorkspace: (id: string, name: string) => void;
  setSaving: (isSaving: boolean) => void;
  setLastSaved: (timestamp: number) => void;
  updateName: (name: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspaceId: null,
  workspaceName: 'Untitled Workspace',
  isSaving: false,
  lastSaved: null,

  setCurrentWorkspace: (id, name) =>
    set({ currentWorkspaceId: id, workspaceName: name }),

  setSaving: (isSaving) => set({ isSaving }),

  setLastSaved: (timestamp) =>
    set({ lastSaved: timestamp, isSaving: false }),

  updateName: (name) => set({ workspaceName: name }),
}));
