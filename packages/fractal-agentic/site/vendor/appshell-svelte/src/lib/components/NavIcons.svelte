<script lang="ts">
  import NavIconButton from './NavIconButton.svelte';
</script>

<div class="nav-icons">
  <NavIconButton icon="search" label="Search documentation" />
  <NavIconButton icon="github" label="Open GitHub" href="https://github.com" />
  <NavIconButton icon="panel" label="Toggle panel" />
  <NavIconButton icon="theme" label="Change theme" />
</div>

<style>
  .nav-icons { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
</style>
