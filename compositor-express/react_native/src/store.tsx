import React from 'react';
import type { GeneratedLyric, Suggestion } from './types';

interface DraftState {
  draft: (GeneratedLyric & { idea?: string; theme?: string | null; emotion?: string | null; style?: string | null }) | null;
  setDraft: (d: DraftState['draft']) => void;
  clearDraft: () => void;
  pendingAnalysis: { lyricId?: string; content: string; suggestions: Suggestion[] } | null;
  setPendingAnalysis: (p: DraftState['pendingAnalysis']) => void;
}

const Ctx = React.createContext<DraftState | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = React.useState<DraftState['draft']>(null);
  const [pendingAnalysis, setPendingAnalysis] = React.useState<DraftState['pendingAnalysis']>(null);
  const value = React.useMemo<DraftState>(() => ({
    draft, setDraft,
    clearDraft: () => setDraft(null),
    pendingAnalysis, setPendingAnalysis,
  }), [draft, pendingAnalysis]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): DraftState {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
