<script lang="ts">
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';

	const codeFull = `<div data-slot="block-basic">
  <header data-slot="block-basic-header">…</header>
  <main data-slot="block-basic-main">…</main>
  <footer data-slot="block-basic-footer">…</footer>
</div>`;

	const codeNoHeader = `<div data-slot="block-basic">
  <main data-slot="block-basic-main">…</main>
  <footer data-slot="block-basic-footer">…</footer>
</div>`;

	const codeNoFooter = `<div data-slot="block-basic">
  <header data-slot="block-basic-header">…</header>
  <main data-slot="block-basic-main">…</main>
</div>`;

	const codeMainOnly = `<div data-slot="block-basic">
  <main data-slot="block-basic-main">…</main>
</div>`;
</script>

{#snippet brand()}
	<span data-slot="block-title">Fractalsvelte</span>
{/snippet}

{#snippet navLinks()}
	<span style="display: flex; gap: 0.75rem; font-size: 0.8125rem; color: var(--muted-foreground);">
		<span>Docs</span>
		<span>Blog</span>
		<span>Account</span>
	</span>
{/snippet}

{#snippet mainCopy(title: string, body: string)}
	<p data-slot="block-label">Main</p>
	<p data-slot="block-title">{title}</p>
	<p data-slot="block-body-text">{body}</p>
{/snippet}

{#snippet footerCopy()}
	<span>© 2026 Fractalsvelte</span>
	<span style="font-size: 0.75rem;">Privacy · Terms</span>
{/snippet}

{#snippet demoFull()}
	<div data-slot="block-frame">
		<div data-slot="block-basic">
			<header data-slot="block-basic-header">
				{@render brand()}
				{@render navLinks()}
			</header>
			<main data-slot="block-basic-main">
				{@render mainCopy(
					'Full shell',
					'Header, main, and footer. Use this as the default app page frame when every region is present.'
				)}
			</main>
			<footer data-slot="block-basic-footer">
				{@render footerCopy()}
			</footer>
		</div>
	</div>
{/snippet}

{#snippet demoNoHeader()}
	<div data-slot="block-frame">
		<div data-slot="block-basic">
			<main data-slot="block-basic-main">
				{@render mainCopy(
					'No header',
					'Main grows into the top edge. Useful for auth screens, full-bleed canvases, or when the window chrome already provides a title bar.'
				)}
			</main>
			<footer data-slot="block-basic-footer">
				{@render footerCopy()}
			</footer>
		</div>
	</div>
{/snippet}

{#snippet demoNoFooter()}
	<div data-slot="block-frame">
		<div data-slot="block-basic">
			<header data-slot="block-basic-header">
				{@render brand()}
				{@render navLinks()}
			</header>
			<main data-slot="block-basic-main">
				{@render mainCopy(
					'No footer',
					'Common for dashboard shells where content scrolls and legal chrome lives elsewhere.'
				)}
			</main>
		</div>
	</div>
{/snippet}

{#snippet demoMainOnly()}
	<div data-slot="block-frame">
		<div data-slot="block-basic">
			<main data-slot="block-basic-main">
				{@render mainCopy(
					'Main only',
					'Bare content region — pair with a sidebar block, a floating toolbar, or a full-screen experience.'
				)}
			</main>
		</div>
	</div>
{/snippet}

{#snippet demoNoMainChrome()}
	<div data-slot="block-frame">
		<div data-slot="block-basic">
			<header data-slot="block-basic-header">
				{@render brand()}
				{@render navLinks()}
			</header>
			<footer data-slot="block-basic-footer">
				{@render footerCopy()}
			</footer>
		</div>
	</div>
{/snippet}

<h1 class="doc-title">Basic</h1>
<p class="doc-lede">
	The simplest page shell: optional header, flexible main, optional footer. Compose the regions
	you need — nothing more.
</p>

<Preview description="Header + main + footer" code={codeFull}>
	{@render demoFull()}
</Preview>

## Structure

Three regions, all optional except that you almost always want a main:

1. **Header** — brand, primary nav, account
2. **Main** — page content (`flex: 1`, scrolls inside the frame)
3. **Footer** — legal, secondary links, status

Chrome is token-driven (`--muted`, `--border`, `--foreground`). Drop real components into each slot.

## Usage

<CodeBlock code={codeFull} lang="html" />

## Examples

<Examples
	items={[
		{
			title: 'Full',
			demo: demoFull,
			code: codeFull,
			description: 'Header, main, and footer.'
		},
		{
			title: 'No header',
			demo: demoNoHeader,
			code: codeNoHeader,
			description: 'Main + footer only.'
		},
		{
			title: 'No footer',
			demo: demoNoFooter,
			code: codeNoFooter,
			description: 'Header + main only.'
		},
		{
			title: 'Main only',
			demo: demoMainOnly,
			code: codeMainOnly,
			description: 'Content region alone.'
		},
		{
			title: 'Header + footer',
			demo: demoNoMainChrome,
			code: codeFull,
			description: 'Chrome without a main body (edge case for split views).'
		}
	]}
/>

## Composition notes

- Prefer **semantic** `<header>`, `<main>`, `<footer>` for accessibility.
- Put **page scroll on main**, not on the outer app shell, when the header/footer should stay put.
- Nest a [Sidebar Layout](/blocks/sidebar-layout) inside main when you need secondary navigation.
- Style hooks: `data-slot="block-basic"`, `block-basic-header`, `block-basic-main`, `block-basic-footer` (see `src/lib/docs/blocks.sass`).

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--background` | Frame and main |
| `--muted` | Header / footer wash |
| `--border` | Frame and region dividers |
| `--foreground` / `--muted-foreground` | Titles and secondary text |
| `--doc-r-lg` | Preview frame radius |

</div>
