<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props();

	// One glyph + tint per playground, keyed by route.
	const facets: Record<string, { glyph: string; tint: string }> = {
		'/play/themer': { glyph: '❖', tint: 'rose' },
		'/play/canvas': { glyph: '◧', tint: 'sky' },
		'/play/paneforge': { glyph: '◫', tint: 'lav' },
		'/play/native-dragging': { glyph: '⇄', tint: 'mint' },
		'/play/fsvelte': { glyph: '✦', tint: 'amber' }
	};
</script>

<svelte:head>
	<title>Playground · Fractal Design</title>
	<meta name="description" content="Live experiments — theming, page building, panels, and dragging." />
</svelte:head>

<section class="fd-hero dotgrid fd-play-hero">
	<div class="fd-wrap box rgap20">
		<span class="eyebrow">Playground // live experiments</span>
		<h1 class="display fd-hero-title">Where the <em>toys</em> live.</h1>
		<p class="fd-hero-sub">
			Working demos, not demos of work. Theming engines, page-builder prototypes,
			panel systems, and drag mechanics — each one is a live route you can break.
		</p>
	</div>
</section>

<section class="fd-section">
	<div class="fd-wrap">
		<div class="fd-grid">
			{#if data.pages}
				{#each data.pages as page (page.link)}
					{@const facet = facets[page.link] ?? { glyph: '◌', tint: 'lav' }}
					<a class="fd-card" href={page.link}>
						<span
							class="fd-card-glyph"
							style="background: var(--chip-{facet.tint}-bg); color: var(--chip-{facet.tint}-tx)"
						>
							{facet.glyph}
						</span>
						<span class="fd-card-title">{page.title}</span>
						<span class="fd-card-desc">{page.description}</span>
						<span class="eyebrow">Open // {page.link.replace('/play/', '')} →</span>
					</a>
				{/each}
			{/if}
		</div>
	</div>
</section>
