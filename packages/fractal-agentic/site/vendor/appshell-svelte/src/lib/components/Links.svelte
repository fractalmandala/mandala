<script lang="ts">
  import type { NavigationLink } from '../types';

  export let links: NavigationLink[] = [
    { label: 'Docs', href: '#docs' },
    { label: 'Bosses', href: '#bosses' },
    { label: 'Skills', href: '#skills' },
    { label: 'Agents', href: '#agents' },
    { label: 'Commands', href: '#commands' },
    { label: 'Wiki', href: '#wiki' }
  ];
</script>

<div class="links">
  {#each links as link, index}
    {#if index > 0}<span class="divider" aria-hidden="true"></span>{/if}
    <a href={link.href}>{link.label}</a>
  {/each}
</div>

<style>
  .links { display: flex; flex: 1 1 auto; align-items: center; justify-content: flex-end; gap: 16px; min-width: 0; }
  a { color: var(--shell-text); font-size: 12px; font-weight: 500; letter-spacing: -0.33px; line-height: 17px; text-decoration: none; white-space: nowrap; }
  a:hover { color: var(--shell-accent); }
  .divider { width: 1px; height: 14px; background: var(--shell-border); }
  @media (max-width: 900px) { .links { display: none; } }
</style>
