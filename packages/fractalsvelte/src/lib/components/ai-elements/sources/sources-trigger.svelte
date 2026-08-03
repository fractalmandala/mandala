<script lang="ts" module>
	import type { ComponentProps, Snippet } from 'svelte';
	import { CollapsibleTrigger } from '$lib/components/collapsible/index.js';

	export type SourcesTriggerProps = Omit<
		ComponentProps<typeof CollapsibleTrigger>,
		'children'
	> & {
		/** Number of sources shown in the default label. */
		count: number;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		count,
		children,
		ref = $bindable(null),
		...restProps
	}: SourcesTriggerProps = $props();
</script>

<!-- Own data-slot overrides bordered collapsible-trigger chrome into a quiet text row. -->
<CollapsibleTrigger bind:ref data-slot="sources-trigger" {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<p data-slot="sources-trigger-title">Used {count} sources</p>
		<span data-slot="sources-chevron" aria-hidden="true">
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
	{/if}
</CollapsibleTrigger>
