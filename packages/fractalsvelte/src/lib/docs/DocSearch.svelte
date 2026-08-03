<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Command from '$lib/components/command/index.js';
	import {
		SEARCH_SECTIONS,
		hitsBySection,
		searchValue,
		type SearchHit
	} from './search-index.js';

	let open = $state(false);

	function navigate(hit: SearchHit) {
		open = false;
		void goto(hit.href);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			open = !open;
			return;
		}
		// "/" opens search when focus is not in an editable field
		if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
			const t = event.target as HTMLElement | null;
			const tag = t?.tagName;
			if (
				tag === 'INPUT' ||
				tag === 'TEXTAREA' ||
				tag === 'SELECT' ||
				t?.isContentEditable
			) {
				return;
			}
			event.preventDefault();
			open = true;
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<button
	type="button"
	class="doc-search-icon"
	aria-label="Search documentation"
	title="Search (⌘K)"
	onclick={() => (open = true)}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.3-4.3" />
	</svg>
</button>

<Command.Dialog
	bind:open
	title="Search documentation"
	description="Jump to a component, AI element, block, or page by title."
>
	<Command.Input placeholder="Search titles…" />
	<Command.List>
		<Command.Empty>No matches.</Command.Empty>
		{#each SEARCH_SECTIONS as section (section)}
			{@const items = hitsBySection(section)}
			{#if items.length > 0}
				<Command.Group heading={section}>
					{#each items as hit (hit.id)}
						<Command.Item value={searchValue(hit)} onSelect={() => navigate(hit)}>
							<span class="doc-search-item-title">{hit.title}</span>
							<span class="doc-search-item-meta">{section}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			{/if}
		{/each}
	</Command.List>
</Command.Dialog>
