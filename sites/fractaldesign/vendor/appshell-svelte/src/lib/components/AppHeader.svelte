<script lang="ts">
  import type { NavigationLink } from '../types';
  import AppLogo from './AppLogo.svelte';
  import Nav from './Nav.svelte';

  export let links: NavigationLink[] | undefined = undefined;
</script>

<header>
  <AppLogo />
  <Nav {links} />
</header>

<style>
  header { display: flex; position: relative; z-index: 10; align-items: center; justify-content: space-between; width: 100%; height: 56px; padding: 8px 32px; border-bottom: 1px solid var(--shell-border); background: #fff; }
  @media (max-width: 640px) { header { padding-inline: 16px; } }
</style>
