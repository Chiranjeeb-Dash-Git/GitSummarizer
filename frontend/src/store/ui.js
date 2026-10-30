import { create } from 'zustand';

export const useUI = create((set, get) => ({
  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),

  // Route-change wipe: 'idle' -> 'cover' (run navigation) -> 'reveal' -> 'idle'
  wipe: { phase: 'idle', action: null },
  startWipe: (action) => {
    if (get().wipe.phase !== 'idle') {
      action?.();
      return;
    }
    set({ wipe: { phase: 'cover', action } });
  },
  finishCover: () => {
    const { action } = get().wipe;
    action?.();
    set({ wipe: { phase: 'reveal', action: null } });
  },
  finishReveal: () => set({ wipe: { phase: 'idle', action: null } }),
  resetWipe: () => set({ wipe: { phase: 'idle', action: null } }),
}));
