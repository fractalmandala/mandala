<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuItem } from "$lib/components/dropdown-menu/index.js";

	export type OpenInT3Props = ComponentProps<typeof DropdownMenuItem>;
</script>

<script lang="ts">
	import { getOpenInContext, providers } from "./open-in-context.svelte.js";

	let { ref = $bindable(null), ...restProps }: OpenInT3Props = $props();

	const context = getOpenInContext();
	const url = $derived(providers.t3.createUrl(context.query));
</script>

<DropdownMenuItem bind:ref data-slot="open-in-item" data-provider="t3" {...restProps}>
	{#snippet child({ props })}
		<a href={url} rel="noopener noreferrer" target="_blank" {...props}>
			<span data-slot="open-in-item-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
				</svg>
			</span>
			<span data-slot="open-in-item-label">{providers.t3.title}</span>
		</a>
	{/snippet}
</DropdownMenuItem>
