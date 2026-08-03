<script lang="ts">
  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="select-separator {className}" {...rest}></div>

<style lang="sass">
  .select-separator
    height: 1px
    margin: 0.25rem 0
    background-color: hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
</style>
