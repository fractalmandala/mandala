<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type MessageActionProps = Omit<ComponentProps<typeof Button>, 'href'> & {
		tooltip?: string;
		label?: string;
	};
</script>

<script lang="ts">
	import { mergeProps } from 'bits-ui';
	import * as Tooltip from '$lib/components/tooltip/index.js';

	let {
		tooltip,
		label,
		variant = 'ghost',
		// size-7 in source ≈ icon-sm (2rem); slightly smaller via data attr chrome
		size = 'icon-sm',
		children,
		ref = $bindable(null),
		...restProps
	}: MessageActionProps = $props();

	const srOnlyLabel = $derived(label || tooltip);
</script>

{#snippet actionButton({ props }: { props?: Record<string, unknown> })}
	<!-- Drop tooltip trigger data-slot so button skin stays intact -->
	{@const cleaned = (() => {
		if (!props) return {};
		const { 'data-slot': _s, 'data-variant': _v, 'data-size': _sz, ...rest } = props as Record<
			string,
			unknown
		>;
		return rest;
	})()}
	<Button
		bind:ref
		{variant}
		{size}
		type="button"
		data-message-action="true"
		{...mergeProps(cleaned, restProps)}
	>
		{@render children?.()}
		{#if srOnlyLabel}
			<span data-slot="message-action-label">{srOnlyLabel}</span>
		{/if}
	</Button>
{/snippet}

{#if tooltip}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					{@render actionButton({ props })}
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{tooltip}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{:else}
	{@render actionButton({})}
{/if}
