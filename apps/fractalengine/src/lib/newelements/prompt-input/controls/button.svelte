<script lang="ts">
    import { cn } from "$lib/newelements/utils";
    import { Button } from "$lib/newelements/ui/button";
    import type { ButtonProps, ButtonVariant } from "$lib/newelements/ui/button/index";

    // Omit the original 'size' prop from ButtonProps so we can redefine it as a number
    interface Props extends Omit<ButtonProps, "size"> {
        class?: string;
        children?: import("svelte").Snippet;
        variant?: ButtonVariant;
        size?: number; 
    }

    let { variant = "ghost", class: className, size, children, ...props }: Props = $props();

    let hasMultipleChildren = $derived.by(() => {
        return size !== undefined;
    });

    let newSize = $derived.by((): "default" | "icon" => {
        return (size ?? hasMultipleChildren) ? "default" : "icon";
    });
</script>

<Button
    class={cn(
        "shrink-0 gap-1.5 rounded-lg",
        variant === "ghost" && "text-muted-foreground",
        newSize === "default" && "px-3",
        className
    )}
    size={newSize}
    type="button"
    {variant}
    {...props}
>
    {#if children}
        {@render children()}
    {/if}
</Button>