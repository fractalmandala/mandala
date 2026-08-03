<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Root as DropdownMenuRoot } from "$lib/components/dropdown-menu/index.js";

	export type OpenInChatProps = ComponentProps<typeof DropdownMenuRoot> & {
		query: string;
	};
</script>

<script lang="ts">
	import { createOpenInContext } from "./open-in-context.svelte.js";
	import { untrack } from "svelte";
	import { watch } from "runed";

	let {
		query,
		children,
		open = $bindable(false),
		...restProps
	}: OpenInChatProps = $props();

	let contextInstance = createOpenInContext(untrack(() => query));

	watch(
		() => query,
		() => {
			contextInstance.query = query;
		}
	);
</script>

<DropdownMenuRoot bind:open {...restProps}>
	{@render children?.()}
</DropdownMenuRoot>
