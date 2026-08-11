<script lang="ts">
	import { MotionConfig, useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import {
		setTabsContext,
		TABS_TRANSITION,
		type TabsContext,
		type TabsVariant
	} from './tabs-context.js';
	import { useId } from '$lib/ui/lib/use-id.js';
	import './tabs.sass';

	let {
		defaultValue,
		value,
		onValueChange,
		variant = 'pill',
		children,
		class: className
	}: {
		defaultValue?: string;
		value?: string;
		onValueChange?: (v: string) => void;
		variant?: TabsVariant;
		children: Snippet;
		class?: string;
	} = $props();

	const reduce = useReducedMotion();
	const layoutId = useId();

	// Shared state behind the context: children read through getters so their
	// $derived expressions re-track when this object mutates. Props are read
	// once here by design (defaults), so untrack silences the snapshot lint.
	import { untrack } from 'svelte';
	let shared = $state(untrack(() => ({ value: defaultValue ?? '', variant })));

	const controlled = $derived(value !== undefined);

	$effect(() => {
		// Controlled mode mirrors the incoming value into the shared state.
		if (value !== undefined) shared.value = value;
	});
	$effect(() => {
		shared.variant = variant;
	});

	function setValue(next: string) {
		if (!controlled) shared.value = next;
		onValueChange?.(next);
	}

	const ctx: TabsContext = {
		get value() {
			return shared.value;
		},
		setValue,
		layoutId,
		get variant() {
			return shared.variant;
		}
	};
	setTabsContext(ctx);
</script>

<MotionConfig transition={$reduce ? { duration: 0 } : TABS_TRANSITION}>
	<!-- The vendor scoped projection with layoutRoot; svelte-motion keeps it
	     internal. The indicator only ever travels within the list, so
	     page-space projection scoping is unnecessary. -->
	<div data-slot="tabs" data-variant={variant} class={className}>
		{@render children()}
	</div>
</MotionConfig>
