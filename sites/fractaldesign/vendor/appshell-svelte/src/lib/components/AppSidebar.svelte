<script lang="ts">
  import type { SidebarGroup } from '../types';
  import SidebarSection from './SidebarSection.svelte';

  const defaultItems = [
    { label: 'Sidebar Item', href: '#item', emphasis: true },
    { label: 'Sidebar Item more', href: '#more', active: true, emphasis: true },
    { label: 'Sidebar', href: '#sidebar' },
    { label: 'Sidebar Item', href: '#sidebar-item' },
    { label: 'Sidebar Item', href: '#sidebar-item-2' }
  ];

  export let groups: SidebarGroup[] = Array.from({ length: 4 }, (_, index) => ({
    label: `GROUP ${index + 1} LABEL`,
    items: defaultItems.map((item) => ({ ...item, href: `${item.href}-${index + 1}` }))
  }));
</script>

<aside aria-label="Documentation navigation">
  {#each groups as group}
    <SidebarSection label={group.label} items={group.items} />
  {/each}
</aside>

<style>
  aside { display: flex; flex: 0 0 280px; flex-direction: column; gap: 36px; height: 100%; padding: 84px 24px 7px; overflow: auto; background: #fff; }
  @media (max-width: 1050px) { aside { flex-basis: 220px; padding-left: 16px; padding-right: 16px; } }
  @media (max-width: 760px) { aside { display: none; } }
</style>
