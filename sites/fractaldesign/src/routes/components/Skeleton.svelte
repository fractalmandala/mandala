<script lang="ts">
  let {
    class: className = '',
    style = '',
    children,
    ...rest
  }: {
    class?: string;
    style?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="skeleton {className}" {style} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .skeleton
    display: block
    background-color: hsl(210 40% 96%)
    border-radius: 0.375rem
    animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite

    @keyframes skeleton-pulse
      0%, 100%
        opacity: 1
      50%
        opacity: 0.5

    @media (prefers-reduced-motion: reduce)
      animation: none
      opacity: 0.7

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
</style>
