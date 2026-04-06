import { create } from 'zustand';
import { PRODUCTS, SOFTWARE_COMPATIBILITY, type Product, type Category } from '@/data/products';

type CompatEntry = {
  cpu: string;
  gpu: string;
  ram: string;
  nas: boolean;
  server: boolean;
  note: string;
};

interface AdminStore {
  products: Product[];
  compatibility: Record<string, CompatEntry>;

  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addSoftware: (name: string, entry: CompatEntry) => void;
  updateSoftware: (name: string, entry: Partial<CompatEntry>) => void;
  deleteSoftware: (name: string) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  products: [...PRODUCTS],
  compatibility: { ...SOFTWARE_COMPATIBILITY },

  addProduct: (product) =>
    set((s) => ({ products: [...s.products, product] })),

  updateProduct: (id, data) =>
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  deleteProduct: (id) =>
    set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  addSoftware: (name, entry) =>
    set((s) => ({ compatibility: { ...s.compatibility, [name]: entry } })),

  updateSoftware: (name, entry) =>
    set((s) => ({
      compatibility: {
        ...s.compatibility,
        [name]: { ...s.compatibility[name], ...entry },
      },
    })),

  deleteSoftware: (name) =>
    set((s) => {
      const next = { ...s.compatibility };
      delete next[name];
      return { compatibility: next };
    }),
}));

export type { CompatEntry, Category };
