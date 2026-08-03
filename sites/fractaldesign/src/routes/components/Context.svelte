<script lang="ts">
  let {
    percent = 0,
    used = 0,
    max = 0,
    class: className = '',
    children,
    ...rest
  }: {
    percent?: number;
    used?: number;
    max?: number;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="context {className}" {...rest}>
  <button class="context-trigger" type="button">
    <span class="context-trigger__percent">{percent}%</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" ry="2"/><path d="M2 10h20"/></svg>
  </button>
  <div class="context-content">
    <div class="context-content-header">
      <div class="context-content-header__row">
        <span class="context-content-header__percent">{percent}%</span>
        <span class="context-content-header__tokens">{used.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div class="context-progress" class:context-progress--warn={percent > 80} class:context-progress--danger={percent > 95}>
        <div class="context-progress__fill" style="width: {percent}%"></div>
      </div>
    </div>
    <div class="context-content-body">
      {@render children?.()}
    </div>
  </div>
</div>

<style lang="sass">
  .context
    position: relative
    display: inline-block

  .context-trigger
    display: inline-flex
    align-items: center
    justify-content: center
    height: 2rem
    padding: 0 0.5rem
    border: 1px solid transparent
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    gap: 0.375rem
    font-size: 0.875rem
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    &__percent
      font-weight: 500
      color: hsl(215 16% 47%)

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)

  .context-content
    position: absolute
    z-index: 50
    min-width: 15rem
    overflow: hidden
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
    margin-top: 0.5rem
    top: 100%
    left: 0

    > * + *
      border-top: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)
      > * + *
        border-top-color: hsl(217 33% 17%)

  .context-content-header
    display: flex
    flex-direction: column
    gap: 0.5rem
    padding: 0.75rem

    &__row
      display: flex
      align-items: center
      justify-content: space-between
      gap: 0.75rem
      font-size: 0.75rem
      line-height: 1rem

    &__percent
      font-weight: 500
      color: hsl(222 47% 11%)
      @media (prefers-color-scheme: dark)
        color: hsl(210 40% 98%)

    &__tokens
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
      color: hsl(215 16% 47%)
      font-size: 0.75rem
      @media (prefers-color-scheme: dark)
        color: hsl(215 16% 65%)

  .context-progress
    position: relative
    width: 100%
    height: 0.375rem
    overflow: hidden
    border-radius: 9999px
    background-color: hsl(210 40% 96%)
    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)

    &__fill
      height: 100%
      background-color: hsl(222 47% 11%)
      transition: width 150ms cubic-bezier(0.4, 0, 0.2, 1) ease-out

      .context-progress--warn &
        background-color: hsl(38 92% 50%)
      .context-progress--danger &
        background-color: hsl(0 84% 60%)

      @media (prefers-color-scheme: dark)
        background-color: hsl(210 40% 98%)

  .context-content-body
    display: flex
    flex-direction: column
    gap: 0.5rem
    padding: 0.75rem
</style>
