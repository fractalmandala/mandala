<script lang="ts">
	let {
		chart,
		title,
		caption
	}: {
		/** Mermaid source, exactly as written in the ```mermaid fence. */
		chart: string;
		/** Accessible name for the rendered diagram. */
		title?: string;
		caption?: string;
	} = $props();

	let svg = $state('');
	let failed = $state(false);

	/**
	 * Mermaid is imported inside the effect, so the library is fetched only by pages that
	 * actually contain a diagram, and only in the browser. The `<pre>` fallback below stays
	 * in the server-rendered HTML until then, so the source is never lost.
	 */
	$effect(() => {
		let cancelled = false;
		const source = chart;

		void (async () => {
			try {
				const mermaid = (await import('mermaid')).default;
				mermaid.initialize({
					startOnLoad: false,
					securityLevel: 'strict',
					theme: document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'default'
				});

				const id = `docs-mermaid-${Math.random().toString(36).slice(2, 10)}`;
				const rendered = await mermaid.render(id, source);

				if (!cancelled) {
					svg = rendered.svg;
				}
			} catch {
				if (!cancelled) {
					failed = true;
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<figure class="docs-mermaid">
	{#if svg}
		<div class="docs-mermaid__diagram" role="img" aria-label={title ?? caption ?? 'Diagram'}>
			<!-- Mermaid output is generated from the document's own source. -->
			{@html svg}
		</div>
	{:else}
		<pre class="docs-mermaid__source" aria-label={title ?? 'Diagram source'}><code>{chart}</code></pre>
		{#if failed}
			<p class="docs-mermaid__error" role="status">
				The diagram could not be rendered; its source is shown instead.
			</p>
		{/if}
	{/if}
	{#if caption}
		<figcaption class="docs-mermaid__caption">{caption}</figcaption>
	{/if}
</figure>
