<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type WebPreviewBodyProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		loading?: Snippet;
		src?: string;
	};
</script>

<script lang="ts">
	import { getWebPreviewContext } from "./web-preview-context.svelte.js";

	let {
		loading,
		src,
		ref = $bindable(null),
		...restProps
	}: WebPreviewBodyProps = $props();

	let context = getWebPreviewContext();
	let finalSrc = $derived((src ?? context.url) || undefined);
</script>

<div bind:this={ref} data-slot="web-preview-body" {...restProps}>
	<iframe
		data-slot="web-preview-iframe"
		sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
		src={finalSrc}
		title="Preview"
	></iframe>
	{#if loading}
		{@render loading()}
	{/if}
</div>
