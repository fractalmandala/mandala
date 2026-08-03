<script lang="ts" module>
	export type { CodeOverflowProps } from "./types.js";
</script>

<script lang="ts">
	import { box } from "svelte-toolbelt";
	import { Button } from "$lib/components/button/index.js";
	import { useCodeOverflow } from "./code.svelte.js";
	import type { CodeOverflowProps } from "./types.js";

	let {
		collapsed = $bindable(true),
		children,
		...props
	}: CodeOverflowProps = $props();

	const state = useCodeOverflow({
		collapsed: box.with(
			() => collapsed,
			(v) => (collapsed = v)
		),
	});
</script>

<div {...props} data-slot="code-overflow" data-code-overflow data-collapsed={collapsed}>
	{@render children?.()}
	{#if collapsed}
		<div data-slot="code-overflow-fade"></div>
	{/if}
	<Button
		variant="secondary"
		size="sm"
		data-code-overflow-toggle
		data-collapsed={collapsed}
		onclick={state.toggleCollapsed}
	>
		{collapsed ? "Expand" : "Collapse"}
	</Button>
</div>
