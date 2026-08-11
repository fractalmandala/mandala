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

	/** Controls for the mobile nav drawer, surfaced to the header snippet. */
	interface NavCtl {
		open: boolean;
		toggle: () => void;
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
		header?: Snippet<[NavCtl]>;
		sidebarleft?: Snippet;
		sidebarright?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		ambient?: boolean;
		showLeft?: boolean;
		showRight?: boolean;
		mobileOpen?: boolean;
	} = $props();

	const navctl: NavCtl = {
		get open() {
			return mobileOpen;
		},
		toggle() {
			mobileOpen = !mobileOpen;
		}
	};
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
		{@render header?.(navctl)}
	</header>

	<main class="appbody" data-mobile-open={mobileOpen} class:no-left={!showLeft} class:no-right={!showRight} class:no-both={!showLeft && !showRight}>
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

		{#if mobileOpen}
			<button
				type="button"
				class="appbody-backdrop"
				aria-label="Close navigation"
				onclick={() => (mobileOpen = false)}
			></button>
		{/if}
	</main>

	{#if footer}
		<footer class="appfooter">
			{@render footer()}
		</footer>
	{/if}
</section>

<style lang="sass">

// CUBE · Composition layer
// ----------------------------------------------------------------------
// Named, token-driven layout skeletons. These describe *arrangement* only
// (the C in CUBE) — no colours, no component detail. Utilities and blocks
// layer on top. Exceptions are expressed with data-* / aria-* attributes,
// never with BEM modifiers.
//
//   1. App shell — the canonical docs layout
//   2. Layout primitives — stack / cluster / sidebar / reel
//   3. Ambient background — decorative, theme-aware blobs
// ----------------------------------------------------------------------

// 1. App shell ---------------------------------------------------------
// section.appshell > header.appheader + main.appbody + footer.appfooter
// main.appbody > aside.sidebarleft + article.bodymain + aside.sidebarright

.appshell
	position: relative
	isolation: isolate
	display: flex
	flex-direction: column
	min-height: 100vh
	background: var(--bg-app)
	color: var(--text-primary)

.appheader
	position: sticky
	top: 0
	z-index: 50
	display: flex
	align-items: center
	height: var(--header-height)
	padding-inline: var(--shell-pad, 20px)
	border-bottom: 1px solid var(--border)
	background: color-mix(in srgb, var(--bg-app) 80%, transparent)
	backdrop-filter: blur(10px)
	-webkit-backdrop-filter: blur(10px)

.appbody
	position: relative
	display: grid
	grid-template-columns: 1fr
	min-height: calc(100vh - var(--header-height))

.appfooter
	display: flex
	align-items: center
	min-height: var(--footer-height)
	padding-inline: var(--shell-pad, 20px)
	border-top: 1px solid var(--border)
	background: var(--bg-app)

// Middle reading column. In the canonical markup <article class="bodymain">
// IS the middle cell; its content is constrained to a comfortable measure
// that grows from --body-min to --body-max and stays centred.
.bodymain
	min-width: 0
	display: flex
	flex-direction: column
	padding-block: 32px
	padding-inline: var(--shell-pad, 20px)
	> *
		width: 100%
		max-width: clamp(var(--body-min, 600px), 58vw, var(--body-max, 720px))
		margin-inline: auto

// Sidebars. Mobile-first: both hidden.
.sidebarleft, .sidebarright
	min-width: 0
	display: none

@media (min-width: 1025px)
	// Two-column: left sidebar (200–320 px) + fluid body
	.appbody
		--shell-cols: clamp(var(--sidebar-min, 200px), 20vw, var(--sidebar-max, 320px))
		grid-template-columns: var(--shell-cols) minmax(0, 1fr)

	.sidebarleft
		display: flex
		flex-direction: column
		position: sticky
		top: var(--header-height)
		height: calc(100vh - var(--header-height))
		overflow-y: auto
		padding: 32px 20px
		border-right: 1px solid var(--border)

	.sidebarright
		display: none

@media (min-width: 1201px)
	// Three-column: both sidebars at identical widths, body takes the rest
	.appbody
		grid-template-columns: var(--shell-cols) minmax(0, 1fr) var(--shell-cols)

	.sidebarright
		display: flex
		flex-direction: column
		position: sticky
		top: var(--header-height)
		height: calc(100vh - var(--header-height))
		overflow-y: auto
		padding: 32px 20px
		border-left: 1px solid var(--border)

// Thin, quiet scrollbars for the sticky rails
.sidebarleft, .sidebarright
	scrollbar-width: thin
	scrollbar-color: var(--border-secondary) transparent
	&::-webkit-scrollbar
		width: 6px
	&::-webkit-scrollbar-thumb
		background-color: var(--border-secondary)
		border-radius: 9999px
	&::-webkit-scrollbar-track
		background-color: transparent

// 2. Layout primitives -------------------------------------------------
// Classic composition utilities — reusable everywhere, framework-free.

// Vertical rhythm: owl selector, gap via --stack-gap
.stack
	display: flex
	flex-direction: column
	justify-content: flex-start
	> * + *
		margin-block-start: var(--stack-gap, 16px)

// Wrapping row of items with a shared gap
.cluster
	display: flex
	flex-wrap: wrap
	gap: var(--cluster-gap, 12px)
	align-items: center

// Intrinsic sidebar: a fixed-ish rail beside a fluid main, wraps when tight
.with-sidebar
	display: flex
	flex-wrap: wrap
	gap: var(--sidebar-gap, 24px)
	> .rail
		flex-basis: var(--rail-width, 240px)
		flex-grow: 1
	> .flow
		flex-basis: 0
		flex-grow: 999
		min-width: var(--flow-min, 60%)

// Horizontal overflow scroller
.reel
	display: flex
	gap: var(--reel-gap, 16px)
	overflow-x: auto
	overscroll-behavior-inline: contain
	scroll-snap-type: inline mandatory
	> *
		scroll-snap-align: start
		flex: 0 0 auto

// 3. Ambient background ------------------------------------------------
// Decorative, theme-aware colour wash. Sits behind app content at -1.
// Colours + per-blob opacity come from tokens (themed light/dark).

.ambient
	position: absolute
	inset: 0
	z-index: -1
	overflow: hidden
	pointer-events: none

.ambient-blob
	position: absolute
	border-radius: 9999px
	filter: blur(var(--ambient-blur, 60px))

.ambient-blob-1
	width: 60vh
	height: 60vh
	top: -8rem
	left: -8rem
	background: var(--ambient-1-bg)
	opacity: var(--ambient-1-op)

.ambient-blob-2
	width: 50vh
	height: 40vh
	right: 2.5rem
	bottom: -5rem
	background: var(--ambient-2-bg)
	opacity: var(--ambient-2-op)

.ambient-blob-3
	width: 45vh
	height: 35vh
	top: 7rem
	left: 25%
	background: var(--ambient-3-bg)
	opacity: var(--ambient-3-op)


</style>