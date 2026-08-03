<script lang="ts">
  let {
    title,
    href = '#',
    description,
    className = '',
    ...rest
  }: {
    title?: string;
    href?: string;
    description?: string;
    className?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="source {className}" {...rest}>
  <a class="source-link" {href} target="_blank" rel="noopener noreferrer">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    <div class="source-info">
      <span class="source-title">{title || 'Source'}</span>
      {#if description}
        <span class="source-description">{description}</span>
      {/if}
    </div>
    <span class="source-host">{new URL(href).hostname}</span>
  </a>
</div>

<style lang="sass">
  .source
    &:not(:last-child)
      padding-bottom: 0.75rem
      border-bottom: 1px solid hsl(214 32% 91%)
      margin-bottom: 0.75rem

    @media (prefers-color-scheme: dark)
      border-bottom-color: hsl(217 33% 17%)

  .source-link
    display: flex
    align-items: flex-start
    gap: 0.5rem
    text-decoration: none
    color: hsl(222 47% 11%)

    > svg
      flex-shrink: 0
      width: 1rem
      height: 1rem
      margin-top: 0.125rem
      color: hsl(217 91% 60%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .source-info
    display: flex
    flex-direction: column
    gap: 0.125rem
    flex: 1
    min-width: 0

  .source-title
    font-size: 0.875rem
    font-weight: 500
    color: hsl(217 91% 60%)
    &:hover
      text-decoration: underline

  .source-description
    font-size: 0.75rem
    color: hsl(215 16% 47%)
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)

  .source-host
    font-size: 0.6875rem
    color: hsl(215 16% 47%)
    white-space: nowrap
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
