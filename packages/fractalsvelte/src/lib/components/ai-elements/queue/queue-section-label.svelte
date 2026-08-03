<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type QueueSectionLabelProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		count?: number;
		label: string;
		/** Optional leading icon snippet (before the label text). */
		icon?: Snippet;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		count,
		label,
		icon,
		children,
		ref = $bindable(null),
		...restProps
	}: QueueSectionLabelProps = $props();
</script>

<span bind:this={ref} data-slot="queue-section-label" {...restProps}>
	<span data-slot="queue-section-chevron" aria-hidden="true">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	</span>
	{#if icon}
		<span data-slot="queue-section-icon" aria-hidden="true">{@render icon()}</span>
	{/if}
	<span data-slot="queue-section-label-text">
		{#if count !== undefined}
			{count}{' '}
		{/if}{label}
	</span>
	{@render children?.()}
</span>
