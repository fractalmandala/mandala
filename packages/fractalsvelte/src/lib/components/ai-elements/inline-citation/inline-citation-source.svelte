<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InlineCitationSourceProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title?: string;
		url?: string;
		description?: string;
	};
</script>

<script lang="ts">
	let {
		title,
		url,
		description,
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationSourceProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="inline-citation-source"
	{...restProps}
>
	{#if title}
		<h4 data-slot="source-title">{title}</h4>
	{/if}
	{#if url}
		<p data-slot="source-url">{url}</p>
	{/if}
	{#if description}
		<p data-slot="source-description">{description}</p>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
