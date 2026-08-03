<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuItem } from "$lib/components/dropdown-menu/index.js";

	export type OpenInChatGPTProps = ComponentProps<typeof DropdownMenuItem>;
</script>

<script lang="ts">
	import { getOpenInContext, providers } from "./open-in-context.svelte.js";
	import ChatGPTIcon from "./chatgpt-icon.svelte";

	let { ref = $bindable(null), ...restProps }: OpenInChatGPTProps = $props();

	const context = getOpenInContext();
	const url = $derived(providers.chatgpt.createUrl(context.query));
</script>

<DropdownMenuItem bind:ref data-slot="open-in-item" data-provider="chatgpt" {...restProps}>
	{#snippet child({ props })}
		<a href={url} rel="noopener noreferrer" target="_blank" {...props}>
			<span data-slot="open-in-item-icon">
				<ChatGPTIcon size="1em" />
			</span>
			<span data-slot="open-in-item-label">{providers.chatgpt.title}</span>
		</a>
	{/snippet}
</DropdownMenuItem>
