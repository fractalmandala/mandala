<script lang="ts">
  let {
    shimmerWidth = '100px',
    class: className = '',
    children,
    ...rest
  }: {
    shimmerWidth?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<span class="animated-shiny-text {className}" style="--shiny-width: {shimmerWidth}" {...rest}>
  {@render children?.()}
</span>

<style lang="sass">
  .animated-shiny-text
    display: inline-block
    margin-left: auto
    margin-right: auto
    max-width: 28rem
    color: hsl(0 0% 0% / 0.7)
    background-size: var(--shiny-width, 100px) 100%
    background-position: 0 0
    background-repeat: no-repeat
    background-clip: text
    -webkit-background-clip: text
    background-image: linear-gradient(to right, transparent, hsl(0 0% 0% / 0.8) 50%, transparent)
    transition: background-position 1s cubic-bezier(0.6, 0.6, 0, 1) infinite
    animation: shiny-text-slide calc(3s) cubic-bezier(0.6, 0.6, 0, 1) infinite

    @keyframes shiny-text-slide
      0%
        background-position: 0 0
      100%
        background-position: calc(var(--shiny-width, 100px) * -1) 0

    @media (prefers-color-scheme: dark)
      color: hsl(0 0% 100% / 0.7)
      background-image: linear-gradient(to right, transparent, hsl(0 0% 100% / 0.8) 50%, transparent)

    @media (prefers-reduced-motion: reduce)
      animation: none
      background-position: 0 0
</style>
