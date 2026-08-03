<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { categories, getSupportedCatalog, searchSupportedCatalog } from '$lib/catalog/index.js';
	import { guides } from './content.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	let drawerOpen = $state(false);
	let searchOpen = $state(false);
	let query = $state('');
	let theme = $state<'light' | 'dark' | 'system'>('system');
	let drawer = $state<HTMLElement>();
	let searchInput = $state<HTMLInputElement>();
	const results = $derived(searchSupportedCatalog(query).slice(0, 12));
	const supported = getSupportedCatalog();
	const path = $derived(page.url.pathname);
	function supportedCount(category: string) {
		return supported.filter((entry) => entry.category === category).length;
	}

	function applyTheme(value: typeof theme) {
		if (!browser) return;
		const dark =
			value === 'dark' ||
			(value === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.classList.toggle('dark', dark);
		document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
	}

	function setTheme(value: typeof theme) {
		theme = value;
		localStorage.setItem('fractal-svelte-theme', value);
		applyTheme(value);
	}

	function cycleTheme() {
		setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system');
	}

	function closeOverlays() {
		drawerOpen = false;
		searchOpen = false;
	}

	function trap(event: KeyboardEvent, container: HTMLElement) {
		if (event.key === 'Escape') return closeOverlays();
		if (event.key !== 'Tab') return;
		const focusable = [
			...container.querySelectorAll<HTMLElement>(
				'a,button,input,[tabindex]:not([tabindex="-1"])'
			)
		];
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (!browser) return;
		theme = (localStorage.getItem('fractal-svelte-theme') as typeof theme | null) ?? 'system';
		applyTheme(theme);
		const media = matchMedia('(prefers-color-scheme: dark)');
		const updateMedia = () => theme === 'system' && applyTheme(theme);
		const updateStorage = (event: StorageEvent) =>
			event.key === 'fractal-svelte-theme' &&
			setTheme((event.newValue as typeof theme) ?? 'system');
		const shortcut = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				searchOpen = true;
			}
			if (event.key === 'Escape') closeOverlays();
		};
		media.addEventListener('change', updateMedia);
		addEventListener('storage', updateStorage);
		addEventListener('keydown', shortcut);
		return () => {
			media.removeEventListener('change', updateMedia);
			removeEventListener('storage', updateStorage);
			removeEventListener('keydown', shortcut);
		};
	});

	$effect(() => {
		if (drawerOpen)
			queueMicrotask(() => drawer?.querySelector<HTMLElement>('a,button')?.focus());
		if (searchOpen) queueMicrotask(() => searchInput?.focus());
	});
</script>

<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header">
	<a class="brand" href="/" aria-label="Fractal Svelte home"
		><img src="/logomotif.png" alt="" /><span>Fractal Svelte</span></a
	>
	<nav class="header-nav" aria-label="Primary">
		{#each categories as category}<a
				href="/components/{category.slug}"
				aria-current={path.startsWith(`/components/${category.slug}`) ? 'page' : undefined}
				>{category.name}</a
			>{/each}<a
			href="/docs/getting-started"
			aria-current={path.startsWith('/docs/') ? 'page' : undefined}>Guides</a
		>
	</nav>
	<div class="header-actions">
		<button
			class="search-trigger"
			type="button"
			onclick={() => (searchOpen = true)}
			aria-haspopup="dialog"><span>Search</span><kbd>⌘K</kbd></button
		>
		<button
			class="icon-button"
			type="button"
			onclick={cycleTheme}
			aria-label="Theme: {theme}. Change theme"
			title="Theme: {theme}"
			><span aria-hidden="true">{theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '◐'}</span
			></button
		>
		<button
			class="icon-button menu-button"
			type="button"
			onclick={() => (drawerOpen = true)}
			aria-expanded={drawerOpen}
			aria-controls="mobile-navigation"
			aria-label="Open navigation">☰</button
		>
	</div>
</header>

<div class="site-layout">
	<aside class="desktop-sidebar">
		<nav aria-label="Documentation">
			<p>Components</p>
			{#each categories as category}<a
					href="/components/{category.slug}"
					aria-current={path === `/components/${category.slug}` ? 'page' : undefined}
					>{category.name}<span>{supportedCount(category.slug)}</span></a
				>{/each}
			<p>Guides</p>
			{#each guides as guide}<a
					href="/docs/{guide.slug}"
					aria-current={path === `/docs/${guide.slug}` ? 'page' : undefined}
					>{guide.name}</a
				>{/each}
		</nav>
	</aside>
	<main id="main-content">{@render children()}</main>
</div>

<footer class="site-footer">
	<div>
		<strong>Fractal Svelte</strong>
		<p>Motion primitives, agent components, and product blocks for Svelte 5.</p>
	</div>
	<nav aria-label="Footer">
		{#each categories as category}<a href="/components/{category.slug}">{category.name}</a
			>{/each}<a href="/llms.txt">llms.txt</a>
	</nav>
</footer>

{#if drawerOpen}
	<div
		class="overlay"
		role="presentation"
		onclick={(event) => event.currentTarget === event.target && closeOverlays()}
	>
		<div
			id="mobile-navigation"
			class="drawer"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-label="Navigation"
			bind:this={drawer}
			onkeydown={(event) => trap(event, event.currentTarget)}
		>
			<div class="dialog-header">
				<strong>Navigate</strong><button
					class="icon-button"
					type="button"
					onclick={closeOverlays}
					aria-label="Close navigation">×</button
				>
			</div>
			<nav>
				{#each categories as category}<a
						href="/components/{category.slug}"
						onclick={closeOverlays}>{category.name}</a
					>{/each}{#each guides as guide}<a
						href="/docs/{guide.slug}"
						onclick={closeOverlays}>{guide.name}</a
					>{/each}
			</nav>
		</div>
	</div>
{/if}

{#if searchOpen}
	<div
		class="overlay overlay--search"
		role="presentation"
		onclick={(event) => event.currentTarget === event.target && closeOverlays()}
	>
		<div
			class="search-dialog"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-label="Search components"
			onkeydown={(event) => trap(event, event.currentTarget)}
		>
			<div class="search-input">
				<span aria-hidden="true">⌕</span><input
					bind:this={searchInput}
					bind:value={query}
					placeholder="Search 29 components…"
					aria-label="Search components"
				/><button
					class="icon-button"
					type="button"
					onclick={closeOverlays}
					aria-label="Close search">×</button
				>
			</div>
			<div class="search-results" aria-live="polite">
				{#each results as result}<a
						href="/components/{result.category}/{result.slug}"
						onclick={closeOverlays}
						><span
							><strong>{result.name}</strong><small
								>{result.category} · {result.status}</small
							></span
						><span aria-hidden="true">→</span></a
					>{/each}{#if results.length === 0}<p>No matching components.</p>{/if}
			</div>
		</div>
	</div>
{/if}
