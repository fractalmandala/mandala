<script lang="ts">
  export let label = '';
  export let href: string | undefined = undefined;
  export let icon: 'github' | 'share' | 'arrow' = 'share';
  export let reverse = false;
  export let accent = false;
</script>

{#snippet content()}
  <span class="inner" class:reverse class:accent>
    {#if label}<span>{label}</span>{/if}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {#if icon === 'github'}
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
      {:else if icon === 'share'}
        <path d="M18 16a3 3 0 0 0-2.1.86L8.9 13.3A3.1 3.1 0 0 0 9 12c0-.45-.1-.88-.27-1.27l7.04-3.52A3 3 0 1 0 15 5c0 .1 0 .2.02.3L7.76 8.93A3 3 0 1 0 7.9 15l7.08 3.54A3 3 0 1 0 18 16Z" />
      {:else}
        <path d="m14.6 5.4 1.4 1.4-4.2 4.2H20v2h-8.2l4.2 4.2-1.4 1.4L8 12l6.6-6.6Z" />
      {/if}
    </svg>
  </span>
{/snippet}

{#if href}<a {href}>{@render content()}</a>{:else}<button type="button">{@render content()}</button>{/if}

<style>
  a, button { display: inline-flex; padding: 0; border: 0; color: #656565; background: transparent; text-decoration: none; cursor: pointer; }
  .inner { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; line-height: 12px; }
  .reverse { flex-direction: row-reverse; }
  .accent { color: var(--shell-accent); }
  svg { width: 16px; height: 16px; fill: currentColor; }
</style>
