<script lang="ts">
  import type { NavigationLink } from '../types';
  import Links from './Links.svelte';
  import NavIcons from './NavIcons.svelte';

  export let links: NavigationLink[] | undefined = undefined;
</script>

<nav aria-label="Primary">
  <Links {links} />
  <NavIcons />
</nav>

<style>
  nav { display: flex; align-items: center; justify-content: flex-end; gap: 24px; width: min(548px, 100%); }
</style>
