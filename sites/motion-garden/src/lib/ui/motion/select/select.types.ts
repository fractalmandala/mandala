import type { Snippet } from 'svelte';

export type Placement = 'bottom' | 'top';

export interface SelectContextValue {
	value: string | undefined;
	open: boolean;
	setOpen: (open: boolean) => void;
	select: (value: string) => void;
	register: (value: string, label: string) => void;
	unregister: (value: string) => void;
	labelFor: (value: string | undefined) => string | undefined;
	reduce: boolean;
	triggerId: string;
	listId: string;
	disabled: boolean;
	placement: Placement;
	setPlacement: (p: Placement) => void;
}

export interface SelectProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	class?: string;
	children: Snippet;
}

export interface SelectTriggerProps {
	class?: string;
	children: Snippet;
}

export interface SelectValueProps {
	placeholder?: string;
	class?: string;
}

export interface SelectContentProps {
	class?: string;
	children: Snippet;
}

// React derives the label from string children; Svelte children are always a
// snippet, so items accept an explicit label (falls back to the value).
export interface SelectItemProps {
	value: string;
	label?: string;
	disabled?: boolean;
	class?: string;
	children: Snippet;
}
