<script lang="ts">
  import PageHeaderArea from './PageHeaderArea.svelte';

  export let breadcrumbs = 'HOME / DOCS';
  export let title = 'Page Title';
  export let tag = 'ECC Skills';
  export let description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
</script>

<header>
  <div class="breadcrumbs">{breadcrumbs}</div>
  <PageHeaderArea {title} {tag} {description} />
</header>

<style>
  header { display: flex; flex-direction: column; gap: 16px; width: 100%; padding-bottom: 16px; border-bottom: 1px solid #e7e7e7; }
  .breadcrumbs { color: #a1a1a1; font-family: Geist, 'Google Sans Flex', system-ui, sans-serif; font-size: 10px; line-height: 14px; }
</style>
