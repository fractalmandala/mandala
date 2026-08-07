<script lang="ts">
	import type { DocsNavigationNode, DocsNavigationSection } from '@docs-kit/core';
	import type { Snippet } from 'svelte';

	import { findNavigationTrail } from './navigation-trail.js';

	let {
		node,
		pathname,
		children
	}: {
		node: DocsNavigationSection;
		pathname: string;
		/** Renders the section's children, so the section never imports the list itself. */
		children: Snippet<[DocsNavigationNode[]]>;
	} = $props();

	const containsCurrent = $derived(findNavigationTrail(node.children, pathname).length > 0);
	let toggled = $state<boolean | undefined>(undefined);
	const open = $derived(toggled ?? (containsCurrent || !node.collapsed));
</script>

{#if node.collapsible}
	<button
		type="button"
		class="docs-nav-section__toggle docs-nav-section__label"
		aria-expanded={open}
		aria-controls="section-{node.id}"
		onclick={() => (toggled = !open)}
	>
		<span aria-hidden="true">{open ? '▾' : '▸'}</span>
		{node.label}
	</button>
{:else}
	<p class="docs-nav-section__label">{node.label}</p>
{/if}

{#if open}
	<div id="section-{node.id}">
		{@render children(node.children)}
	</div>
{/if}
