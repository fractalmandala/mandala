<script lang="ts">
	import { aiByCategory } from '$lib/docs/ai-registry.js';
	const groups = aiByCategory();
</script>

<svelte:head><title>AI Elements — fractalsvelte</title></svelte:head>

<article class="doc-article">
	<h1 class="doc-title">AI Elements</h1>
	<p class="doc-lede">
		Higher-order components for AI chat interfaces — messages, reasoning, tool calls, prompt
		inputs, code blocks and more. Composed from the core components, styled with the same tokens.
	</p>
	{#each groups as group (group.category)}
		<h2>{group.category}</h2>
		<div class="doc-index-grid">
			{#each group.items as item (item.slug)}
				<a class="doc-index-card box" href="/ai/{item.slug}" data-status={item.status}>
					<strong>{item.name}</strong>
					<span>
						{item.status === 'ready' ? 'Ready' : `Wave ${item.wave}`}
						{#if item.external.length}· {item.external.join(', ')}{/if}
					</span>
				</a>
			{/each}
		</div>
	{/each}
</article>
