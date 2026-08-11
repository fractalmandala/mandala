  <script lang="ts">
    import { docs } from '$lib/docs/source';
    import { Publication } from '@acrolls/svelte';
  
    let { slug }: { slug: string } = $props();
    const document = $derived(docs.get(slug));
  </script>
  
  {#if document}
    {#await document.loader() then Article}
      <Publication><Article /></Publication>
    {:catch loadError}
      <p>Could not load this documentation page: {loadError instanceof Error ? loadError.message : String(loadError)}</p>
    {/await}
  {:else}
    <p>Documentation page not found.</p>
  {/if}