<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { CollapsibleProps } from "$lib/components/collapsible/index.js";

	export type ToolProps = CollapsibleProps & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Collapsible } from "$lib/components/collapsible/index.js";

	let {
		open = $bindable(false),
		children,
		ref = $bindable(null),
		...restProps
	}: ToolProps = $props();
</script>

<Collapsible bind:ref bind:open data-tool data-slot="collapsible" {...restProps}>
	{@render children?.()}
</Collapsible>
