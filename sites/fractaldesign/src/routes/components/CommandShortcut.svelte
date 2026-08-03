<script lang="ts">
  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<span class="command-shortcut {className}" data-slot="command-shortcut" {...rest}>
  {@render children?.()}
</span>

<style lang="sass">
  .command-shortcut
    margin-left: auto
    display: inline-flex
    align-items: center
    gap: 0.125rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.6875rem
    color: hsl(215 16% 47%)

    > kbd
      display: inline-flex
      align-items: center
      justify-content: center
      min-width: 1.25rem
      height: 1.25rem
      padding: 0 0.25rem
      border: 1px solid hsl(214 32% 91%)
      border-radius: 0.25rem
      background-color: hsl(0 0% 100%)
      font-size: 0.625rem
      color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      > kbd
        background-color: hsl(222 47% 6%)
        border-color: hsl(217 33% 17%)
        color: hsl(215 16% 65%)
</style>
