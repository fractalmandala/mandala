<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type AccordionTriggerProps = WithoutChild<AccordionPrimitive.TriggerProps> & {
		level?: AccordionPrimitive.HeaderProps['level'];
		closedIcon?: Snippet;
		openIcon?: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		level = 3,
		closedIcon,
		openIcon,
		children,
		...restProps
	}: AccordionTriggerProps = $props();
</script>

<AccordionPrimitive.Header {level} data-slot="accordion-header">
	<AccordionPrimitive.Trigger bind:ref data-slot="accordion-trigger" {...restProps}>
		{@render children?.()}
		<!-- Closed chevron (visible when collapsed). Open chevron swaps via aria-expanded. -->
		<span data-slot="accordion-trigger-icon" data-state="closed" aria-hidden="true">
			{#if closedIcon}
				{@render closedIcon()}
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="m6 9 6 6 6-6" />
				</svg>
			{/if}
		</span>
		<span data-slot="accordion-trigger-icon" data-state="open" aria-hidden="true">
			{#if openIcon}
				{@render openIcon()}
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="m18 15-6-6-6 6" />
				</svg>
			{/if}
		</span>
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
