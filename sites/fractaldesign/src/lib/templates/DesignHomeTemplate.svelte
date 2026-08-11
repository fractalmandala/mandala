<script lang="ts">
	type Project = { title: string; href: string; desc: string; glyph: string; tint: string };
	type Post = { linkpath: string; meta: { title: string; description?: string; tags?: string[] } };
	type Page = { link: string; title: string; description: string };

	let { projects = [], posts = [], pages = [] }: { projects: Project[]; posts: Post[]; pages: Page[] } = $props();
	const tints = ['lav', 'mint', 'sky', 'amber', 'rose'];
</script>

<svelte:head>
	<title>Fractal Design — curated systems and playful interfaces</title>
	<meta name="description" content="A quiet lab for design systems, Svelte components, and experiments." />
</svelte:head>

<div class="design-home">
	<section class="design-home-hero dotgrid">
		<div class="fd-wrap">
			<p class="design-kicker">Fractal Design / curation + playground</p>
			<h1>Design, curated —<br /><em>code, at play.</em></h1>
			<p class="design-home-lede">A quiet lab for thoughtful interfaces, useful components, and experiments that stay close to the material.</p>
			<div class="design-home-actions"><a class="design-button" href="/components">Browse components <span aria-hidden="true">↗</span></a><a class="design-link" href="/play">Enter the playground <span aria-hidden="true">→</span></a></div>
			<div class="design-chip-row"><span>Svelte 5</span><span>Indented SASS</span><span>Components</span><span>Playground</span></div>
		</div>
	</section>

	<section class="design-home-section">
		<div class="fd-wrap"><div class="design-section-heading"><div><p class="design-kicker">01 / Projects</p><h2>Things in the workshop.</h2></div><p>Small systems, shared in public.</p></div>
			<div class="design-card-grid">{#each projects as project}<a class="design-index-card" href={project.href || '#'} target={project.href ? '_blank' : undefined} rel={project.href ? 'noreferrer' : undefined}><span class="design-card-glyph design-card-glyph-{project.tint}">{project.glyph}</span><strong>{project.title}</strong><span>{project.desc}</span><b>↗</b></a>{/each}</div>
		</div>
	</section>

	<section class="design-home-section design-home-section-muted">
		<div class="fd-wrap"><div class="design-section-heading"><div><p class="design-kicker">02 / Writing</p><h2>Notes &amp; fieldwork.</h2></div><a class="design-link" href="/posts">Read all notes <span aria-hidden="true">→</span></a></div>
			<div class="design-list">{#each posts.slice(0, 5) as post, index}<a href={post.linkpath}><span>{post.meta.title}</span><small>{post.meta.description}</small><b class="chip design-chip-{tints[index % tints.length]}">{post.meta.tags?.[0] ?? 'note'}</b></a>{/each}</div>
		</div>
	</section>

	<section class="design-home-section">
		<div class="fd-wrap"><div class="design-section-heading"><div><p class="design-kicker">03 / Playground</p><h2>Try the moving parts.</h2></div></div>
			<div class="design-play-grid">{#each pages as item}<a href={item.link}><strong>{item.title}</strong><span>{item.description}</span><b>→</b></a>{/each}</div>
		</div>
	</section>

	<footer class="design-home-footer"><div class="fd-wrap"><span>Make room for the interesting bit.</span><a href="/about">About Fractal Design <span aria-hidden="true">↗</span></a></div></footer>
</div>
