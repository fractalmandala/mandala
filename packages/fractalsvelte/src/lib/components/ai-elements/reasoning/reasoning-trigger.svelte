<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ComponentProps } from 'svelte';
	import { CollapsibleTrigger } from '$lib/components/collapsible/index.js';

	export type ReasoningTriggerProps = Omit<
		ComponentProps<typeof CollapsibleTrigger>,
		'children'
	> & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getReasoningContext } from './reasoning-context.svelte.js';

	let { children, ref = $bindable(null), ...props }: ReasoningTriggerProps = $props();

	const reasoningContext = getReasoningContext();

	const thinkingMessage = $derived.by(() => {
		const { isStreaming, duration } = reasoningContext;
		if (isStreaming || duration === 0) {
			return 'Thinking...';
		}
		if (duration === undefined) {
			return 'Thought for a few seconds';
		}
		return `Thought for ${duration} seconds`;
	});
</script>

<!-- Own data-slot overrides bordered collapsible-trigger chrome into a muted text row. -->
<CollapsibleTrigger
	bind:ref
	data-slot="reasoning-trigger"
	data-open={reasoningContext.isOpen || undefined}
	{...props}
>
	{#if children}
		{@render children()}
	{:else}
		<span data-slot="reasoning-icon" aria-hidden="true">
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
				<path
					d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"
				/>
				<path
					d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"
				/>
				<path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
				<path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
				<path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
				<path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
				<path d="M19.938 10.5a4 4 0 0 1 .585.396" />
				<path d="M6 18a4 4 0 0 1-1.967-.516" />
				<path d="M19.967 17.484A4 4 0 0 1 18 18" />
			</svg>
		</span>
		<p data-slot="reasoning-trigger-label">{thinkingMessage}</p>
		<span data-slot="reasoning-chevron" aria-hidden="true">
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
