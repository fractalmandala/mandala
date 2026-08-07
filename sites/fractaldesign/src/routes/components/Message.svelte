<script lang="ts">
  let {
    role = 'assistant' as const,
    class: className = '',
    children,
    ...rest
  }: {
    role?: 'user' | 'assistant';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="message message--{role} {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .message
    display: flex
    width: 100%
    max-width: 95%
    flex-direction: column
    gap: 0.5rem

    &--user
      margin-left: auto
      align-items: flex-end
      justify-content: flex-end

    &--assistant
      margin-right: auto
      align-items: flex-start
</style>
