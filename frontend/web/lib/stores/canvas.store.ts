// ═══════════════════════════════════════════════════════════
// VEL AI — Canvas Store (Zustand)
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setCanvasState: (nodes: Node[], edges: Edge[]) => void;
  getContextSources: (tileId: string) => string[];
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  addEdge: (edge) => {
    const exists = get().edges.find(
      (e) => e.source === edge.source && e.target === edge.target,
    );
    if (!exists) {
      set({ edges: [...get().edges, edge] });
    }
  },

  removeEdge: (id) => {
    set({ edges: get().edges.filter((e) => e.id !== id) });
  },

  setSelectedNode: (id) => {
    set({ selectedNodeId: id });
  },

  setCanvasState: (nodes, edges) => {
    set({ nodes, edges });
  },

  // Get all tile IDs that have edges pointing TO this tile (context sources)
  getContextSources: (tileId) => {
    return get()
      .edges.filter((e) => e.target === tileId)
      .map((e) => e.source);
  },
}));
