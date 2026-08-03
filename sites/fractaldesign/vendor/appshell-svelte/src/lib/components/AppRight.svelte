<script lang="ts">
  import type { OutlineLink } from '../types';
  import RightSidebarSection from './RightSidebarSection.svelte';

  export let links: OutlineLink[] | undefined = undefined;
</script>

<aside aria-label="On this page">
  <RightSidebarSection {links} />
</aside>

<style>
  aside { display: flex; flex: 0 0 280px; flex-direction: column; gap: 10px; height: 100%; padding: 84px 24px 84px 0; overflow: auto; background: #fff; }
  @media (max-width: 1180px) { aside { display: none; } }
</style>
