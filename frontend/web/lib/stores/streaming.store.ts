'use client';

import { create } from 'zustand';

type StreamStatus = 'idle' | 'pending' | 'streaming' | 'complete' | 'error';

interface StreamState {
  status: StreamStatus;
  content: string;
  tokenCount: number;
  startedAt: number | null;
  error: string | null;
}

interface StreamingStore {
  streams: Record<string, StreamState>;
  startStream: (tileId: string) => void;
  appendToken: (tileId: string, token: string) => void;
  completeStream: (tileId: string, totalTokens: number) => void;
  errorStream: (tileId: string, error: string) => void;
  abortStream: (tileId: string) => void;
  clearStream: (tileId: string) => void;
  getStream: (tileId: string) => StreamState;
}

const DEFAULT_STREAM: StreamState = {
  status: 'idle',
  content: '',
  tokenCount: 0,
  startedAt: null,
  error: null,
};

const pendingTokens: Record<string, string> = {};
const rafIds: Record<string, number> = {};

export const useStreamingStore = create<StreamingStore>((set, get) => ({
  streams: {},

  startStream: (tileId) =>
    set((state) => ({
      streams: {
        ...state.streams,
        [tileId]: {
          status: 'pending',
          content: '',
          tokenCount: 0,
          startedAt: Date.now(),
          error: null,
        },
      },
    })),

  appendToken: (tileId, token) => {
    if (!pendingTokens[tileId]) {
      pendingTokens[tileId] = '';
    }
    pendingTokens[tileId] += token;

    if (!rafIds[tileId]) {
      rafIds[tileId] = requestAnimationFrame(() => {
        const buffered = pendingTokens[tileId] || '';
        pendingTokens[tileId] = '';
        delete rafIds[tileId];

        if (!buffered) return;

        set((state) => {
          const current = state.streams[tileId] || DEFAULT_STREAM;
          return {
            streams: {
              ...state.streams,
              [tileId]: {
                ...current,
                status: 'streaming',
                content: current.content + buffered,
                tokenCount: current.tokenCount + buffered.length,
              },
            },
          };
        });
      });
    }
  },

  completeStream: (tileId, totalTokens) => {
    if (rafIds[tileId]) {
      cancelAnimationFrame(rafIds[tileId]);
      delete rafIds[tileId];
    }
    const remaining = pendingTokens[tileId] || '';
    delete pendingTokens[tileId];

    set((state) => {
      const current = state.streams[tileId] || DEFAULT_STREAM;
      return {
        streams: {
          ...state.streams,
          [tileId]: {
            ...current,
            status: 'complete',
            content: current.content + remaining,
            tokenCount: totalTokens,
          },
        },
      };
    });
  },

  errorStream: (tileId, error) => {
    if (rafIds[tileId]) {
      cancelAnimationFrame(rafIds[tileId]);
      delete rafIds[tileId];
    }
    delete pendingTokens[tileId];

    set((state) => {
      const current = state.streams[tileId] || DEFAULT_STREAM;
      return {
        streams: {
          ...state.streams,
          [tileId]: { ...current, status: 'error', error },
        },
      };
    });
  },

  abortStream: (tileId) => {
    if (rafIds[tileId]) {
      cancelAnimationFrame(rafIds[tileId]);
      delete rafIds[tileId];
    }
    delete pendingTokens[tileId];

    set((state) => {
      const current = state.streams[tileId] || DEFAULT_STREAM;
      return {
        streams: {
          ...state.streams,
          [tileId]: { ...current, status: 'idle' },
        },
      };
    });
  },

  clearStream: (tileId) =>
    set((state) => ({
      streams: {
        ...state.streams,
        [tileId]: { ...DEFAULT_STREAM },
      },
    })),

  getStream: (tileId) => get().streams[tileId] || DEFAULT_STREAM,
}));
