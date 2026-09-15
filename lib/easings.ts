type Bezier = [number, number, number, number];

export const ease = {
  power1In: [0.11, 0, 0.5, 0],
  power1Out: [0.5, 1, 0.89, 1],
  power1InOut: [0.45, 0, 0.55, 1],

  power2In: [0.32, 0, 0.67, 0],
  power2Out: [0.33, 1, 0.68, 1],
  power2InOut: [0.65, 0, 0.35, 1],

  power3In: [0.5, 0, 0.75, 0],
  power3Out: [0.25, 1, 0.5, 1],
  power3InOut: [0.76, 0, 0.24, 1],

  power4In: [0.64, 0, 0.78, 0],
  power4Out: [0.22, 1, 0.36, 1],
  power4InOut: [0.83, 0, 0.17, 1],

  smoothInOut: [0.7, 0, 0, 1],
} satisfies Record<string, Bezier>;

export type EaseName = keyof typeof ease;
