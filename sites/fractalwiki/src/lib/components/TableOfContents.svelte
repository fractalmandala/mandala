<script lang="ts">
	import type { HeadingItem } from '$lib/server/vault';

	let { headings }: { headings: HeadingItem[] } = $props();

	function scrollToHeading(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

{#if headings && headings.length > 0}
	<aside class="toc-panel pad16 radius8">
		<div class="toc-title text-xs text-bold text-uppercase tracking-wider text-tertiary marginbot12">
			On This Page
		</div>
		<ul class="toc-list flex-col gap6 text-xs">
			{#each headings as item (item.id)}
				<li class="toc-item level-{item.level}">
					<button
						class="toc-link text-left text-secondary hover-primary"
						onclick={() => scrollToHeading(item.id)}
					>
						{item.text}
					</button>
				</li>
			{/each}
		</ul>
	</aside>
{/if}


