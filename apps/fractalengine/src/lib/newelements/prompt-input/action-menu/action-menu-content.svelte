<script lang="ts">
	import { cn } from "$lib/newelements/utils";
	import * as DropdownMenu from "$lib/newelements/ui/dropdown-menu/index";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children, ...props }: Props = $props();
</script>

<DropdownMenu.Content preventScroll={false} align="start" class={cn(className)} {...props}>
	{#if children}
		{@render children()}
	{/if}
</DropdownMenu.Content>
