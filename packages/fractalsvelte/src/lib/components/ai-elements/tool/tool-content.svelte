<script lang="ts" module>
	import type { Snippet } from "svelte";
	export type ToolContentProps = {
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	import { CollapsibleContent } from "$lib/components/collapsible/index.js";
	let { children, ...restProps }: ToolContentProps = $props();
</script>

<CollapsibleContent data-slot="tool-content" {...restProps}>
	{@render children?.()}
</CollapsibleContent>
