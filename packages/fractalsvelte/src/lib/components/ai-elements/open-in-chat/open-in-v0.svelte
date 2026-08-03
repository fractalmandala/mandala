<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuItem } from "$lib/components/dropdown-menu/index.js";

	export type OpenInV0Props = ComponentProps<typeof DropdownMenuItem>;
</script>

<script lang="ts">
	import { getOpenInContext, providers } from "./open-in-context.svelte.js";
	import V0Icon from "./v0-icon.svelte";

	let { ref = $bindable(null), ...restProps }: OpenInV0Props = $props();

	const context = getOpenInContext();
	const url = $derived(providers.v0.createUrl(context.query));
</script>

<DropdownMenuItem bind:ref data-slot="open-in-item" data-provider="v0" {...restProps}>
	{#snippet child({ props })}
		<a href={url} rel="noopener noreferrer" target="_blank" {...props}>
			<span data-slot="open-in-item-icon">
				<V0Icon size="1em" />
			</span>
			<span data-slot="open-in-item-label">{providers.v0.title}</span>
		</a>
	{/snippet}
</DropdownMenuItem>
