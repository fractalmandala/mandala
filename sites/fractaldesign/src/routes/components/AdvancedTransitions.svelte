<script lang="ts">
  let {
    transition = 'fade',
    active = true,
    class: className = '',
    children,
    ...rest
  }: {
    transition?: 'fade' | 'slide' | 'scale';
    active?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if active}
  <div class="advanced-transition advanced-transition--{transition} {className}" data-transition={transition} {...rest}>
    {@render children?.()}
  </div>
{/if}

<style lang="sass">
  .advanced-transition
    animation-duration: 400ms
    animation-fill-mode: forwards
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1)

    &--fade
      animation-name: trans-fade-in

    &--slide
      animation-name: trans-slide-in

    &--scale
      animation-name: trans-scale-in

  @keyframes trans-fade-in
    from
      opacity: 0
    to
      opacity: 1

  @keyframes trans-slide-in
    from
      opacity: 0
      transform: translateY(20px)
    to
      opacity: 1
      transform: translateY(0)

  @keyframes trans-scale-in
    from
      opacity: 0
      transform: scale(0.95)
    to
      opacity: 1
      transform: scale(1)
</style>
