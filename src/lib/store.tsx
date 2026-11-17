import { createContext, useContext } from 'react';

export type ViewMode = 'exec' | 'tech';
export interface AppState { mode: ViewMode; setMode: (m: ViewMode) => void; presenting: boolean; go: (id: string) => void; }
export const AppCtx = createContext<AppState>({ mode: 'exec', setMode: () => {}, presenting: false, go: () => {} });
export const useApp = () => useContext(AppCtx);
