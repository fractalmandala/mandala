<script lang="ts">
  let {
    orientation: _orientation = 'horizontal',
    class: className = '',
    ...rest
  }: {
    orientation?: 'horizontal' | 'vertical';
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class="separator {className}" data-orientation={_orientation} role="separator" {...rest}></div>

<style lang="sass">
  .separator
    flex-shrink: 0
    background-color: hsl(214 32% 91%)

    &[data-orientation="horizontal"]
      height: 1px
      width: 100%

    &[data-orientation="vertical"]
      width: 1px
      height: 100%

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
</style>
