<script lang="ts" module>
	import type { ComponentProps, Snippet } from 'svelte';
	import { CollapsibleTrigger } from '$lib/components/collapsible/index.js';

	export type TaskTriggerProps = Omit<ComponentProps<typeof CollapsibleTrigger>, 'children'> & {
		/** Default label when no children snippet is provided. */
		title: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		title,
		children,
		ref = $bindable(null),
		...restProps
	}: TaskTriggerProps = $props();
</script>

<!-- Own data-slot overrides bordered collapsible-trigger chrome into a muted text row. -->
<CollapsibleTrigger bind:ref data-slot="task-trigger" {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<span data-slot="task-trigger-inner">
			<span data-slot="task-trigger-icon" aria-hidden="true">
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
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
			</span>
			<p data-slot="task-trigger-title">{title}</p>
			<span data-slot="task-chevron" aria-hidden="true">
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
		</span>
	{/if}
</CollapsibleTrigger>
