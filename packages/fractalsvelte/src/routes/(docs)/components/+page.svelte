<script lang="ts">
	import { byCategory } from '$lib/docs/registry.js';
	const groups = byCategory();
</script>

<svelte:head><title>Components — fractalsvelte</title></svelte:head>

<article class="doc-article">
	<h1 class="doc-title">Components</h1>
	<p class="doc-lede">
		A Svelte 5 component library in plain SASS. No Tailwind, no class-string merging —
		every component is customised through typed props and CSS custom properties.
	</p>
	{#each groups as group (group.category)}
		<h2>{group.category}</h2>
		<div class="doc-index-grid">
			{#each group.items as item (item.slug)}
				<a class="doc-index-card box" href="/components/{item.slug}" data-status={item.status}>
					<strong>{item.name}</strong>
					<span>
						{item.status === 'ready' ? 'Ready' : `Wave ${item.wave}`}
						{#if item.external}· {item.external}{/if}
					</span>
				</a>
			{/each}
		</div>
	{/each}
</article>
