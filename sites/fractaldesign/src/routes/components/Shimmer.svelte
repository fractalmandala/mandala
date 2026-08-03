<script lang="ts">
  let {
    width = '100%',
    height = '1rem',
    class: className = '',
    ...rest
  }: {
    width?: string;
    height?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="shimmer {className}" style="width: {width}; height: {height}" {...rest}></div>

<style lang="sass">
  .shimmer
    display: block
    background: linear-gradient(90deg, hsl(214 32% 91%) 25%, hsl(210 40% 96%) 50%, hsl(214 32% 91%) 75%)
    background-size: 200% 100%
    border-radius: 0.375rem
    animation: shimmer-slide 1.5s ease-in-out infinite

    @keyframes shimmer-slide
      0%
        background-position: 200% 0
      100%
        background-position: -200% 0

    @media (prefers-reduced-motion: reduce)
      animation: none

    @media (prefers-color-scheme: dark)
      background: linear-gradient(90deg, hsl(217 33% 17%) 25%, hsl(222 47% 6%) 50%, hsl(217 33% 17%) 75%)
</style>
