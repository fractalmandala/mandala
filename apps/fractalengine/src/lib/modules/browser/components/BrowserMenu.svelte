<script lang="ts">
	// Browser Menu — ⋯ overflow menu (§3.10/B4)
	// Hand-rolled dropdown with controlled open prop, wired to overlay coordinator.
	// Contents: History panel, Bookmarks, Settings, Open in OS browser.
	import { incrementOverlay, decrementOverlay } from '../state/overlayCoordinator.svelte';

	interface Props { onShowHistory?: () => void; }
	let { onShowHistory = () => {} }: Props = $props();
	let open = $state(false);

	function openMenu() {
		open = true;
		incrementOverlay();
	}

	function closeMenu() {
		open = false;
		decrementOverlay();
	}

	function toggle() {
		if (open) closeMenu();
		else openMenu();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeMenu();
	}

	function handleItemClick(cb: () => void) {
		return () => {
			cb();
			closeMenu();
		};
	}
</script>

<div class="btn-icon">
	<button
		class="browser-menu-btn"
		onclick={toggle}
		aria-label="Browser menu"
		aria-haspopup="true"
		aria-expanded={open}
		title="Browser menu"
	>
		<img src="/iconset/menu.svg" alt="" class="icon-svg-sm" />
	</button>

	{#if open}
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			class="browser-menu-dropdown"
			role="menu"
			onclick={closeMenu}
			onkeydown={handleKeydown}
		>
			<button class="browser-menu-item" role="menuitem" onclick={handleItemClick(onShowHistory)}>
				<img src="/iconset/history.svg" alt="" class="icon-svg-xs" />
				History
			</button>
			<button class="browser-menu-item" role="menuitem" onclick={handleItemClick(() => window.dispatchEvent(new CustomEvent('browser:show-bookmarks')))}>
				<img src="/iconset/bookmarks.svg" alt="" class="icon-svg-xs" />
				Bookmarks
			</button>
			<hr class="browser-menu-separator" />
			<button class="browser-menu-item" role="menuitem" onclick={handleItemClick(() => { /* TODO: open in OS browser */ })}>
				<img src="/iconset/externalLink.svg" alt="" class="icon-svg-xs" />
				Open in OS Browser
			</button>
		</div>
	{/if}
</div>
