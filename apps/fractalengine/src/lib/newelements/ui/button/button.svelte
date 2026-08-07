<script lang="ts" module>
    import { cn, type WithElementRef } from "$lib/newelements/utils";
    import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

    // 1. Manually specify the literal types so TypeScript stays happy
    export type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
    export type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

    // 2. Dummy variant function that strips out Tailwind and outputs plain class hooks
    export function buttonVariants(options?: { variant?: ButtonVariant; size?: ButtonSize }) {
        const variant = options?.variant || "default";
        const size = options?.size || "default";
        return `btn-base btn-${variant} btn-size-${size}`;
    }

    export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
        WithElementRef<HTMLAnchorAttributes> & {
            variant?: ButtonVariant;
            size?: ButtonSize;
        };
</script>

<script lang="ts">
    let {
        class: className,
        variant = "default",
        size = "default",
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
        class={cn(buttonVariants({ variant, size }), className)}
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
        class={cn(buttonVariants({ variant, size }), className)}
        {type}
        {disabled}
        {...restProps}
    >
        {@render children?.()}
    </button>
{/if}