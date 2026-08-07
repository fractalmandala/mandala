<script lang="ts">
	// Tab Strip — custom tabs in the header top row (§3.9/B3)
	//
	// B1 complete: reads from browserMirror (state/browser.svelte.ts).
	// Before S0: renders as a static placeholder.
	// After S0 + B1: wired to live tab data, each tab shows favicon/title/close.

	interface Tab {
		id: string;
		title: string;
		url: string;
		favicon?: string;
		loading: boolean;
	}

	interface Props {
		tabs?: Tab[];
		activeTabId?: string;
		onSelect?: (id: string) => void;
		onClose?: (id: string) => void;
		onNewTab?: () => void;
	}

	let {
		tabs = [],
		activeTabId = '',
		onSelect = () => {},
		onClose = () => {},
		onNewTab = () => {},
	}: Props = $props();
</script>

<div class="browser-tabstrip" role="tablist" aria-label="Browser tabs">
	{#each tabs as tab (tab.id)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="browser-tab"
			class:is-active={tab.id === activeTabId}
			class:is-loading={tab.loading}
			role="tab"
			tabindex="-1"
			aria-selected={tab.id === activeTabId}
			onclick={() => onSelect(tab.id)}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(tab.id); } }}
			oncontextmenu={(e) => e.preventDefault()}
			title={tab.url}
		>
			{#if tab.favicon}
				<img class="browser-tab-favicon" src={tab.favicon} alt="" />
			{/if}
			<span class="browser-tab-title">{tab.title || 'New Tab'}</span>
			<button
				class="browser-tab-close"
				onclick={(e) => { e.stopPropagation(); onClose(tab.id); }}
				aria-label="Close tab"
				title="Close tab"
			>
				<img src="/iconset/closeSmall.svg" alt="" />
			</button>
		</div>
	{/each}

	<button
		class="browser-tab-new-btn"
		onclick={onNewTab}
		aria-label="New tab"
		title="New tab"
	>
		<img src="/iconset/add.svg" alt="" />
	</button>
</div>
