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

<div class="message-content {className}" data-role={role} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .message-content
    display: flex
    width: fit-content
    max-width: 100%
    min-width: 0
    flex-direction: column
    gap: 0.5rem
    overflow: hidden
    font-size: 0.875rem
    color: hsl(222 47% 11%)

    &[data-role="user"]
      margin-left: auto
      background-color: hsl(210 40% 96%)
      border-radius: 0.5rem
      padding: 0.75rem 1rem

    &[data-role="assistant"]
      background-color: transparent
      padding: 0

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      &[data-role="user"]
        background-color: hsl(217 33% 17%)
</style>
