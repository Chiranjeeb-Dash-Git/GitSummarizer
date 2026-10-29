import { create } from 'zustand';

let nextId = 1;

export const useToasts = create((set) => ({
  items: [],
  push: (tone, message) => {
    const id = nextId++;
    set((s) => ({ items: [...s.items.slice(-2), { id, tone, message }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 3800);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (m) => useToasts.getState().push('success', m),
  error: (m) => useToasts.getState().push('error', m),
  info: (m) => useToasts.getState().push('info', m),
};

