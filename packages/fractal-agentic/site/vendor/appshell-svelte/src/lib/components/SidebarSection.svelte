<script lang="ts">
  import type { SidebarEntry } from '../types';
  import SectionLabel from './SectionLabel.svelte';
  import SidebarLinks from './SidebarLinks.svelte';

  export let label = 'GROUP 1 LABEL';
  export let items: SidebarEntry[] | undefined = undefined;
</script>

<section>
  <SectionLabel {label} />
  <SidebarLinks {items} />
</section>

<style>
  section { display: flex; flex-direction: column; gap: 8px; width: 100%; }
</style>
