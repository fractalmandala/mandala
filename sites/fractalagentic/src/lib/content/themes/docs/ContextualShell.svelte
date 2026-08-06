<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import GlobalSidebar, { type SidebarSection } from './GlobalSidebar.svelte';
	import Toc from './Toc.svelte';
	import { observeHeadings } from './scroll-spy';

	let {
		sections,
		children
	}: { sections: SidebarSection[]; children: Snippet } = $props();

	let sidebarOpen = $state(false);
	let navCollapsed = $state(false);
	const currentPath = $derived(page.url.pathname.replace(/\/$/, '') || '/');

	type TocItem = { id: string; text: string; depth: number };
	// Detail pages (skills/agents/commands/bosses) return `toc` from their
	// load; list pages don't, so the rail stays empty there.
	const toc = $derived((page.data.toc ?? []) as TocItem[]);
	let contentEl: HTMLElement | undefined = $state();
	let activeHeadingId: string | undefined = $state();

	// Re-attach the scroll-spy whenever navigation swaps in a new detail page.
	$effect(() => {
		void currentPath;
		return observeHeadings(
			contentEl ?? null,
			toc.map((item) => item.id),
			(id) => (activeHeadingId = id ?? undefined)
		);
	});

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<div class="contextual-layout" class:nav-collapsed={navCollapsed}>
	<button
		class="mobile-toggle"
		type="button"
		aria-expanded={sidebarOpen}
		aria-controls="contextual-sidebar"
		onclick={() => (sidebarOpen = !sidebarOpen)}
	>
		{sidebarOpen ? 'Close menu' : 'Menu'}
	</button>

	<aside id="contextual-sidebar" class:open={sidebarOpen}>
		<nav aria-label="Global navigation">
			<GlobalSidebar {sections} onNavigate={closeSidebar} />
		</nav>
		<button
			class="rail-toggle"
			type="button"
			aria-expanded={!navCollapsed}
			aria-label={navCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			onclick={() => (navCollapsed = !navCollapsed)}
		>
			<span aria-hidden="true">{navCollapsed ? '›' : '‹'}</span>
		</button>
	</aside>

	<div class="contextual-content" bind:this={contentEl}>
		{@render children()}
	</div>

	<aside class="toc-rail" aria-label="Table of contents">
		{#if toc.length > 0}
			<Toc items={toc} activeId={activeHeadingId} />
		{/if}
	</aside>
</div>

<style>
	.contextual-layout {
		display: grid;
		grid-template-columns: 17.5rem minmax(0, 1fr) 15.5rem;
		padding: 0 1rem;
		transition: grid-template-columns 220ms cubic-bezier(0.23, 1, 0.32, 1);
	}

	.contextual-layout.nav-collapsed {
		grid-template-columns: 2.6rem minmax(0, 1fr) 15.5rem;
	}

	.mobile-toggle {
		display: none;
	}

	.contextual-layout aside {
		position: sticky;
		top: 3.6rem;
		height: calc(100vh - 3.6rem);
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--line);
		overflow: hidden;
	}

	.contextual-layout aside nav {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		padding: 1.5rem 0.75rem 1rem 0;
	}

	.contextual-layout aside nav :global(a) {
		display: block;
		padding: 0.42rem 0.55rem;
		border-radius: 0.35rem;
		color: var(--text-soft);
		font-size: 0.86rem;
		text-decoration: none;
	}

	.contextual-layout aside nav :global(a:hover),
	.contextual-layout aside nav :global(a[aria-current='page']) {
		background: var(--bg-soft);
		color: var(--accent-strong);
	}

	.nav-collapsed aside nav {
		display: none;
	}

	.rail-toggle {
		margin: auto 0 1rem;
		align-self: flex-start;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 0.45rem;
		background: transparent;
		color: var(--text-dim);
		cursor: pointer;
	}

	.contextual-content {
		min-width: 0;
		max-width: 50rem;
		width: 100%;
		margin: 0 auto;
		padding: 1.75rem 3rem 4rem;
	}

	.toc-rail {
		border-right: none !important;
		border-left: 1px solid var(--line);
		padding: 1.75rem 0 2.5rem 1.25rem;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		font-size: 0.8rem;
	}

	@media (max-width: 1100px) {
		.contextual-layout {
			grid-template-columns: 17.5rem minmax(0, 1fr);
		}

		.contextual-layout.nav-collapsed {
			grid-template-columns: 2.6rem minmax(0, 1fr);
		}

		.toc-rail {
			display: none;
		}
	}

	@media (max-width: 900px) {
		.contextual-layout,
		.contextual-layout.nav-collapsed {
			grid-template-columns: 1fr;
			padding-top: 0.85rem;
		}

		.mobile-toggle {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			justify-self: start;
			padding: 0.5rem 0.85rem;
			border: 1px solid var(--line);
			border-radius: 0.55rem;
			background: var(--bg-soft);
			color: var(--text);
			font-weight: 600;
		}

		.contextual-layout aside {
			display: none;
			position: static;
			height: auto;
			border-right: none;
			border-bottom: 1px solid var(--line);
			overflow: visible;
		}

		.contextual-layout aside.open {
			display: block;
		}

		.contextual-layout aside nav,
		.nav-collapsed aside nav {
			display: block;
			padding: 0.85rem 0 1.25rem;
			overflow: visible;
		}

		.rail-toggle {
			display: none;
		}

		.contextual-content {
			padding: 1.25rem 1rem 3rem;
		}
	}
</style>
