<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuItem } from "$lib/components/dropdown-menu/index.js";

	export type OpenInSciraProps = ComponentProps<typeof DropdownMenuItem>;
</script>

<script lang="ts">
	import { getOpenInContext, providers } from "./open-in-context.svelte.js";
	import SciraIcon from "./scira-icon.svelte";

	let { ref = $bindable(null), ...restProps }: OpenInSciraProps = $props();

	const context = getOpenInContext();
	const url = $derived(providers.scira.createUrl(context.query));
</script>

<DropdownMenuItem bind:ref data-slot="open-in-item" data-provider="scira" {...restProps}>
	{#snippet child({ props })}
		<a href={url} rel="noopener noreferrer" target="_blank" {...props}>
			<span data-slot="open-in-item-icon">
				<SciraIcon size="1em" />
			</span>
			<span data-slot="open-in-item-label">{providers.scira.title}</span>
		</a>
	{/snippet}
</DropdownMenuItem>
