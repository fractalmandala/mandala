<script lang="ts">
	// Omnibox — address input with suggestion dropdown (§3.9/B3 → B6)
	//
	// B3: plain address bar with Enter-to-navigate (no suggestions).
	// B6: adds suggestion dropdown from history + bookmarks (after C3/C4).
	import { updateQuery, getResults, isLoading, type SuggestionItem } from '../state/suggestions.svelte';

	interface Props {
		windowId?: string;
		url?: string;
		children?: import('svelte').Snippet;
		onNavigate?: (url: string) => void;
	}

	let {
		windowId = 'main',
		url = '',
		children,
		onNavigate = () => {},
	}: Props = $props();

	let inputValue = $state('');
	let showSuggestions = $state(false);
	let highlightedIndex = $state(-1);
	let inputEl: HTMLInputElement | undefined = $state();

	$effect(() => {
		if (url) inputValue = url;
	});

function handleInput() {
    try {
        updateQuery(inputValue);
        showSuggestions = inputValue.trim().length > 0;
        highlightedIndex = -1;
    } catch (error) {
        console.error("Error in handleInput:", error);
    }
}

function navigateTo(raw: string) { // Added the string type annotation back here
    try {
        let url = raw.trim();
        if (!url.includes('.') && !url.startsWith('http')) {
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }
        showSuggestions = false;
        highlightedIndex = -1;
        onNavigate(url);
    } catch (error) {
        console.error(`Error navigating to "${raw}":`, error);
    }
}

function submitAddress() {
    try {
        const results = getResults();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            navigateTo(results[highlightedIndex].url);
        } else {
            navigateTo(inputValue);
        }
    } catch (error) {
        console.error("Error in submitAddress:", error);
    }
}

	function handleKeydown(e: KeyboardEvent) {
		const results = getResults();
		if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			e.stopPropagation();
			submitAddress();
		} else if (e.key === 'Escape') {
			showSuggestions = false;
			highlightedIndex = -1;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightedIndex = Math.min(highlightedIndex + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightedIndex = Math.max(highlightedIndex - 1, -1);
		}
	}

	function selectSuggestion(item: SuggestionItem) {
		navigateTo(item.url);
	}
</script>

<div class="browser-omnibox">
	<div class="browser-omnibox-shell">
		<img src="/iconset/explorer.svg" alt="" class="icon-svg-xs browser-omnibox-icon" />
		<input
			type="text"
			class="browser-omnibox-input"
			bind:value={inputValue}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={() => { if (inputValue.trim()) showSuggestions = true; }}
			onblur={() => setTimeout(() => { showSuggestions = false; }, 200)}
			placeholder="Search or enter URL..."
			aria-label="Address bar"
			bind:this={inputEl}
		/>
		<div class="browser-omnibox-actions">
			<button
				class="browser-omnibox-go"
				type="button"
				onclick={submitAddress}
				aria-label="Go to address"
			>
				Go
			</button>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>

	{#if showSuggestions && inputValue.trim() && getResults().length > 0}
		<div class="browser-omnibox-dropdown" role="listbox" aria-label="Suggestions">
			{#each getResults() as item, i}
				<div
					class="browser-omnibox-suggestion"
					class:suggestion-bookmark={item.type === 'bookmark'}
					class:is-highlighted={i === highlightedIndex}
					role="option"
					aria-selected={i === highlightedIndex}
					onclick={() => selectSuggestion(item)}
					onkeydown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							selectSuggestion(item);
						}
					}}
					tabindex="-1"
				>
					<img
						src={item.faviconUrl || '/iconset/explorer.svg'}
						alt=""
						class="browser-omnibox-sugg-icon"
					/>
					<span class="browser-omnibox-sugg-title">{item.title || item.url}</span>
					<span class="browser-omnibox-sugg-url">{item.url}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
