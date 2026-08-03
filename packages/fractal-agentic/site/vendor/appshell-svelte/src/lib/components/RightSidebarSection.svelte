<script lang="ts">
  import type { OutlineLink } from '../types';
  import SidebarLink from './SidebarLink.svelte';

  export let label = 'ON THIS PAGE';
  export let links: OutlineLink[] = [
    { label: 'Header 1', href: '#header-1' },
    { label: 'A Longer Header 2 is Also There', href: '#header-2', active: true },
    { label: 'And Chapters', href: '#chapters' }
  ];
</script>

<section>
  <div class="label">{label}</div>
  <div class="links">
    {#each links as link}<SidebarLink {...link} />{/each}
  </div>
</section>

<style>
  section { display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 8px 0 8px 24px; border-left: 1px solid #d7d7d7; }
  .label { color: var(--shell-muted); font-size: 10px; font-weight: 500; letter-spacing: -0.12px; line-height: 16px; }
  .links { display: flex; flex-direction: column; width: 100%; }
</style>
