<script lang="ts">
	import type { VaultNavGroup } from '$lib/server/vault';
	import { goto } from '$app/navigation';

	let {
		isOpen = $bindable(false),
		navGroups
	}: {
		isOpen: boolean;
		navGroups: VaultNavGroup[];
	} = $props();

	let searchQuery = $state('');

	// Flatten all items for client search
	let allItems = $derived.by(() => {
		const items: { title: string; slug: string; group: string; section: string; tags?: string[] }[] = [];
		for (const g of navGroups) {
			for (const s of g.sections) {
				for (const item of s.items) {
					items.push({
						title: item.title,
						slug: item.slug,
						group: g.title,
						section: s.title,
						tags: item.tags
					});
				}
			}
		}
		return items;
	});

	let searchResults = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return allItems.slice(0, 8);

		return allItems
			.filter((item) => {
				const inTitle = item.title.toLowerCase().includes(query);
				const inSection = item.section.toLowerCase().includes(query);
				const inTags = item.tags?.some((t) => t.toLowerCase().includes(query));
				return inTitle || inSection || inTags;
			})
			.slice(0, 15);
	});

	function close() {
		isOpen = false;
		searchQuery = '';
	}

	function handleSelect(slug: string) {
		close();
		goto(`/${slug}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="search-backdrop"
		onclick={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="-1"
	>
		<div class="search-dialog pad24 radius12" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="search-input-wrap row ycenter gap12 padbot16 marginbot16 bdr-bottom">
				<span class="search-icon">🔍</span>
				<input
					type="text"
					class="search-input text-lg width100"
					placeholder="Type to search knowledge banks..."
					bind:value={searchQuery}
				/>
				<button class="btn-icon text-xs text-tertiary" onclick={close}>ESC</button>
			</div>

			<div class="search-results flex-col gap8">
				{#if searchResults.length === 0}
					<div class="pad24 text-center text-secondary">No topics matching "{searchQuery}"</div>
				{:else}
					{#each searchResults as result (result.slug)}
						<button
							class="result-item row xbetween ycenter pad12 radius8 text-left hover-bg"
							onclick={() => handleSelect(result.slug)}
						>
							<div class="flex-col gap2">
								<span class="result-title text-sm text-bold">{result.title}</span>
								<span class="result-meta text-xs text-tertiary">
									{result.group} → {result.section}
								</span>
							</div>
							{#if result.tags && result.tags.length > 0}
								<div class="row gap4">
									<span class="tag-badge pad2 padleft6 padright6 radius4 text-xs">{result.tags[0]}</span>
								</div>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}


