<script lang="ts">
	/**
	 * fractals-styler — canonical docs app shell (CUBE Composition layer).
	 *
	 * Renders the fixed skeleton:
	 *   section.appshell > header.appheader + main.appbody + footer.appfooter
	 *   main.appbody > aside.sidebarleft + article.bodymain + aside.sidebarright
	 *
	 * All visual arrangement lives in _compositions.sass; this component only
	 * wires the snippets, the ambient background, and the <1025 mobile drawer.
	 *
	 *   <AppShell bind:mobileOpen>
	 *     {#snippet header(nav)}
	 *       <button onclick={nav.toggle}>menu</button> …
	 *     {/snippet}
	 *     {#snippet sidebarleft()} … {/snippet}
	 *     {#snippet sidebarright()} … {/snippet}
	 *     {#snippet footer()} … {/snippet}
	 *     … page content (bodymain) …
	 *   </AppShell>
	 */
	import type { Snippet } from 'svelte';

	interface NavControls {
		open: boolean;
		toggle: () => void;
		close: () => void;
	}

	let {
		header,
		sidebarleft,
		sidebarright,
		footer,
		children,
		ambient = true,
		showLeft = sidebarleft != null,
		showRight = sidebarright != null,
		mobileOpen = $bindable(false)
	}: {
		header?: Snippet<[NavControls]>;
		sidebarleft?: Snippet;
		sidebarright?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		ambient?: boolean;
		showLeft?: boolean;
		showRight?: boolean;
		mobileOpen?: boolean;
	} = $props();

	const nav: NavControls = {
		get open() {
			return mobileOpen;
		},
		toggle: () => (mobileOpen = !mobileOpen),
		close: () => (mobileOpen = false)
	};

	const bodyClass = $derived(
		!showLeft && !showRight
			? 'appbody no-both'
			: !showLeft
				? 'appbody no-left'
				: !showRight
					? 'appbody no-right'
					: 'appbody'
	);
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
		{@render header?.(nav)}
	</header>

	<main class={bodyClass} data-mobile-open={mobileOpen ? 'true' : undefined}>
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

		{#if showLeft && mobileOpen}
			<button
				type="button"
				class="appbody-backdrop"
				aria-label="Close menu"
				onclick={nav.close}
			></button>
		{/if}
	</main>

	{#if footer}
		<footer class="appfooter">
			{@render footer()}
		</footer>
	{/if}
</section>
