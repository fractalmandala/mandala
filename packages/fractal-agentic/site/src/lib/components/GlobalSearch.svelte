<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { RiCloseLine, RiSearchFill } from 'svelte-remixicon';
	import type { SearchResult } from '$lib/content';

	interface Props {
		items: SearchResult[];
	}

	let { items }: Props = $props();

	let isOpen = $state(false);
	let query = $state('');
	let activeIndex = $state(0);
	let inputElement: HTMLInputElement | undefined = $state();
	let triggerElement: HTMLButtonElement | undefined = $state();
	let restoreFocusElement: HTMLElement | null = null;

	const results = $derived.by(() => {
		const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);

		if (terms.length === 0) return [];

		return items
			.filter((item) => {
				const commandName = item.kind === 'command' ? `/${item.slug}` : '';
				const haystack =
					`${item.title} ${item.slug} ${commandName} ${item.description} ${item.kind}`.toLocaleLowerCase();
				return terms.every((term) => haystack.includes(term));
			})
			.sort((a, b) => {
				const normalizedQuery = query.trim().toLocaleLowerCase();
				const aTitle = a.title.toLocaleLowerCase();
				const bTitle = b.title.toLocaleLowerCase();
				const aExact = aTitle === normalizedQuery ? 0 : aTitle.startsWith(normalizedQuery) ? 1 : 2;
				const bExact = bTitle === normalizedQuery ? 0 : bTitle.startsWith(normalizedQuery) ? 1 : 2;
				return (
					aExact - bExact || a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
				);
			});
	});

	$effect(() => {
		if (isOpen) {
			tick().then(() => inputElement?.focus());
		}
	});

	function openSearch() {
		restoreFocusElement =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		isOpen = true;
		activeIndex = 0;
	}

	function closeSearch() {
		isOpen = false;
		query = '';
		activeIndex = 0;
		const focusTarget = restoreFocusElement ?? triggerElement;
		restoreFocusElement = null;
		tick().then(() => focusTarget?.focus());
	}

	function moveActive(step: number) {
		if (results.length === 0) return;
		activeIndex = (activeIndex + step + results.length) % results.length;
	}

	function selectActive() {
		const result = results[activeIndex];
		if (!result) return;
		closeSearch();
		goto(result.href);
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveActive(1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveActive(-1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			selectActive();
		}
	}

	function handleDialogKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
		}
		event.stopPropagation();
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]');
		const isSearchShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

		if (isSearchShortcut) {
			event.preventDefault();
			if (isOpen) closeSearch();
			else openSearch();
			return;
		}

		if (!isOpen && event.key === '/' && !isTyping) {
			event.preventDefault();
			openSearch();
		}
	}

	function kindLabel(kind: SearchResult['kind']): string {
		return kind === 'boss'
			? 'Boss'
			: kind === 'doc'
				? 'Doc'
				: kind.charAt(0).toUpperCase() + kind.slice(1);
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<button
	bind:this={triggerElement}
	type="button"
	class="btn-icon search-trigger"
	onclick={openSearch}
	aria-label="Search the Fractal Agentic explorer"
	aria-haspopup="dialog"
	aria-expanded={isOpen}
	aria-keyshortcuts="Meta+K Control+K"
	title="Search (⌘K or Ctrl K)"
>
	<RiSearchFill size={'18'} />
</button>

{#if isOpen}
	<div class="search-overlay" role="presentation" onclick={closeSearch}>
		<dialog
			open
			class="search-dialog"
			aria-modal="true"
			aria-labelledby="global-search-title"
			onclick={(event) => event.stopPropagation()}
			onkeydown={handleDialogKeydown}
		>
			<header class="search-dialog__header">
				<div>
					<p class="search-dialog__kicker">Explorer search</p>
					<h2 id="global-search-title">Find a capability</h2>
				</div>
				<button
					type="button"
					class="search-dialog__close"
					onclick={closeSearch}
					aria-label="Close search"
				>
					<RiCloseLine size={'20'} />
				</button>
			</header>

			<div class="search-dialog__input-wrap">
				<RiSearchFill size={'20'} aria-hidden="true" />
				<label class="visually-hidden" for="global-search-input"
					>Search skills, agents, commands, bosses, and docs</label
				>
				<input
					bind:this={inputElement}
					id="global-search-input"
					class="search-dialog__input"
					type="search"
					bind:value={query}
					placeholder="Search skills, agents, commands, bosses, docs…"
					autocomplete="off"
					role="combobox"
					aria-autocomplete="list"
					aria-controls={results.length > 0 ? 'global-search-results' : undefined}
					aria-expanded={results.length > 0}
					aria-activedescendant={results.length > 0
						? `global-search-result-${activeIndex}`
						: undefined}
					oninput={() => (activeIndex = 0)}
					onkeydown={handleInputKeydown}
				/>
				<kbd>ESC</kbd>
			</div>

			{#if query.trim().length === 0}
				<div class="search-dialog__empty" role="status">
					<p>
						Search across all {items.length} indexed skills, agents, commands, bosses, and docs.
					</p>
					<span>Use ↑ ↓ to move and Enter to open.</span>
				</div>
			{:else if results.length === 0}
				<div class="search-dialog__empty" role="status">
					<p>No matches for “{query.trim()}”.</p>
					<span>Try a name, slug, domain, or keyword.</span>
				</div>
			{:else}
				<p class="search-dialog__count" aria-live="polite">
					{results.length} result{results.length === 1 ? '' : 's'}
				</p>
				<div
					id="global-search-results"
					class="search-dialog__results"
					role="listbox"
					aria-label="Search results"
				>
					{#each results as result, index (result.kind + result.href)}
						<a
							id={`global-search-result-${index}`}
							class:search-result--active={index === activeIndex}
							class="search-result"
							href={result.href}
							role="option"
							aria-selected={index === activeIndex}
							onmouseenter={() => (activeIndex = index)}
							onclick={closeSearch}
						>
							<span class="search-result__kind">{kindLabel(result.kind)}</span>
							<span class="search-result__body">
								<strong>{result.title}</strong>
								<span>{result.description}</span>
							</span>
							<span class="search-result__arrow" aria-hidden="true">↗</span>
						</a>
					{/each}
				</div>
			{/if}

			<footer class="search-dialog__footer">
				<span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
				<span><kbd>↵</kbd> open</span>
				<span><kbd>ESC</kbd> close</span>
			</footer>
		</dialog>
	</div>
{/if}
