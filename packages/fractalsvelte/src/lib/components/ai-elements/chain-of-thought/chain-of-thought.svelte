<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ChainOfThoughtProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Controlled open state. */
		open?: boolean;
		/** Uncontrolled initial open state when `open` is not bound. */
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
	};
</script>

<script lang="ts">
	import { Collapsible } from '$lib/components/collapsible/index.js';
	import {
		ChainOfThoughtContext,
		setChainOfThoughtContext
	} from './chain-of-thought-context.svelte.js';
	import { untrack } from 'svelte';

	let {
		open = $bindable(undefined),
		defaultOpen = false,
		onOpenChange,
		children,
		ref = $bindable(null),
		...restProps
	}: ChainOfThoughtProps = $props();

	const context = new ChainOfThoughtContext({
		isOpen: open !== undefined ? open : untrack(() => defaultOpen),
		// svelte-ignore state_referenced_locally
		onOpenChange: (value) => {
			onOpenChange?.(value);
			// Keep bind:open in sync when controlled
			if (open !== undefined) open = value;
		}
	});

	// Controlled mode: parent open → context
	$effect(() => {
		if (open !== undefined) {
			context.isOpen = open;
		}
	});

	setChainOfThoughtContext(context);
</script>

<Collapsible open={context.isOpen} onOpenChange={context.setIsOpen}>
	<div bind:this={ref} data-slot="chain-of-thought" data-open={context.isOpen || undefined} {...restProps}>
		{@render children?.()}
	</div>
</Collapsible>
