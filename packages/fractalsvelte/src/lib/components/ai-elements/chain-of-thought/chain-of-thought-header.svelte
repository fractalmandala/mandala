<script lang="ts" module>
	import type { WithoutChildren } from '$lib/utils.js';
	import type { ComponentProps, Snippet } from 'svelte';
	import { CollapsibleTrigger } from '$lib/components/collapsible/index.js';

	export type ChainOfThoughtHeaderProps = WithoutChildren<
		ComponentProps<typeof CollapsibleTrigger>
	> & {
		/** Leading icon; defaults to a brain glyph. Pass a snippet or `false` to hide. */
		icon?: Snippet | false;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getChainOfThoughtContext } from './chain-of-thought-context.svelte.js';

	let {
		children,
		icon,
		ref = $bindable(null),
		...restProps
	}: ChainOfThoughtHeaderProps = $props();

	const context = getChainOfThoughtContext();
</script>

<!-- Overrides collapsible-trigger chrome with a quiet text trigger (matches source). -->
<CollapsibleTrigger
	bind:ref
	data-slot="chain-of-thought-header"
	data-open={context.isOpen || undefined}
	{...restProps}
>
	{#if icon === false}
		<!-- no leading icon -->
	{:else if icon}
		<span data-slot="chain-of-thought-header-icon" aria-hidden="true">{@render icon()}</span>
	{:else}
		<span data-slot="chain-of-thought-header-icon" aria-hidden="true">
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
	{/if}
	<span data-slot="chain-of-thought-header-title">
		{#if children}
			{@render children()}
		{:else}
			Chain of Thought
		{/if}
	</span>
	<span data-slot="chain-of-thought-header-chevron" aria-hidden="true">
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
</CollapsibleTrigger>
