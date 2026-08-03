<script lang="ts">
  let {
    type = 'mandatory' as const,
    class: className = '',
    children,
    ...rest
  }: {
    type?: 'mandatory' | 'proximity';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="scroll-snap scroll-snap--{type} {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .scroll-snap
    display: flex
    overflow-x: auto
    scroll-snap-type: x var(--snap-type, mandatory)
    -webkit-overflow-scrolling: touch
    scroll-behavior: smooth

    &--mandatory
      --snap-type: mandatory

    &--proximity
      --snap-type: proximity

    &::-webkit-scrollbar
      display: none

    > *
      scroll-snap-align: start
      flex-shrink: 0
</style>
