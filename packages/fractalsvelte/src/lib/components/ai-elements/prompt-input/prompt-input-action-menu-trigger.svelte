<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import PromptInputButton from './prompt-input-button.svelte';

	export type PromptInputActionMenuTriggerProps = ComponentProps<typeof PromptInputButton>;
</script>

<script lang="ts">
	import * as DropdownMenu from '$lib/components/dropdown-menu/index.js';
	import { mergeProps } from 'bits-ui';

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputActionMenuTriggerProps = $props();
</script>

<DropdownMenu.Trigger>
	{#snippet child({ props })}
		{@const cleaned = (() => {
			const { 'data-slot': _s, ...rest } = (props ?? {}) as Record<string, unknown>;
			return rest;
		})()}
		<PromptInputButton bind:ref {...mergeProps(cleaned, restProps)}>
			{#if children}
				{@render children()}
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M5 12h14" />
					<path d="M12 5v14" />
				</svg>
				<span data-slot="prompt-input-sr-only">Open actions</span>
			{/if}
		</PromptInputButton>
	{/snippet}
</DropdownMenu.Trigger>
