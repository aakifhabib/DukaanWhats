import { create } from 'zustand';
type CartItem = { id: string; name: string; price: number; qty: number; };
type CartStore = { items: CartItem[]; add: (i: CartItem) => void; clear: () => void; total: () => number; };
export const useCart = create<CartStore>((set, get) => ({
  items: [],
  add: (item) => {
    const ex = get().items.find(i => i.id === item.id);
    if (ex) set({ items: get().items.map(i => i.id === item.id ? {...i, qty: i.qty + item.qty} : i) });
    else set({ items: [...get().items, item] });
  },
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
}));
