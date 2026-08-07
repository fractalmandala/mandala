<script lang="ts">
	import DocRenderer from '$lib/components/doc-renderer.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';
	import DocsFooter from '$lib/components/layout/docs-footer.svelte';
	import KeyboardNav from '$lib/components/nav/keyboard-nav.svelte';

	let { data } = $props();

	const meta = $derived({
		title: data.title,
		description: data.description,
		lastUpdated:
			typeof data.doc.meta.lastUpdated === 'string' ? data.doc.meta.lastUpdated : undefined,
		order: typeof data.doc.meta.order === 'number' ? data.doc.meta.order : undefined,
		draft: Boolean(data.doc.meta.draft),
		sidebar:
			typeof data.doc.meta.sidebar === 'object' && data.doc.meta.sidebar
				? (data.doc.meta.sidebar as { label?: string })
				: undefined
	});
	const prev = $derived(data.prev ?? undefined);
	const next = $derived(data.next ?? undefined);
</script>

<SeoHead title={data.title} description={data.description} />
<KeyboardNav {prev} {next} />

{#if data.doc.ok && data.doc.html}
	<DocRenderer
		{meta}
		html={data.doc.html}
		slug={data.doc.slug}
		rawContent={data.doc.raw}
		sourcePath={data.sourcePath}
	/>
{:else}
	<article id="doc-content" class="doc-content mx-auto w-full max-w-4xl" data-pagefind-body>
		<header class="mb-8">
			<h1 class="text-3xl font-bold tracking-tight">{data.title}</h1>
			{#if data.description}
				<p class="text-muted-foreground mt-2 text-lg">{data.description}</p>
			{/if}
		</header>
		<p class="text-muted-foreground mb-4 text-sm">
			This page could not be rendered. Showing raw markdown.
		</p>
		<pre class="bg-muted overflow-x-auto rounded-lg p-4 text-sm whitespace-pre-wrap">{data.doc.raw}</pre>
	</article>
{/if}

<DocsFooter {prev} {next} />
