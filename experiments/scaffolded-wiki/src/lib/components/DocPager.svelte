<script lang="ts">
	import type { DocMetaView } from '$lib/server/wiki';

	let { prev, next }: { prev?: DocMetaView; next?: DocMetaView } = $props();
</script>

{#if prev || next}
	<nav class="pager" aria-label="Page navigation">
		{#if prev}
			<a class="prev" href={prev.path}>
				<span class="dir">← Previous</span>
				<span class="ptitle">{prev.title}</span>
			</a>
		{:else}
			<span></span>
		{/if}
		{#if next}
			<a class="next" href={next.path}>
				<span class="dir">Next →</span>
				<span class="ptitle">{next.title}</span>
			</a>
		{/if}
	</nav>
{/if}
