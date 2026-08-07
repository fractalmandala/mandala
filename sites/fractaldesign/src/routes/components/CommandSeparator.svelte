<script lang="ts">
  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="command-separator {className}" {...rest}></div>

<style lang="sass">
  .command-separator
    height: 1px
    margin: 0.25rem 0
    background-color: hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
</style>
