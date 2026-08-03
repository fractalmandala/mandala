<script lang="ts">
  import CodeCopyButton from './CodeCopyButton.svelte';
  import CodeOverflow from './CodeOverflow.svelte';

  let {
    code = '',
    language = '',
    collapsed = false,
    class: className = '',
    ...rest
  }: {
    code?: string;
    language?: string;
    collapsed?: boolean;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="code {className}" {...rest}>
  <div class="code-header">
    {#if language}
      <span class="code-language">{language}</span>
    {/if}
    <CodeCopyButton {code} />
  </div>
  <CodeOverflow {collapsed}>
    <pre class="code-block"><code>{code}</code></pre>
  </CodeOverflow>
</div>

<style lang="sass">
  .code
    position: relative
    display: flex
    flex-direction: column
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    overflow: hidden

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)

  .code-header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 0.375rem 0.75rem
    background-color: hsl(210 40% 96% / 0.5)
    border-bottom: 1px solid hsl(214 32% 91%)
    min-height: 2.5rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
      border-bottom-color: hsl(217 33% 17%)

  .code-language
    font-size: 0.75rem
    font-weight: 500
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)

  .code-block
    margin: 0
    padding: 0.75rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    font-size: 0.875rem
    line-height: 1.5
    overflow-x: auto
    background: transparent
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

    code
      word-wrap: break-word
      white-space: pre-wrap
</style>
