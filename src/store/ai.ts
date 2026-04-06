import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/data/products';

export interface AIConfig {
  workstations: Product[];
  nas?: Product | null;
  server?: Product | null;
  peripherals: Product[];
  explanation: string;
  total: number;
}

export interface SavedConfig {
  id: string;
  name: string;
  query: string;
  config: AIConfig;
  savedAt: string;
}

export interface AILogEntry {
  id: string;
  query: string;
  responseMs: number;
  total: number;
  itemCount: number;
  timestamp: string;
}

interface AIStore {
  savedConfigs: SavedConfig[];
  logs: AILogEntry[];

  saveConfig: (name: string, query: string, config: AIConfig) => void;
  deleteConfig: (id: string) => void;

  addLog: (entry: Omit<AILogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      savedConfigs: [],
      logs: [],

      saveConfig: (name, query, config) =>
        set((s) => ({
          savedConfigs: [
            {
              id: Date.now().toString(36),
              name,
              query,
              config,
              savedAt: new Date().toISOString(),
            },
            ...s.savedConfigs,
          ],
        })),

      deleteConfig: (id) =>
        set((s) => ({ savedConfigs: s.savedConfigs.filter((c) => c.id !== id) })),

      addLog: (entry) =>
        set((s) => ({
          logs: [
            {
              ...entry,
              id: Date.now().toString(36),
              timestamp: new Date().toISOString(),
            },
            ...s.logs.slice(0, 199),
          ],
        })),

      clearLogs: () => set({ logs: [] }),
    }),
    { name: 'techpro-ai' }
  )
);
