<script lang="ts">
	import * as DropdownMenu from "$lib/newelements/ui/dropdown-menu/index";
	import Button from "../controls/button.svelte";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<DropdownMenu.Trigger>
	{#snippet child({ props })}
		<Button class={className} {...props} {...restProps}>
			{#if children}
				{@render children()}
			{:else}
				<span class="tt-u text-xs w600">PLUS ICON</span>
			{/if}
		</Button>
	{/snippet}
</DropdownMenu.Trigger>
