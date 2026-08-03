<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { DropdownMenuTrigger } from "$lib/components/dropdown-menu/index.js";

	export type OpenInTriggerProps = ComponentProps<typeof DropdownMenuTrigger>;
</script>

<script lang="ts">
	import { Button } from "$lib/components/button/index.js";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: OpenInTriggerProps = $props();
</script>

<DropdownMenuTrigger
	bind:ref
	data-slot="open-in-trigger"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<Button type="button" variant="outline" data-open-in-trigger-button>
			<span>Open in chat</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</Button>
	{/if}
</DropdownMenuTrigger>
