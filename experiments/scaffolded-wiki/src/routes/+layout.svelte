<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';
import type { LayoutData } from './$types';

let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

let menuOpen = $state(false);

const pathname = $derived(page.url.pathname);

// Close the mobile drawer on navigation.
$effect(() => {
	pathname;
	menuOpen = false;
});	// Copy-button handler for highlighted code blocks (event-delegated so it
	// works for both prerendered and SPA-navigated content).
	$effect(() => {
		const onClick = (e: MouseEvent) => {
			const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.copy-btn');
			if (!btn) return;
			const block = btn.closest<HTMLElement>('.code-block');
			const code = block?.querySelector('pre code');
			if (!code) return;
			navigator.clipboard
				.writeText(code.textContent ?? '')
				.then(() => {
					const old = btn.textContent;
					btn.textContent = 'Copied!';
					btn.classList.add('copied');
					setTimeout(() => {
						btn.textContent = old;
						btn.classList.remove('copied');
					}, 1400);
				})
				.catch(() => {
					btn.textContent = 'Failed';
					setTimeout(() => (btn.textContent = 'Copy'), 1400);
				});
		};
		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
	});

	// Render mermaid diagrams client-side. Blocks are emitted as
	// `<pre class="mermaid">` by the highlighter; mermaid.run() swaps each
	// into an SVG. Lazy-import so the heavy mermaid bundle only loads on
	// pages that actually contain a diagram.
	$effect(() => {
		pathname;
		const blocks = Array.from(document.querySelectorAll('pre.mermaid'));
		if (blocks.length === 0) return;
		let cancelled = false;
		import('mermaid').then(({ default: mermaid }) => {
			if (cancelled) return;
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				darkMode: true,
				securityLevel: 'loose',
				fontFamily: 'inherit'
			});
			for (const el of blocks) {
				// Generated diagrams often embed escaped quotes inside labels
				// (`body=\"\"`), which mermaid rejects — normalize them to single
				// quotes so the diagram parses.
				const src = (el.textContent ?? '').replace(/\\"/g, "'");
				el.textContent = '';
				el.classList.add('mermaid-pending');
				mermaid
					.render(`mermaid-${Math.random().toString(36).slice(2)}`, src)
					.then(({ svg }) => {
						const wrap = document.createElement('div');
						wrap.className = 'mermaid-wrap';
						wrap.innerHTML = svg;
						el.replaceWith(wrap);
					})
					.catch((err) => {
						el.classList.remove('mermaid-pending');
						el.classList.add('mermaid-error');
						el.textContent = `(diagram failed to render: ${err?.message ?? err})`;
					});
			}
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<svelte:head>
	<title>Repowiki — mandala knowledge wiki</title>
	<meta name="description" content="The repowiki — a structured knowledge base for the mandala monorepo: repo docs, project docs, cards and concepts." />
</svelte:head>

<div class="shell">
	<header class="topbar">
		<button
			class="menu-btn"
			onclick={() => (menuOpen = !menuOpen)}
			aria-label="Toggle navigation"
			aria-expanded={menuOpen}
		>
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
				<path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
			</svg>
		</button>

		<a class="brand" href="/">
			<span class="brand-mark">◍</span>
			<span class="brand-name">repo<em>wiki</em></span>
		</a>

		<form class="topbar-search" action="/search" method="get" role="search">
			<input name="q" type="search" placeholder="Search the wiki…" aria-label="Search the wiki" />
		</form>

		<nav class="topbar-links" aria-label="Primary">
			<a href="/tags">Tags</a>
			<a href="/search">Search</a>
		</nav>
	</header>

	<div class="body">
		<aside class="sidebar" class:open={menuOpen}>
			<Sidebar tree={data.tree} tags={data.tags} stats={data.counts} currentPath={pathname} />
		</aside>

		<div
			class="backdrop"
			class:show={menuOpen}
			role="button"
			tabindex="-1"
			aria-label="Close navigation"
			onclick={() => (menuOpen = false)}
			onkeydown={(e) => {
				if (e.key === 'Escape') menuOpen = false;
			}}
		></div>

		<main class="main">
			{@render children()}

			<footer class="site-footer">
				<span>Content lives in <code>repowiki/</code> — one source of truth.</span>
				<span>Built with <code>svelte-docs-scaffold</code> + mdsvex</span>
			</footer>
		</main>
	</div>
</div>
