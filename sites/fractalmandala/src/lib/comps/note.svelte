<!-- src/lib/components/Note.svelte -->

<script lang="ts">
  import { getNote } from '$lib/notes';

  let { slug } = $props();

  let Component = $state<any>(null);

  $effect(() => {
    getNote(slug).then((note) => {
      Component = note.component;
    });
  });
</script>

{#if Component}
	<div class="article-body">
		<Component />
	</div>
{/if}