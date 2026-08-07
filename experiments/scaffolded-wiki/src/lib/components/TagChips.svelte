<script lang="ts">
	import { tagSlug } from '$lib/wiki/modules';

	let { tags, compact = false }: { tags: string[]; compact?: boolean } = $props();
</script>

<div class="tag-chips" style="display:flex;flex-wrap:wrap;gap:6px">
	{#each tags as tag (tag)}
		<a class="chip" class:tag-cloud={!compact} href={`/tag/${tagSlug(tag)}`}>{tag}</a>
	{/each}
</div>
