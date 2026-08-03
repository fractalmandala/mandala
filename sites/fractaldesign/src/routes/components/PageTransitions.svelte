<script lang="ts">
  let {
    type = 'fade' as const,
    active = true,
    class: className = '',
    children,
    ...rest
  }: {
    type?: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'scale';
    active?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if active}
  <div class="page-transition page-transition--{type} {className}" data-transition={type} {...rest}>
    {@render children?.()}
  </div>
{/if}

<style lang="sass">
  .page-transition
    animation: pt-in 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards

    &--fade
      animation-name: pt-fade
    &--slide-left
      animation-name: pt-slide-left
    &--slide-right
      animation-name: pt-slide-right
    &--slide-up
      animation-name: pt-slide-up
    &--scale
      animation-name: pt-scale

  @keyframes pt-fade
    from
      opacity: 0
    to
      opacity: 1

  @keyframes pt-slide-left
    from
      opacity: 0
      transform: translateX(30px)
    to
      opacity: 1
      transform: translateX(0)

  @keyframes pt-slide-right
    from
      opacity: 0
      transform: translateX(-30px)
    to
      opacity: 1
      transform: translateX(0)

  @keyframes pt-slide-up
    from
      opacity: 0
      transform: translateY(30px)
    to
      opacity: 1
      transform: translateY(0)

  @keyframes pt-scale
    from
      opacity: 0
      transform: scale(0.95)
    to
      opacity: 1
      transform: scale(1)
</style>
