import { create } from "zustand";

interface ExampleState {
  lastClickedCta: string | null;
  ctaClickCount: number;
  setLastClickedCta: (cta: string) => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  lastClickedCta: null,
  ctaClickCount: 0,
  setLastClickedCta: (cta) =>
    set((state) => ({
      lastClickedCta: cta,
      ctaClickCount: state.ctaClickCount + 1,
    })),
}));
