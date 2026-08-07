<script lang="ts">
  import type { HeaderIcon } from '../types';

  export let icon: HeaderIcon = 'search';
  export let label = 'Action';
  export let href: string | undefined = undefined;
</script>

{#snippet glyph()}
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {#if icon === 'search'}
      <path d="M5 3h10l4 4v14H5V3Zm9 2v3h3l-3-3Zm-1.8 10.4a3 3 0 1 0-1.4 1.4l2.7 2.7 1.4-1.4-2.7-2.7Z" />
    {:else if icon === 'github'}
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    {:else if icon === 'panel'}
      <path d="M4 4h16v16H4V4Zm3 3v10h5V9h3v8h2V7H7Z" />
    {:else}
      <path d="M11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM3.5 4.9 4.9 3.5 7 5.6 5.6 7 3.5 4.9Zm13.4 13.4 1.4-1.4 2.2 2.2-1.4 1.4-2.2-2.2Zm2.2-14.8 1.4 1.4L18.4 7 17 5.6l2.1-2.1ZM5.6 17 7 18.4l-2.1 2.1-1.4-1.4L5.6 17ZM20 11h3v2h-3v-2ZM1 11h3v2H1v-2Zm11-5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
    {/if}
  </svg>
{/snippet}

{#if href}
  <a class="icon-button" {href} aria-label={label}>{@render glyph()}</a>
{:else}
  <button class="icon-button" type="button" aria-label={label}>{@render glyph()}</button>
{/if}

<style>
  .icon-button { display: grid; width: 20px; height: 20px; padding: 0; border: 0; place-items: center; color: var(--shell-text); background: transparent; cursor: pointer; }
  .icon-button:hover { color: var(--shell-accent); }
  svg { width: 18px; height: 18px; fill: currentColor; }
</style>
