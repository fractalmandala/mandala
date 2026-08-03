<script lang="ts" module>
	import type { Radius, TextSize, TextTransform } from "$lib/types.js";
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	// shadcn expresses these as a tailwind-variants `tv()` matrix mapping each option to a
	// `cn-button-variant-*` class. Here they are plain props rendered as data attributes,
	// which button.sass nests on. Same surface, no class-string machinery.
	export type ButtonVariant =
		| "default"
		| "outline"
		| "secondary"
		| "ghost"
		| "destructive"
		| "link";

	export type ButtonSize =
		| "default"
		| "xs"
		| "sm"
		| "lg"
		| "icon"
		| "icon-xs"
		| "icon-sm"
		| "icon-lg";

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			/** Overrides the skin's pill radius. Omit to keep it. */
			radius?: Radius;
			/** Overrides the font-size that `size` would otherwise set. */
			textSize?: TextSize;
			textTransform?: TextTransform;
		};
</script>

<script lang="ts">
	let {
		variant = "default",
		size = "default",
		radius,
		textSize,
		textTransform,
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		data-variant={variant}
		data-size={size}
		data-radius={radius}
		data-text-size={textSize}
		data-transform={textTransform}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		data-variant={variant}
		data-size={size}
		data-radius={radius}
		data-text-size={textSize}
		data-transform={textTransform}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
