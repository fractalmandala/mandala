<script lang="ts">
	/**
	 * fractals-styler — canonical docs app shell (CUBE Composition layer).
	 *
	 * Renders the fixed skeleton:
	 *   section.appshell > header.appheader + main.appbody + footer.appfooter
	 *   main.appbody > aside.sidebarleft + article.bodymain + aside.sidebarright
	 *
	 * All visual arrangement lives in _compositions.sass; this component only
	 * wires the snippets and the ambient background. Sidebar visibility is
	 * handled by CSS media queries (both hidden <1025 px, left-only at
	 * 1025–1200 px, both visible at 1201 px+).
	 *
	 *   <AppShell>
	 *     {#snippet header()} … {/snippet}
	 *     {#snippet sidebarleft()} … {/snippet}
	 *     {#snippet sidebarright()} … {/snippet}
	 *     {#snippet footer()} … {/snippet}
	 *     … page content (bodymain) …
	 *   </AppShell>
	 */
	import type { Snippet } from 'svelte';

	let {
		header,
		sidebarleft,
		sidebarright,
		footer,
		children,
		ambient = true,
		showLeft = sidebarleft != null,
		showRight = sidebarright != null
	}: {
		header?: Snippet;
		sidebarleft?: Snippet;
		sidebarright?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		ambient?: boolean;
		showLeft?: boolean;
		showRight?: boolean;
	} = $props();
</script>

<section class="appshell">
	{#if ambient}
		<div class="ambient" aria-hidden="true">
			<div class="ambient-blob ambient-blob-1"></div>
			<div class="ambient-blob ambient-blob-2"></div>
			<div class="ambient-blob ambient-blob-3"></div>
		</div>
	{/if}

	<header class="appheader">
		{@render header?.()}
	</header>

	<main class="appbody">
		{#if showLeft}
			<aside class="sidebarleft">
				{@render sidebarleft?.()}
			</aside>
		{/if}

		<article class="bodymain">
			{@render children?.()}
		</article>

		{#if showRight}
			<aside class="sidebarright">
				{@render sidebarright?.()}
			</aside>
		{/if}
	</main>

	{#if footer}
		<footer class="appfooter">
			{@render footer()}
		</footer>
	{/if}
</section>
