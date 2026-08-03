<script lang="ts">
  let {
    title,
    href,
    class: className = '',
    ...rest
  }: {
    title?: string;
    href?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="inline-citation-source {className}" {...rest}>
  <a class="source-link" {href} target="_blank" rel="noopener noreferrer">
    <span class="source-title">{title || 'Untitled Source'}</span>
    <span class="source-url">{href}</span>
  </a>
</div>

<style lang="sass">
  .inline-citation-source
    margin-top: 0.75rem
    padding-top: 0.75rem
    border-top: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      border-top-color: hsl(217 33% 17%)

  .source-link
    display: flex
    flex-direction: column
    gap: 0.125rem
    text-decoration: none

  .source-title
    font-size: 0.8125rem
    font-weight: 600
    color: hsl(217 91% 60%)
    &:hover
      text-decoration: underline

  .source-url
    font-size: 0.6875rem
    color: hsl(215 16% 47%)
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
</style>
