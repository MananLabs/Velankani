export const SPRING_TILE = { type: 'spring' as const, stiffness: 300, damping: 30 };
export const SPRING_MODAL = { type: 'spring' as const, stiffness: 400, damping: 35 };
export const EASE_OUT_FAST = { duration: 0.15, ease: [0.0, 0.0, 0.2, 1] };
export const EASE_OUT_MEDIUM = { duration: 0.25, ease: [0.0, 0.0, 0.2, 1] };

export const tileEntrance = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: SPRING_TILE },
  exit: { opacity: 0, scale: 0.96, transition: EASE_OUT_FAST },
};

export const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: SPRING_MODAL },
  exit: { opacity: 0, scale: 0.95, transition: EASE_OUT_FAST },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

export const tokenVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.08 } },
};

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: EASE_OUT_MEDIUM },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: EASE_OUT_MEDIUM },
};

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: EASE_OUT_MEDIUM },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: SPRING_TILE },
};
