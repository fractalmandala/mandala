<script lang="ts">
	let {
		collection,
		label,
		docs
	}: {
		collection: string;
		label: string;
		docs: Array<{
			slug: string;
			title: string;
			date?: string;
			description?: string;
			tags?: string[];
		}>;
	} = $props();

	// newest first; undated docs sink to the bottom
	let sorted = $derived([...docs].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')));
</script>

<header class="page-header">
	<div class="page-kicker">
		<span>fractaldesign</span>
		<span class="sep">/</span>
		<span>{label}</span>
	</div>
	<h1>{label}</h1>
	<p class="lead">
		{docs.length} documents, served straight from their folders — no renaming, no per-file
		routes.
	</p>
	<div class="page-meta"><span>{docs.length} docs</span></div>
</header>

{#each sorted as doc (doc.slug)}
	<a class="log-row" href={`/${collection}/${doc.slug}`}>
		<span class="meta">{doc.date?.slice(5) ?? '—'}</span>
		<div>
			<h3>{doc.title}</h3>
			{#if doc.description}<p>{doc.description}</p>{/if}
		</div>
		<span class="meta">{doc.tags?.[0] ?? '—'}</span>
	</a>
{/each}
