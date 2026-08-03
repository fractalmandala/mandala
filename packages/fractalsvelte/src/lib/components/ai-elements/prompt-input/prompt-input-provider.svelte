<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type PromptInputProviderProps = {
		initialInput?: string;
		accept?: string;
		multiple?: boolean;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { Controller, setPromptInputProvider } from "./provider.svelte.js";
	import { untrack } from "svelte";

	let {
		initialInput = "",
		accept,
		multiple,
		children,
	}: PromptInputProviderProps = $props();

	let controller = new Controller(
		untrack(() => initialInput),
		untrack(() => accept),
		untrack(() => multiple)
	);
	setPromptInputProvider(controller);
</script>

{#if children}
	{@render children()}
{/if}
