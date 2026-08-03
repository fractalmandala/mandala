<script lang="ts">
	import type { PrevNext as PrevNextData } from '$lib/content';

	interface Props {
		nav: PrevNextData;
		kindLabel?: string;
	}

	let { nav, kindLabel = 'page' }: Props = $props();
</script>

{#if nav.prev || nav.next}
	<nav class="pager" aria-label="Page navigation">
		<div class="pager__slot">
			{#if nav.prev}
				<a class="pager__link pager__link--prev" href={nav.prev.href} rel="prev">
					<span class="pager__dir">
						<span class="pager__arrow" aria-hidden="true">←</span>
						Previous {kindLabel}
					</span>
					<span class="pager__title">{nav.prev.title}</span>
				</a>
			{/if}
		</div>
		{#if nav.total > 0 && nav.index >= 0}
			<p class="pager__meta" aria-hidden="true">{nav.index + 1} / {nav.total}</p>
		{/if}
		<div class="pager__slot pager__slot--end">
			{#if nav.next}
				<a class="pager__link pager__link--next" href={nav.next.href} rel="next">
					<span class="pager__dir">
						Next {kindLabel}
						<span class="pager__arrow" aria-hidden="true">→</span>
					</span>
					<span class="pager__title">{nav.next.title}</span>
				</a>
			{/if}
		</div>
	</nav>
{/if}
