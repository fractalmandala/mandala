<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type SourceProps = WithElementRef<HTMLAnchorAttributes> & {
		/** Used in the default layout with the book glyph. */
		title?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		href,
		title,
		children,
		ref = $bindable(null),
		...restProps
	}: SourceProps = $props();
</script>

<a
	bind:this={ref}
	{href}
	rel="noreferrer"
	target="_blank"
	data-slot="source"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<span data-slot="source-icon" aria-hidden="true">
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
				<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
			</svg>
		</span>
		<span data-slot="source-title">{title}</span>
	{/if}
</a>
