<script lang="ts" module>
	import type { ButtonProps } from "$lib/components/button/index.js";

	export type ArtifactCloseProps = ButtonProps;
</script>

<script lang="ts">
	import { Button } from "$lib/components/button/index.js";

	let {
		children,
		variant = "ghost",
		size = "icon-sm",
		ref = $bindable(null),
		...restProps
	}: ArtifactCloseProps = $props();
</script>

<Button
	bind:ref
	{variant}
	{size}
	{...restProps}
	data-artifact-close="true"
>
	{#if children}
		{@render children()}
	{:else}
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
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
		<span class="sr-only">Close</span>
	{/if}
</Button>
