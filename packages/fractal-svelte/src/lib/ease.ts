import type { MotionTransition } from '@humanspeak/svelte-motion';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const EASE_OUT_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_IN_OUT_CSS = 'cubic-bezier(0.77, 0, 0.175, 1)';
export const EASE_DRAWER_CSS = 'cubic-bezier(0.32, 0.72, 0, 1)';

/** Press feedback for buttons & interactive surfaces */
export const SPRING_PRESS: MotionTransition = { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 };
/** Slot swaps (text/icon rolls) */
export const SPRING_SWAP: MotionTransition = { type: 'spring', stiffness: 460, damping: 30, mass: 0.55 };
/** Overlay panels & modals */
export const SPRING_PANEL: MotionTransition = { type: 'spring', stiffness: 420, damping: 40, mass: 0.5 };
/** Shared-layout glides (pills, tab triggers) — used with layout/layoutId */
export const SPRING_LAYOUT: MotionTransition = { type: 'spring', stiffness: 360, damping: 32, mass: 0.6 };
/** Cursor-follow physics (magnetic) */
export const SPRING_MOUSE: MotionTransition = { stiffness: 200, damping: 15, mass: 0.3 };
/** Sliders & drag handles */
export const SPRING_GLIDE: MotionTransition = { stiffness: 700, damping: 50, mass: 0.5 };
