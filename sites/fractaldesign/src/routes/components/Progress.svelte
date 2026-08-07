<script lang="ts">
  let {
    value = 0,
    max = 100,
    class: className = '',
    ...rest
  }: {
    value?: number;
    max?: number;
    class?: string;
    [key: string]: unknown;
  } = $props();

  let percent = $derived(max > 0 ? Math.round((value / max) * 100) : 0);
  let translate = $derived(100 - percent);
</script>

<div class="progress {className}" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} {...rest}>
  <div class="progress-indicator" style="transform: translateX(-{translate}%)"></div>
</div>

<style lang="sass">
  .progress
    position: relative
    display: flex
    width: 100%
    height: 0.375rem
    overflow-x: hidden
    overflow-y: hidden
    border-radius: 9999px
    background-color: hsl(210 40% 96%)
    outline: none

    &[disabled],
    &[data-disabled="true"]
      pointer-events: none
      cursor: not-allowed
      opacity: 0.5

  .progress-indicator
    height: 100%
    width: 100%
    flex: 1 1 0%
    background-color: hsl(222 47% 11%)
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)

    @media (prefers-color-scheme: dark)
      background-color: hsl(210 40% 98%)

  @media (prefers-color-scheme: dark)
    .progress
      background-color: hsl(217 33% 17%)
</style>
