<script lang="ts">
	let { data } = $props();

	const projects = [
		{
			title: 'Fractals',
			href: 'https://github.com/fractalmandala/fractals',
			desc: "A monorepo and desktop app that's my main building project — an ambitious all-in-one app for macOS.",
			glyph: '◆',
			tint: 'rose'
		},
		{
			title: 'Svelte Animated Icon',
			href: 'https://svelte-animated-icon.vercel.app/',
			desc: 'GitHub repo and npm package for more than 100,000 animated icon variants, drop-and-use in SvelteKit.',
			glyph: '✦',
			tint: 'sky'
		},
		{
			title: 'Fractaldharma',
			href: 'https://www.fractaldharma.in/',
			desc: 'The Sanskrit word and text repository — an interconnected web for synaptic reconnection to the Bharatiya consciousness.',
			glyph: '❋',
			tint: 'amber'
		},
		{
			title: 'Fractalmandala',
			href: 'https://www.fractalmandala.in/',
			desc: 'My blog and a growing knowledge bank.',
			glyph: '✳',
			tint: 'mint'
		},
		{
			title: 'Pipeline',
			href: '',
			desc: 'In the workshop: Fractalbodha, an AI chat app, and Design Bench.',
			glyph: '◌',
			tint: 'lav'
		}
	];

	const tints = ['lav', 'mint', 'sky', 'amber', 'rose'];
</script>

<!-- 01 // hero -->
<section class="fd-hero dotgrid">
	<div class="fd-wrap box gap16">
		<p class="eyebrow">Fractal Design // curation + playground</p>
		<h1 class="display fd-hero-title">
			Design, curated —<br />
			<em>code, at play.</em>
		</h1>
		<p class="fd-hero-sub">
			I'm a hobbyist designer and web builder with a healthy indulgence for vibe
			coding. Here I curate the best I find, share my own builds, and experiment
			with new stuff in a SvelteKit playground.
		</p>
		<div class="row wrap gap8 padtop8">
			<a class="btn-pill btn-pill--brand" href="/components">Browse components</a>
			<a class="btn-quiet" href="/play">Enter the playground</a>
		</div>
		<div class="row wrap gap8 padtop16">
			<span class="chip chip--rose">Svelte 5 runes</span>
			<span class="chip chip--lav">SvelteKit 2</span>
			<span class="chip chip--mint">Indented SASS</span>
			<span class="chip chip--sky">100+ components</span>
			<span class="chip chip--amber">Playground</span>
		</div>
	</div>
</section>

<!-- 02 // projects -->
<section class="fd-section">
	<div class="fd-wrap">
		<div class="fd-section-head">
			<div class="box gap4">
				<p class="eyebrow">02 // Projects</p>
				<h2 class="display">Things I build</h2>
			</div>
		</div>
		<div class="fd-grid">
			{#each projects as project}
				{#if project.href}
					<a class="fd-card" href={project.href} target="_blank" rel="noreferrer">
						<span class="fd-card-glyph" style="background: var(--chip-{project.tint}-bg); color: var(--chip-{project.tint}-tx)">{project.glyph}</span>
						<span class="fd-card-title">{project.title}</span>
						<span class="fd-card-desc">{project.desc}</span>
					</a>
				{:else}
					<div class="fd-card">
						<span class="fd-card-glyph" style="background: var(--chip-{project.tint}-bg); color: var(--chip-{project.tint}-tx)">{project.glyph}</span>
						<span class="fd-card-title">{project.title}</span>
						<span class="fd-card-desc">{project.desc}</span>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<!-- 03 // posts -->
<section class="fd-section">
	<div class="fd-wrap">
		<div class="fd-section-head">
			<div class="box gap4">
				<p class="eyebrow">03 // Posts</p>
				<h2 class="display">Notes &amp; writing</h2>
			</div>
		</div>
		{#if data.posts?.length}
			<div class="fd-grid">
				{#each data.posts as post, i}
					<a class="fd-card" href={post.linkpath}>
						<span class="fd-card-title">{post.meta.title}</span>
						<span class="fd-card-desc">{post.meta.description}</span>
						{#if post.meta.tags?.length}
							<div class="row wrap gap4 padtop4">
								{#each post.meta.tags as tag, ti}
									<span class="chip chip--{tints[(i + ti) % tints.length]}">{tag}</span>
								{/each}
							</div>
						{/if}
					</a>
				{/each}
			</div>
		{:else}
			<p class="fd-card-desc">Nothing published yet — the ink is drying.</p>
		{/if}
	</div>
</section>

<!-- 04 // play -->
<section class="fd-section">
	<div class="fd-wrap">
		<div class="fd-section-head">
			<div class="box gap4">
				<p class="eyebrow">04 // Play</p>
				<h2 class="display">The playground</h2>
			</div>
		</div>
		{#if data.pages?.length}
			<div class="fd-grid">
				{#each data.pages as page, i}
					<a class="fd-card" href={page.link}>
						<span class="fd-card-glyph" style="background: var(--chip-{tints[i % tints.length]}-bg); color: var(--chip-{tints[i % tints.length]}-tx)">→</span>
						<span class="fd-card-title">{page.title}</span>
						<span class="fd-card-desc">{page.description}</span>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- 05 // elsewhere -->
<section class="fd-section">
	<div class="fd-wrap">
		<div class="fd-card" style="max-width: 720px">
			<p class="eyebrow">05 // Elsewhere</p>
			<p class="fd-card-desc" style="font-size: 15px">
				I also write at <a class="link" href="https://www.fractalmandala.in" target="_blank" rel="noreferrer">fractalmaṇḍala</a>,
				and am co-founder of <a class="link" href="https://www.bodharesearch.in" target="_blank" rel="noreferrer">Bodha</a>,
				a cultural think-tank and research group. The dream of a fully connected
				sanskritic synaptic mesh lives at <a class="link" href="https://www.fractaldharma.in" target="_blank" rel="noreferrer">fractaldharma</a>.
				Find me on <a class="link" href="https://www.twitter.com/saamaanyafreaky" target="_blank" rel="noreferrer">twitter/x</a>,
				and the monorepo for all my design work at <a class="link" href="https://github.com/fractalmandala/fractals" target="_blank" rel="noreferrer">github</a>.
			</p>
		</div>
	</div>
</section>
