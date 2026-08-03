<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	export type CommandInputProps = CommandPrimitive.InputProps & {
		searchIcon?: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(""),
		searchIcon,
		...restProps
	}: CommandInputProps = $props();
</script>

<div data-slot="command-input-wrapper">
	<span data-slot="command-input-icon" aria-hidden="true">
		{#if searchIcon}
			{@render searchIcon()}
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
		{/if}
	</span>
	<CommandPrimitive.Input
		bind:ref
		bind:value
		data-slot="command-input"
		{...restProps}
	/>
</div>
