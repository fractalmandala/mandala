<script lang="ts">
  let {
    text = '',
    delay = 50,
    class: className = '',
    ...rest
  }: {
    text?: string;
    delay?: number;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

{#if text}
  <span class="text-reveal {className}" style="--reveal-delay: {delay}ms" {...rest}>
    {#each text.split('') as char, i}
      <span class="text-reveal__char" style="--char-index: {i}">{char === ' ' ? ' ' : char}</span>
    {/each}
  </span>
{/if}

<style lang="sass">
  .text-reveal
    display: inline-block

    &__char
      display: inline-block
      opacity: 0
      animation: text-reveal-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards
      animation-delay: calc(var(--char-index, 0) * var(--reveal-delay, 50ms))

  @keyframes text-reveal-in
    from
      opacity: 0
      transform: translateY(10px)
    to
      opacity: 1
      transform: translateY(0)
</style>
