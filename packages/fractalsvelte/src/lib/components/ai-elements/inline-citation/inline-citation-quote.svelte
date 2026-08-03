<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLBlockquoteAttributes } from "svelte/elements";

	export type InlineCitationQuoteProps = WithElementRef<HTMLBlockquoteAttributes>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationQuoteProps = $props();
</script>

<blockquote
	bind:this={ref}
	data-slot="inline-citation-quote"
	{...restProps}
>
	{@render children?.()}
</blockquote>
