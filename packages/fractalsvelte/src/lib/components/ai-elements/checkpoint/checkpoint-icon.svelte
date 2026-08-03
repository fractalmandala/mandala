<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type CheckpointIconProps = {
		/** Pixel size for the default bookmark glyph. */
		size?: number;
		children?: Snippet;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	let { size = 16, children, ...restProps }: CheckpointIconProps = $props();
</script>

{#if children}
	<span data-slot="checkpoint-icon" {...restProps}>
		{@render children()}
	</span>
{:else}
	<span data-slot="checkpoint-icon" aria-hidden="true" {...restProps}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
		</svg>
	</span>
{/if}
