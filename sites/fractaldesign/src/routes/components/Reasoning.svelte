<script lang="ts">
  let {
    open = false,
    streaming = false,
    text = '',
    duration,
    class: className = '',
    children,
    ...rest
  }: {
    open?: boolean;
    streaming?: boolean;
    text?: string;
    duration?: number;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="reasoning {className}" {...rest}>
  <button class="reasoning-trigger" type="button" aria-expanded={open}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    {#if streaming}
      <span class="reasoning-thinking">Thinking…</span>
    {:else}
      <span class="reasoning-caption">Thought for {duration ?? 0}s</span>
    {/if}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="reasoning-content" data-state={open ? 'open' : 'closed'}>
    <div>
      {#if text}
        <p class="reasoning-text">{text}</p>
      {/if}
      {#if children}
        {@render children?.()}
      {/if}
    </div>
  </div>
</div>

<style lang="sass">
  .reasoning
    display: flex
    flex-direction: column
    width: 100%
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .reasoning-trigger
    display: inline-flex
    align-items: center
    gap: 0.375rem
    border: 0
    background: transparent
    color: hsl(215 16% 47%)
    font-size: 0.875rem
    cursor: pointer
    padding: 0
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px
      border-radius: 0.375rem

    > svg:first-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0

    > svg:last-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)
      transform: rotate(0deg)

    &[aria-expanded="true"] > svg:last-of-type
      transform: rotate(180deg)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        color: hsl(210 40% 98%)

  .reasoning-content
    display: grid
    grid-template-rows: 1fr
    overflow: hidden
    transition: grid-template-rows 200ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-state="closed"]
      grid-template-rows: 0fr

    &[data-state="open"]
      grid-template-rows: 1fr

    > div
      min-height: 0
      padding-top: 0.5rem
      animation: reasoning-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards

  .reasoning-text
    margin: 0
    font-size: 0.875rem
    line-height: 1.6
    color: hsl(215 16% 47%)
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)

  @keyframes reasoning-in
    from
      opacity: 0
      transform: translateY(-8px)
    to
      opacity: 1
      transform: translateY(0)
</style>
