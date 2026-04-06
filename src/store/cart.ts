import { create } from 'zustand';
import type { Product } from '@/data/products';

interface CartItem {
  product: Product;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product) => {
    const existing = get().items.find(i => i.product.id === product.id);
    if (existing) {
      set(state => ({
        items: state.items.map(i =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        ),
      }));
    } else {
      set(state => ({ items: [...state.items, { product, qty: 1 }] }));
    }
  },

  removeItem: (id) => {
    set(state => ({ items: state.items.filter(i => i.product.id !== id) }));
  },

  updateQty: (id, qty) => {
    if (qty < 1) {
      get().removeItem(id);
      return;
    }
    set(state => ({
      items: state.items.map(i =>
        i.product.id === id ? { ...i, qty } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),

  count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
}));
