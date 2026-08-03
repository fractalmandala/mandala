<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuItem } from "$lib/components/dropdown-menu/index.js";

	export type OpenInClaudeProps = ComponentProps<typeof DropdownMenuItem>;
</script>

<script lang="ts">
	import { getOpenInContext, providers } from "./open-in-context.svelte.js";
	import ClaudeIcon from "./claude-icon.svelte";

	let { ref = $bindable(null), ...restProps }: OpenInClaudeProps = $props();

	const context = getOpenInContext();
	const url = $derived(providers.claude.createUrl(context.query));
</script>

<DropdownMenuItem bind:ref data-slot="open-in-item" data-provider="claude" {...restProps}>
	{#snippet child({ props })}
		<a href={url} rel="noopener noreferrer" target="_blank" {...props}>
			<span data-slot="open-in-item-icon">
				<ClaudeIcon size="1em" />
			</span>
			<span data-slot="open-in-item-label">{providers.claude.title}</span>
		</a>
	{/snippet}
</DropdownMenuItem>
