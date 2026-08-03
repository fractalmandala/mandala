<script lang="ts">
  let {
    steps = [] as Array<{title: string; status: 'pending' | 'active' | 'complete'}>,
    class: className = '',
    children,
    ...rest
  }: {
    steps?: Array<{title: string; status: 'pending' | 'active' | 'complete'}>;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="workflow {className}" {...rest}>
  {#each steps as step, i}
    <div class="workflow-step" data-status={step.status}>
      <div class="workflow-step-indicator">
        {#if step.status === 'complete'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {:else if step.status === 'active'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        {:else}
          <span class="workflow-step-number">{i + 1}</span>
        {/if}
      </div>
      <span class="workflow-step-title">{step.title}</span>
    </div>
    {#if i < steps.length - 1}
      <div class="workflow-connector" data-status={step.status}></div>
    {/if}
  {/each}
  {@render children?.()}
</div>

<style lang="sass">
  .workflow
    display: flex
    flex-direction: column
    gap: 0
    font-size: 0.875rem

  .workflow-step
    display: flex
    align-items: center
    gap: 0.75rem
    padding: 0.5rem 0

  .workflow-step-indicator
    display: flex
    align-items: center
    justify-content: center
    width: 1.5rem
    height: 1.5rem
    flex-shrink: 0
    border-radius: 9999px

    .workflow-step[data-status="pending"] &
      border: 2px solid hsl(214 32% 91%)
      color: hsl(215 16% 47%)

    .workflow-step[data-status="active"] &
      border: 2px solid hsl(222 47% 11%)
      color: hsl(222 47% 11%)

    .workflow-step[data-status="complete"] &
      background-color: hsl(142 71% 45% / 0.1)
      color: hsl(142 71% 45%)

    > svg
      width: 0.875rem
      height: 0.875rem

    @media (prefers-color-scheme: dark)
      .workflow-step[data-status="active"] &
        border-color: hsl(210 40% 98%)
        color: hsl(210 40% 98%)

  .workflow-step-number
    font-size: 0.75rem
    font-weight: 600
    line-height: 1

  .workflow-step-title
    font-size: 0.875rem
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .workflow-connector
    width: 1px
    height: 1rem
    margin-left: 0.6875rem
    background-color: hsl(214 32% 91%)

    &[data-status="complete"]
      background-color: hsl(142 71% 45% / 0.4)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
</style>
