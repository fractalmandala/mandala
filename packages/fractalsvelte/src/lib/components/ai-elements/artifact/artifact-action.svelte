<script lang="ts" module>
	import type { ButtonProps } from "$lib/components/button/index.js";
	import type { Snippet } from "svelte";

	export type ArtifactActionProps = ButtonProps & {
		/** Tooltip text. Wraps the button in Tooltip when provided. */
		tooltip?: string;
		/** Accessible button label. Defaults to tooltip. */
		label?: string;
		/** Optional icon snippet (prefer children for simple cases). */
		icon?: Snippet;
	};
</script>

<script lang="ts">
	import { mergeProps } from "bits-ui";
	import { Button } from "$lib/components/button/index.js";
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger,
	} from "$lib/components/tooltip/index.js";

	let {
		tooltip,
		label,
		icon,
		children,
		variant = "ghost",
		size = "icon-sm",
		ref = $bindable(null),
		...restProps
	}: ArtifactActionProps = $props();
</script>

{#snippet actionButton({ props }: { props?: Record<string, unknown> })}
	{@const { "data-slot": _slot, "data-variant": _tvariant, ...triggerProps } = props ?? {}}
	<Button
		bind:ref
		{variant}
		{size}
		{...mergeProps(triggerProps, restProps)}
		data-artifact-action="true"
	>
		{#if icon}
			{@render icon()}
		{:else if children}
			{@render children()}
		{/if}
		{#if label || tooltip}
			<span class="sr-only">{label || tooltip}</span>
		{/if}
	</Button>
{/snippet}

{#if tooltip}
	<TooltipProvider>
		<Tooltip delayDuration={150}>
			<TooltipTrigger>
				{#snippet child({ props })}
					{@render actionButton({ props })}
				{/snippet}
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
{:else}
	{@render actionButton({})}
{/if}
