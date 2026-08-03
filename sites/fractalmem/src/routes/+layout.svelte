<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import 'virtual:fractals-styler.css';
	import '$lib/styles/index.sass';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let onDocs = $derived(page.url.pathname.startsWith('/docs'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="site-shell">
	<header class="site-header row ycenter xbetween">
			<a class="logo-area row ycenter gap8 blank" href={resolve('/')}>
				<img src="/images/logomotif.png" class="logomotif" alt="motif"/>
				<img src="/images/logotype-b.png" class="logotype" alt="logotype"/>
			</a>
			<nav class="site-nav row ycenter gap24" aria-label="Site">
				<a
					class="blank text-sm"
					class:active={!onDocs}
					aria-current={!onDocs ? 'page' : undefined}
					href={resolve('/')}>Home</a
				>
				<a
					class="blank text-sm"
					class:active={onDocs}
					aria-current={onDocs ? 'page' : undefined}
					href={resolve('/docs')}>Docs</a
				>
			</nav>
	</header>

	<main class="site-main">
		{@render children()}
	</main>

	<footer class="site-footer">
		<div class="site-footer-inner row xbetween ycenter">
			<span class="text-sm col3"
				>fractalmem &middot; SKAA persistent memory for AI agents</span
			>
			<nav class="row gap16" aria-label="Footer">
				<a class="blank text-sm col2" href={resolve('/docs')}>Documentation</a>
			</nav>
		</div>
	</footer>
</div>
