<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	export type WebPreviewProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		defaultUrl?: string;
		onUrlChange?: (url: string) => void;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { WebPreviewContext, setWebPreviewContext } from "./web-preview-context.svelte.js";

	let {
		defaultUrl = "",
		onUrlChange,
		children,
		ref = $bindable(null),
		...restProps
	}: WebPreviewProps = $props();

	let context = new WebPreviewContext(
		untrack(() => defaultUrl),
		// svelte-ignore state_referenced_locally
		onUrlChange
	);
	setWebPreviewContext(context);
</script>

<div
	bind:this={ref}
	data-slot="web-preview"
	{...restProps}
>
	{@render children()}
</div>
