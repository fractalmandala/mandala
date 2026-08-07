<script lang="ts">
  import Code from './Code.svelte';

  let {
    code = '',
    language = '',
    class: className = '',
    children,
    ...rest
  }: {
    code?: string;
    language?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="code-preview {className}" {...rest}>
  <div class="code-preview-preview">
    {@render children?.()}
  </div>
  <div class="code-preview-code">
    <Code {code} {language} />
  </div>
</div>

<style lang="sass">
  .code-preview
    display: flex
    flex-direction: column
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    overflow: hidden

    @media (prefers-color-scheme: dark)
      border-color: hsl(217 33% 17%)

  .code-preview-preview
    padding: 1rem
    background-color: hsl(0 0% 100%)
    display: flex
    align-items: center
    justify-content: center
    min-height: 6rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)

  .code-preview-code
    border-top: 1px solid hsl(214 32% 91%)
    @media (prefers-color-scheme: dark)
      border-top-color: hsl(217 33% 17%)
</style>
