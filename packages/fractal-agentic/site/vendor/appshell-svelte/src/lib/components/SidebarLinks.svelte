<script lang="ts">
  import type { SidebarEntry } from '../types';
  import SidebarItem from './SidebarItem.svelte';

  export let items: SidebarEntry[] = [
    { label: 'Sidebar Item', href: '#item', emphasis: true },
    { label: 'Sidebar Item more', href: '#more', active: true, emphasis: true },
    { label: 'Sidebar', href: '#sidebar' },
    { label: 'Sidebar Item', href: '#sidebar-item' },
    { label: 'Sidebar Item', href: '#sidebar-item-2' }
  ];
</script>

<div class="sidebar-links">
  {#each items as item}
    <SidebarItem {...item} />
  {/each}
</div>

<style>
  .sidebar-links { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; width: 100%; }
</style>
