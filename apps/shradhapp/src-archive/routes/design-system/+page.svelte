<script lang="ts">
	let theme = $state<'dark' | 'light'>('dark');
	$effect(() => {
		document.documentElement.dataset.theme = theme;
	});
</script>

<main class="col min-h-0 pad32 gap32">
	<header class="row ycenter xbetween wrap gap16"><div class="col gap4"><p class="eyebrow">Shradhapp</p><h1>Design system</h1><p class="page-intro">Composable primitives, controls, surfaces, and workspace regions.</p></div><button class="button button-primary" onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}>Use {theme === 'dark' ? 'light' : 'dark'} mode</button></header>
	<section class="grid grid-cols-2 gap16">
		<section class="surface panel pad32 gap16"><div class="col gap4"><p class="eyebrow">Typography</p><h2>Clear hierarchy</h2><p class="text-muted lh15">Use type, colour, line-height, and truncation primitives instead of styling a child tag from its container.</p></div><div class="row wrap gap8"><span class="text-xs text-muted">Small muted</span><span class="text-sm text-accent fw600">Accent</span><span class="text-sm text-success fw600">Success</span><span class="text-sm text-danger fw600">Danger</span></div></section>
		<section class="surface panel pad32 gap16"><div class="col gap4"><p class="eyebrow">Controls and links</p><h2>One control contract</h2><p class="text-muted lh15">Controls share focus, border, radius, pointer, and motion behavior.</p></div><div class="row wrap ycenter gap8"><button class="button button-primary">Primary action</button><button class="button button-quiet">Quiet action</button><button class="icon-button" aria-label="Example icon action">+</button><a class="link" href="/">Example link</a></div></section>
		<section class="surface panel pad32 gap16"><div class="col gap4"><p class="eyebrow">Layout</p><h2>Composable regions</h2><p class="text-muted lh15">Use row, col, grid, gap, grow, min-size, overflow, and border primitives to assemble views.</p></div><div class="row gap8"><div class="surface grow pad8 text-sm">Main surface</div><aside class="surface pad8 text-sm">Sidebar</aside></div></section>
		<section class="drawer panel pad32 gap16"><div class="col gap4"><p class="eyebrow">Surface families</p><h2>Panels, sidebars, drawers</h2><p class="text-muted lh15">These are general component families; project-specific views compose them instead of redefining their foundations.</p></div><div class="notice border radius-sm text-sm">Notices remain content-level feedback, not page layout containers.</div></section>
	</section>
</main>
