import { getContext, setContext } from 'svelte';

export interface SharedLayoutBgContext {
	activeId: string | null;
	setActive: (id: string | null) => void;
	layoutId: string;
	inset: number;
	reduce: boolean;
	pillClassName?: string;
	pillContainerClassName?: string;
}

const KEY = Symbol('mg-shared-layout-bg');

export function setSharedLayoutBgContext(ctx: SharedLayoutBgContext) {
	setContext(KEY, ctx);
}

export function getSharedLayoutBgContext(component: string) {
	const ctx = getContext<SharedLayoutBgContext>(KEY);
	if (!ctx) throw new Error(`${component} must be used within <SharedLayoutBg>`);
	return ctx;
}
