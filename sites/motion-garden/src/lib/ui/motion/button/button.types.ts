import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
	MotionAnimate,
	MotionInitial,
	MotionTransition,
	MotionWhileHover,
	MotionWhileTap
} from '@humanspeak/svelte-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<HTMLButtonAttributes, 'children'> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	pressScale?: number;
	/** Spawn a Material-style ripple from the press point. Off by default. */
	ripple?: boolean;
	children?: Snippet;
	class?: string;
	// Motion overrides — consumers may tone down hover/tap feedback.
	// `null` explicitly disables the gesture animation (busy stateful buttons),
	// `undefined` keeps the built-in gesture.
	whileHover?: MotionWhileHover | null;
	whileTap?: MotionWhileTap | null;
	transition?: MotionTransition | undefined;
	animate?: MotionAnimate | undefined;
	initial?: MotionInitial | undefined;
	// MotionExit isn't re-exported by svelte-motion; MotionAnimate is the same
	// keyframe union minus nothing we use.
	exit?: MotionAnimate | undefined;
	layoutId?: string | undefined;
}

export interface ButtonLinkProps extends Omit<HTMLAnchorAttributes, 'children'> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	pressScale?: number;
	children?: Snippet;
	class?: string;
	whileHover?: MotionWhileHover | null;
	whileTap?: MotionWhileTap | null;
	transition?: MotionTransition | undefined;
}

export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export interface StatefulButtonProps extends Omit<ButtonProps, 'children'> {
	state?: ButtonState;
	children: Snippet;
	loadingText?: Snippet;
	successText?: Snippet;
	errorText?: Snippet;
	icon?: Snippet;
	/** Plain-text label; enables the per-letter roll cascade for string states. */
	label?: string;
}

export interface MagneticProps {
	children: Snippet;
	/** Magnetic pull strength. Default 0.35. */
	strength?: number;
	class?: string;
}

export interface MagneticButtonProps extends ButtonProps {
	/** Magnetic pull strength. Default 0.25. */
	strength?: number;
	/** Class applied to the magnetic wrapper. */
	magneticClass?: string;
}

export type Ripple = { id: number; x: number; y: number; size: number };
