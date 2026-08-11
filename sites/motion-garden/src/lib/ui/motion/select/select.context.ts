import { getContext, setContext } from 'svelte';
import type { SelectContextValue } from './select.types.js';

const SELECT_CONTEXT = Symbol('select');

export function setSelectContext(ctx: SelectContextValue) {
	setContext(SELECT_CONTEXT, ctx);
}

export function useSelectContext(component: string): SelectContextValue {
	const ctx = getContext<SelectContextValue>(SELECT_CONTEXT);
	if (!ctx) throw new Error(`${component} must be used within <Select>`);
	return ctx;
}
