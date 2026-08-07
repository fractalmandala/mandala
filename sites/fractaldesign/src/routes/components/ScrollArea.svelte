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

<div class="scroll-area {className}" {...rest}>
  <div>
    {@render children?.()}
  </div>
</div>

<style lang="sass">
  .scroll-area
    position: relative
    overflow: hidden

    & > div
      height: 100%
      width: 100%
      overflow: auto

      &::-webkit-scrollbar
        width: 6px
        height: 6px

      &::-webkit-scrollbar-track
        background: transparent

      &::-webkit-scrollbar-thumb
        background-color: hsl(214 32% 91%)
        border-radius: 9999px

      &::-webkit-scrollbar-thumb:hover
        background-color: hsl(215 16% 65%)
</style>
