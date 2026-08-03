<script lang="ts">
  let {
    position,
    total,
    class: className = '',
    ...rest
  }: {
    position?: number;
    total?: number;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="queue {className}" role="status" aria-label="Queue position" {...rest}>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 22v-4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M22 12h-4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
  {#if position !== undefined && total !== undefined}
    <span>{position} of {total}</span>
  {/if}
</div>

<style lang="sass">
  .queue
    display: inline-flex
    align-items: center
    gap: 0.5rem
    padding: 0.5rem 0.75rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    color: hsl(215 16% 47%)
    font-size: 0.8125rem

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0
      animation: queue-spin 2s linear infinite

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(215 16% 65%)

  @keyframes queue-spin
    from
      transform: rotate(0deg)
    to
      transform: rotate(360deg)
</style>
