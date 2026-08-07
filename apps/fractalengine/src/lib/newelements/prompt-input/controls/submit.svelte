<script lang="ts">
	import { cn } from "$lib/newelements/utils";
	import type { ChatStatus } from "../context/types";

	import {
		buttonVariants,
		type ButtonSize,
		type ButtonVariant,
	} from "$lib/newelements/ui/button/index";

	import type { HTMLButtonAttributes } from "svelte/elements";

	type SubmitClickEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};
	// indexing

	interface Props extends Omit<HTMLButtonAttributes, "type" | "onclick" | "aria-label"> {
		class?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		status?: ChatStatus;
		onStop?: () => void;
		ref?: HTMLButtonElement | null;
		onclick?: (event: SubmitClickEvent) => void;
		children?: import("svelte").Snippet;
	}

	let {
		class: className,
		ref = $bindable(null),
		variant = "default",
		size = "icon",
		status = "ready",
		onStop,
		onclick,
		children,
		...props
	}: Props = $props();

	let isGenerating = $derived(status === "submitted" || status === "streaming");

	let Icon = $derived.by(() => {
		if (status === "submitted") {
			return 'Loader';
		} else if (status === "streaming") {
			return 'Square';
		} else if (status === "error") {
			return 'X';
		}
		// for ready status, show send icon
		return 'Send';
	});

	let buttonType = $derived.by((): "button" | "submit" => {
		return isGenerating ? "button" : "submit";
	});

	let ariaLabel = $derived.by(() => {
		return isGenerating ? "Stop" : "Submit";
	});

	let iconClass = $derived.by(() => {
		if (status === "submitted") {
			return "size-4 animate-spin";
		}
		return "size-4";
	});

	let handleClick = (event: SubmitClickEvent) => {
		if (isGenerating) {
			event.preventDefault();
			onStop?.();
			return;
		}

		onclick?.(event);
	};
</script>

<button
	bind:this={ref}
	aria-label={ariaLabel}
	class={cn(buttonVariants({ variant, size }), "gap-1.5 rounded-lg", className)}
	data-slot="button"
	type={buttonType}
	onclick={handleClick}
	{...props}
>
	{#if children}
		{@render children()}
	{:else}
		<div class={iconClass}></div>
	{/if}
</button>
