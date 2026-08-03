<script lang="ts">
	import { blocksByCategory } from '$lib/docs/blocks-registry.js';

	const groups = blocksByCategory();
</script>

<svelte:head><title>Blocks — fractalsvelte</title></svelte:head>

<article class="doc-article">
	<h1 class="doc-title">Blocks</h1>
	<p class="doc-lede">
		Larger layout shells composed from core components — page frames, sidebars, and navigation
		patterns you can drop into an app and adapt.
	</p>
	{#each groups as group (group.category)}
		<h2>{group.category}</h2>
		<div class="doc-index-grid">
			{#each group.items as item (item.slug)}
				<a class="doc-index-card box" href="/blocks/{item.slug}" data-status={item.status}>
					<strong>{item.name}</strong>
					<span>
						{item.status === 'ready' ? 'Ready' : 'Planned'}
						{#if item.description}· {item.description}{/if}
					</span>
				</a>
			{/each}
		</div>
	{/each}
</article>
