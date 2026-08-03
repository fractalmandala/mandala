<script lang="ts" module>
	import type { ComponentProps, Snippet } from "svelte";
	import { Button } from "$lib/components/button/index.js";

	export type WebPreviewNavigationButtonProps = ComponentProps<typeof Button> & {
		tooltip?: string;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger,
	} from "$lib/components/tooltip/index.js";

	let {
		onclick,
		disabled,
		tooltip,
		children,
		ref = $bindable(null),
		variant = "ghost",
		size = "icon-sm",
		...restProps
	}: WebPreviewNavigationButtonProps = $props();
</script>

{#snippet navButton({ props }: { props?: Record<string, unknown> })}
	{@const { "data-slot": _slot, "data-variant": _tvariant, ...triggerProps } = props ?? {}}
	<Button
		bind:ref
		{disabled}
		{onclick}
		{size}
		{variant}
		{...mergeProps(triggerProps, restProps)}
		data-web-preview-nav-button
		type="button"
	>
		{@render children()}
	</Button>
{/snippet}

{#if tooltip}
	<TooltipProvider>
		<Tooltip delayDuration={150}>
			<TooltipTrigger>
				{#snippet child({ props })}
					{@render navButton({ props })}
				{/snippet}
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
{:else}
	{@render navButton({})}
{/if}
