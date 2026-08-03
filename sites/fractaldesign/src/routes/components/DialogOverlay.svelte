<script lang="ts">
  let {
    open = false,
    class: className = '',
    ...rest
  }: {
    open?: boolean;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

{#if open}
  <div class="dialog-overlay" data-state="open" {...rest}></div>
{/if}

<style lang="sass">
  .dialog-overlay
    position: fixed
    inset: 0
    z-index: 50
    background-color: hsl(0 0% 0% / 0.5)
    backdrop-filter: blur(4px)
    -webkit-backdrop-filter: blur(4px)
    animation: dialog-overlay-in 100ms ease-out forwards

  @keyframes dialog-overlay-in
    from
      opacity: 0
    to
      opacity: 1
</style>
