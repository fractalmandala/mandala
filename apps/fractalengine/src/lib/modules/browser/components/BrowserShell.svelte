<script lang="ts">
	// Browser Shell — standalone-window chrome root (§3.9)
	// Mounted by the /browser route. Wired to BrowserWindowState mirror (B1).
	import { BrowserWindowState } from '../state/browser.svelte';
	import type { Tab } from '../types';
	import TabStrip from './TabStrip.svelte';
	import NavControls from './NavControls.svelte';
	import Omnibox from './Omnibox.svelte';
	import BrowserMenu from './BrowserMenu.svelte';
	import BookmarkStar from './BookmarkStar.svelte';
	import VaultPopover from './vault/VaultPopover.svelte';
	import BookmarksRow from './BookmarksRow.svelte';
	import HistoryPanel from './HistoryPanel.svelte';
	import { browserSetViewportBounds } from '$lib/ipc';
	import { setOverlayWindowId } from '../state/overlayCoordinator.svelte';
	import { onMount } from 'svelte';

	interface Props {
		windowId?: string;
	}

	let { windowId = 'main' }: Props = $props();

	// Browser window state — created once, cached per window by the state module.
	// $derived is used here because windowId is a $props — the cache guarantees
	// the same instance is returned on re-evaluation.
	let windowState = $derived(BrowserWindowState.forWindow(windowId));

	// Derived tab data for child components
	let tabs = $derived<Tab[]>(windowState.tabs.map(t => ({
		id: t.id,
		url: t.url,
		title: t.title,
		favicon_url: t.favicon_url,
		favicon: t.favicon_url,
		can_go_back: t.can_go_back,
		can_go_forward: t.can_go_forward,
		loading: t.loading,
		nav_epoch: t.nav_epoch,
	})));

	let activeTabId = $derived(windowState.activeTabId);
	let activeTab = $derived(windowState.activeTab);
	let activeUrl = $derived(windowState.activeUrl);

	// Tab actions
	function handleSelect(tabId: string) { windowState.selectTab(tabId); }
	function handleClose(tabId: string) { windowState.closeTab(tabId); }
	function handleNewTab() { windowState.createTab(); }
	function handleNavigate(url: string) {
		windowState.navigateActive(url).catch((error) => {
			console.error(`browser navigate to ${url} failed:`, error);
		});
	}
	function handleBack() { if (activeTabId) windowState.goBack(activeTabId); }
	function handleForward() { if (activeTabId) windowState.goForward(activeTabId); }
	function handleReload() { if (activeTabId) windowState.reload(activeTabId); }
	function handleStop() { if (activeTabId) windowState.stop(activeTabId); }

	// Sidebar collapse state — persisted to localStorage (notes pattern)
	const STORAGE_KEY = 'fractalengine:browser-layout';
	let leftCollapsed = $state(true);
	let rightCollapsed = $state(true);
	let leftWidth = $state(240);
	let rightWidth = $state(240);

	$effect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const p = JSON.parse(raw) as Record<string, unknown>;
				if (typeof p.leftCollapsed === 'boolean') leftCollapsed = p.leftCollapsed;
				if (typeof p.rightCollapsed === 'boolean') rightCollapsed = p.rightCollapsed;
				if (typeof p.leftWidth === 'number') leftWidth = Math.max(120, Math.min(480, p.leftWidth));
				if (typeof p.rightWidth === 'number') rightWidth = Math.max(120, Math.min(480, p.rightWidth));
			}
		} catch { /* ignore */ }
	});

	function persistLayout() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ leftCollapsed, rightCollapsed, leftWidth, rightWidth }));
	}

	function toggleLeft() {
		leftCollapsed = !leftCollapsed;
		persistLayout();
	}

	function toggleRight() {
		rightCollapsed = !rightCollapsed;
		persistLayout();
	}

	// Resize state machine (notes pattern)
	type Resizing = 'left' | 'right' | null;
	let resizing = $state<Resizing>(null);

	function startResize(which: Exclude<Resizing, null>, e: PointerEvent) {
		e.preventDefault();
		resizing = which;
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', endResize);
		window.addEventListener('pointercancel', endResize);
	}

	function endResize() {
		resizing = null;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', endResize);
		window.removeEventListener('pointercancel', endResize);
	}

	function onPointerMove(e: PointerEvent) {
		if (!resizing) return;
		if (resizing === 'left') leftWidth = Math.max(120, Math.min(480, e.clientX));
		else rightWidth = Math.max(120, Math.min(480, window.innerWidth - e.clientX));
		persistLayout();
	}

	let viewport = $state<HTMLDivElement | null>(null);
	onMount(() => {
		setOverlayWindowId(windowId);
		let frame = 0;
		const report = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				if (!viewport) return;
				const rect = viewport.getBoundingClientRect();
				void browserSetViewportBounds(windowId, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
			});
		};
		const observer = new ResizeObserver(report);
		if (viewport) observer.observe(viewport);
		report();
		return () => { cancelAnimationFrame(frame); observer.disconnect(); windowState.destroy(); };
	});

	// Vault popover state
	let showVault = $state(false);
	let showHistory = $state(false);

	function toggleVault() {
		showVault = !showVault;
	}

	// Keybinding listeners from contributions
	$effect(() => {
		function handler(e: Event) {
			const customEvent = e as CustomEvent;
			switch (customEvent.type) {
				case 'browser:new-tab': handleNewTab(); break;
				case 'browser:close-tab': if (activeTabId) handleClose(activeTabId); break;
				case 'browser:reopen-tab': windowState.reopenClosedTab(); break;
				case 'browser:focus-address': {
					const input = document.querySelector('.browser-omnibox-input') as HTMLInputElement | null;
					input?.focus();
					input?.select();
					break;
				}
				case 'browser:reload': handleReload(); break;
			}
		}
		// Browser-specific event listeners
		const events = ['browser:new-tab', 'browser:close-tab', 'browser:reopen-tab',
			'browser:focus-address', 'browser:reload'];
		for (const ev of events) {
			window.addEventListener(ev, handler);
		}
		return () => {
			for (const ev of events) {
				window.removeEventListener(ev, handler);
			}
		};
	});
</script>

<div class="module-wrapper browser-wrapper">
	<!-- Header: 3 × 36px rows -->
	<div class="browser-header" role="toolbar" aria-label="Browser chrome">
		<!-- Top row: tab strip -->
		<!-- "deep" so empty tab-strip space drags/double-click-maximizes; tabs and buttons
		     are interactive elements, which Tauri's drag script excludes automatically -->
		<div class="browser-header-top browser-drag-region" data-tauri-drag-region="deep">
			<TabStrip
				{tabs}
				{activeTabId}
				onSelect={handleSelect}
				onClose={handleClose}
				onNewTab={handleNewTab}
			/>
		</div>

		<!-- Mid row: nav controls + omnibox + actions -->
		<div class="browser-header-mid">
			<NavControls
				canGoBack={activeTab?.can_go_back ?? false}
				canGoForward={activeTab?.can_go_forward ?? false}
				isLoading={activeTab?.loading ?? false}
				onBack={handleBack}
				onForward={handleForward}
				onReload={handleReload}
				onStop={handleStop}
			/>
			<Omnibox
				{windowId}
				url={activeUrl}
				onNavigate={handleNavigate}
			/>
			<BookmarkStar url={activeUrl} />
			<button
				class="browser-vault-trigger"
				class:is-active={showVault}
				onclick={toggleVault}
				aria-label="Password Vault"
				title="Password Vault"
			>
				<img src="/iconset/blueKey.svg" alt="" class="icon-svg-xs" />
			</button>
			<BrowserMenu onShowHistory={() => { showHistory = true; leftCollapsed = false; persistLayout(); }} />
			<VaultPopover open={showVault} onClose={() => showVault = false} currentUrl={activeUrl} {windowId} tabId={activeTabId} />
		</div>

		<!-- Bottom row: bookmarks bar -->
		<div class="browser-header-bot">
			<BookmarksRow onNavigate={handleNavigate} />
		</div>
	</div>

	<!-- Content area: sidebars + viewport -->
	<div class="inside-module-wrapper inside-browser">
		<!-- Left sidebar (collapsible, empty in v1) -->
		<aside
			class="module-sidebar browser-left"
			class:sidebar-collapsed-zone={leftCollapsed}
			style={leftCollapsed ? '' : `width: ${leftWidth}px`}
			aria-label="Browser left panel"
		>
			{#if !leftCollapsed}
				<div class="sidebar-carrier">
					<div class="sidebar-left-wrapper">
						<div class="sidebar-content">
							{#if showHistory}
								<HistoryPanel />
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</aside>

		<!-- Resize handle (left) -->
		{#if !leftCollapsed}
			<button
				class="resize-handle-v"
				onpointerdown={(e) => startResize('left', e)}
				aria-label="Resize left sidebar"
				tabindex="0"
			></button>
		{/if}

		<!-- Central viewport -->
		<div class="module-central">
			<div bind:this={viewport} class="central-carrier browser-viewport" role="region" aria-label="Browser page viewport">
				<!-- Native content webview is positioned over this element by Rust -->

			</div>
		</div>

		<!-- Resize handle (right) -->
		{#if !rightCollapsed}
			<button
				class="resize-handle-v"
				onpointerdown={(e) => startResize('right', e)}
				aria-label="Resize right sidebar"
				tabindex="0"
			></button>
		{/if}

		<!-- Right sidebar (collapsible, empty in v1) -->
		<aside
			class="module-sidebar browser-right"
			class:sidebar-collapsed-zone={rightCollapsed}
			style={rightCollapsed ? '' : `width: ${rightWidth}px`}
			aria-label="Browser right panel"
		>
			{#if !rightCollapsed}
				<div class="sidebar-carrier">
					<div class="sidebar-right-wrapper">
						<div class="sidebar-content">
							<!-- Future: vault or AI context panel -->
						</div>
					</div>
				</div>
			{/if}
		</aside>
	</div>
</div>
