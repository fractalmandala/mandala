<script lang="ts">
	import { untrack } from 'svelte';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { useId } from '$lib/ui/lib/use-id.js';
	import type { Placement, SelectContextValue, SelectProps } from './select.types.js';
	import { setSelectContext } from './select.context.js';
	import './select.sass';

	let {
		value,
		defaultValue,
		onValueChange,
		disabled = false,
		class: className,
		children
	}: SelectProps = $props();

	const reduce = useReducedMotion();
	const baseId = useId();

	let open = $state(false);
	let internal = $state<string | undefined>(untrack(() => defaultValue));
	let labels = $state<Map<string, string>>(new Map());
	let placement = $state<Placement>('bottom');
	let rootEl = $state<HTMLDivElement | null>(null);

	const isControlled = $derived(value !== undefined);
	const current = $derived(isControlled ? value : internal);

	function select(next: string) {
		if (!isControlled) internal = next;
		onValueChange?.(next);
		open = false;
	}

	function register(v: string, label: string) {
		if (labels.get(v) === label) return;
		labels = new Map(labels).set(v, label);
	}

	function unregister(v: string) {
		if (!labels.has(v)) return;
		const next = new Map(labels);
		next.delete(v);
		labels = next;
	}

	// Close on outside pointer / escape.
	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') open = false;
		};
		const onPointer = (e: PointerEvent) => {
			const root = untrack(() => rootEl);
			if (root && !root.contains(e.target as Node)) open = false;
		};
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', onPointer);
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', onPointer);
		};
	});

	const ctx = {
		get value() {
			return current;
		},
		get open() {
			return open;
		},
		get reduce() {
			return reduce.current;
		},
		get triggerId() {
			return `${baseId}-trigger`;
		},
		get listId() {
			return `${baseId}-list`;
		},
		get disabled() {
			return disabled;
		},
		get placement() {
			return placement;
		},
		setOpen(next: boolean) {
			open = next;
		},
		select,
		register,
		unregister,
		labelFor: (v: string | undefined) => (v === undefined ? undefined : labels.get(v)),
		setPlacement(p: Placement) {
			placement = p;
		}
	} satisfies SelectContextValue;

	setSelectContext(ctx);
</script>

<div bind:this={rootEl} data-slot="select" class={className}>
	{@render children()}
</div>
