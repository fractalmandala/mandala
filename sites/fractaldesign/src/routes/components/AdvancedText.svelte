<script lang="ts">
  let {
    text = '',
    type = 'gradient' as const,
    class: className = '',
    ...rest
  }: {
    text?: string;
    type?: 'gradient' | 'glow' | 'typewriter';
    class?: string;
    [key: string]: unknown;
  } = $props();

  let displayedText = $state('');
  let charIndex = $state(0);

  $effect(() => {
    if (type === 'typewriter' && text) {
      const interval = setInterval(() => {
        if (charIndex < text.length) {
          displayedText = text.slice(0, charIndex + 1);
          charIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      displayedText = text;
    }
  });
</script>

<span class="advanced-text advanced-text--{type} {className}" {...rest}>
  {#if type === 'gradient'}
    <span class="gradient-text">{displayedText || text}</span>
  {:else if type === 'glow'}
    <span class="glow-text">{displayedText || text}</span>
  {:else}
    {displayedText}{#if type === 'typewriter' && charIndex < text.length}<span class="cursor">|</span>{/if}
  {/if}
</span>

<style lang="sass">
  .advanced-text
    display: inline-block

  .gradient-text
    background: linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(217 91% 60%) 50%, hsl(142 71% 45%) 100%)
    -webkit-background-clip: text
    background-clip: text
    color: transparent

  .glow-text
    color: hsl(222 47% 11%)
    text-shadow: 0 0 20px hsl(217 91% 60% / 0.3), 0 0 40px hsl(217 91% 60% / 0.1)
    animation: glow-pulse 2s ease-in-out infinite

    @keyframes glow-pulse
      0%, 100%
        text-shadow: 0 0 20px hsl(217 91% 60% / 0.3), 0 0 40px hsl(217 91% 60% / 0.1)
      50%
        text-shadow: 0 0 30px hsl(217 91% 60% / 0.5), 0 0 60px hsl(217 91% 60% / 0.2)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      text-shadow: 0 0 20px hsl(210 40% 98% / 0.3), 0 0 40px hsl(210 40% 98% / 0.1)

  .cursor
    display: inline-block
    animation: blink 1s step-end infinite

    @keyframes blink
      0%, 100%
        opacity: 1
      50%
        opacity: 0
</style>
