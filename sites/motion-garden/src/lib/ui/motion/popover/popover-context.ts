import { getContext, setContext } from 'svelte';
import type { MotionValue } from '@humanspeak/svelte-motion';

export type Side = 'top' | 'bottom';
export type Align = 'start' | 'center' | 'end';
export type TriggerMode = 'click' | 'hover';

export interface PopoverContext {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
	openHover: () => void;
	scheduleClose: () => void;
	triggerMode: TriggerMode;
	side: Side;
	align: Align;
	gap: number;
	panelRadius: number;
	gooStrength: number;
	reduce: boolean;
	gooId: string;
	contentId: string;
	progress: MotionValue<number>;
	triggerRef: { current: HTMLElement | null };
	contentRef: { current: HTMLDivElement | null };
}

const KEY = Symbol('mg-popover');

export function setPopoverContext(ctx: PopoverContext) {
	setContext(KEY, ctx);
}

export function getPopoverContext(component: string) {
	const ctx = getContext<PopoverContext>(KEY);
	if (!ctx) throw new Error(`${component} must be used within <Popover>`);
	return ctx;
}
