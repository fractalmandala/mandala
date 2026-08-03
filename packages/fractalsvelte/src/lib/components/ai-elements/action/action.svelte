<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type ActionProps = Omit<ComponentProps<typeof Button>, 'href'> & {
		/** Text shown in a tooltip on hover/focus. Wraps the button in Tooltip when set. */
		tooltip?: string;
		/** Accessible label for the button. Falls back to `tooltip` when omitted. */
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
		// source size-9 / p-1.5 ≈ icon-sm (2rem square)
		size = 'icon-sm',
		children,
		ref = $bindable(null),
		...restProps
	}: ActionProps = $props();

	const srOnlyLabel = $derived(label || tooltip);
</script>

{#snippet actionButton({ props }: { props?: Record<string, unknown> })}
	<!--
		TooltipTrigger can inject data-slot / data-variant / data-size that would
		clobber Button. Strip them so Button remains the skin source of truth.
		Chrome marker is data-action — never rename data-slot away from "button".
	-->
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
		data-action="true"
		{...mergeProps(cleaned, restProps)}
	>
		{@render children?.()}
		{#if srOnlyLabel}
			<span data-slot="action-label">{srOnlyLabel}</span>
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
