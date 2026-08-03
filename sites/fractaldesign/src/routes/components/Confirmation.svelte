<script lang="ts">
  let {
    state = 'approval-requested' as const,
    class: className = '',
    children,
    ...rest
  }: {
    state?: 'approval-requested' | 'accepted' | 'rejected';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="confirmation {className}" role="alert" data-state={state} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .confirmation
    position: relative
    display: flex
    width: 100%
    flex-direction: column
    gap: 0.5rem
    border: 1px solid hsl(0 84% 60% / 0.3)
    border-radius: 0.75rem
    background-color: hsl(0 84% 60% / 0.05)
    padding: 1rem
    color: hsl(0 84% 60%)
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)

    @media (prefers-color-scheme: dark)
      background-color: hsl(0 84% 60% / 0.08)
      border-color: hsl(0 84% 60% / 0.3)
      color: hsl(0 84% 70%)
</style>
