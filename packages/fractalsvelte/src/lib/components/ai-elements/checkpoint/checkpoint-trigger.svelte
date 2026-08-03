<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type CheckpointTriggerProps = Omit<ComponentProps<typeof Button>, 'href'> & {
		/** When set, wraps the button in a tooltip. */
		tooltip?: string;
	};
</script>

<script lang="ts">
	import { mergeProps } from 'bits-ui';
	import * as Tooltip from '$lib/components/tooltip/index.js';

	let {
		children,
		variant = 'ghost',
		size = 'sm',
		tooltip,
		ref = $bindable(null),
		...restProps
	}: CheckpointTriggerProps = $props();
</script>

{#snippet triggerButton({ props }: { props?: Record<string, unknown> })}
	{@const cleaned = (() => {
		if (!props) return {};
		const { 'data-slot': _s, 'data-variant': _v, 'data-size': _sz, ...rest } = props as Record<
			string,
			unknown
		>;
		return rest;
	})()}
	<!-- Keep data-slot=button so button.sass applies; chrome via data-checkpoint-trigger. -->
	<Button
		bind:ref
		{variant}
		{size}
		type="button"
		data-checkpoint-trigger="true"
		{...mergeProps(cleaned, restProps)}
	>
		{@render children?.()}
	</Button>
{/snippet}

{#if tooltip}
	<Tooltip.Provider>
		<Tooltip.Root delayDuration={150}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					{@render triggerButton({ props })}
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom" align="start">
				<p>{tooltip}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{:else}
	{@render triggerButton({})}
{/if}
