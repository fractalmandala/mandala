<script lang="ts" module>
	import type { ToasterProps } from "svelte-sonner";
	export type SonnerToasterProps = ToasterProps;
</script>

<script lang="ts">
	import { Toaster as Sonner } from "svelte-sonner";
	import { mode } from "mode-watcher";
	import { SpinnerIcon, CheckCircleIcon, XCircleIcon, InfoIcon, WarningIcon } from "phosphor-svelte";

	let { ...restProps }: SonnerToasterProps = $props();
</script>

<Sonner
	theme={mode.current}
	data-slot="sonner-toaster"
	style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border);"
	{...restProps}
>
	{#snippet loadingIcon()}<SpinnerIcon size={16} data-slot="sonner-spinner" />{/snippet}
	{#snippet successIcon()}<CheckCircleIcon size={16} />{/snippet}
	{#snippet errorIcon()}<XCircleIcon size={16} />{/snippet}
	{#snippet infoIcon()}<InfoIcon size={16} />{/snippet}
	{#snippet warningIcon()}<WarningIcon size={16} />{/snippet}
</Sonner>
