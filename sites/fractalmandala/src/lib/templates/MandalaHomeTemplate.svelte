<script lang="ts">
	type Collection = { title: string; description?: string; slug: string };

	let {
		posts = [],
		writingsCategories = []
	}: { posts?: Collection[]; writingsCategories?: Collection[] } = $props();
</script>

<svelte:head>
	<title>fractal maṇḍala — civilization, philosophy, and technology</title>
	<meta
		name="description"
		content="An open index of essays, civilizational memory, and modern tools for thinking clearly."
	/>
</svelte:head>

<div class="mandala-home">
	<section class="mandala-home-hero">
		<div class="mandala-home-hero-copy">
			<p class="mandala-kicker">A living knowledge archive</p>
			<h1>Indian civilization, philosophy, and modern technology — in one <em>open index.</em></h1>
			<p class="mandala-home-lede">
				Long-form essays, creative worldbuilding, and structured wiki archives for following ideas
				across time.
			</p>
			<div class="mandala-home-actions">
				<a class="mandala-button mandala-button-primary" href="/writings">Read the essays <span aria-hidden="true">↗</span></a>
				<a class="mandala-text-link" href="/civilization">Explore the knowledge banks <span aria-hidden="true">→</span></a>
			</div>
		</div>
		<div class="mandala-home-mark" aria-hidden="true">
			<span>ॐ</span>
			<i></i>
			<i></i>
			<i></i>
		</div>
	</section>

	<section class="mandala-home-section" aria-labelledby="mandala-writing-title">
		<div class="mandala-section-heading">
			<div>
				<p class="mandala-kicker">01 / Writings</p>
				<h2 id="mandala-writing-title">Follow a thread.</h2>
			</div>
			<a class="mandala-text-link" href="/writings">View all writings <span aria-hidden="true">→</span></a>
		</div>
		<div class="mandala-card-grid">
			{#each writingsCategories as category, index (category.slug)}
				<a class="mandala-index-card" href="/writings/{category.slug.split('/').pop()}">
					<span class="mandala-card-index">{String(index + 1).padStart(2, '0')}</span>
					<strong>{category.title}</strong>
					<span>{category.description}</span>
					<small aria-hidden="true">↗</small>
				</a>
			{/each}
		</div>
	</section>

	<section class="mandala-home-section mandala-home-section-banks" aria-labelledby="mandala-bank-title">
		<div class="mandala-section-heading">
			<div>
				<p class="mandala-kicker">02 / Knowledge banks</p>
				<h2 id="mandala-bank-title">A map for going deeper.</h2>
			</div>
			<p class="mandala-section-note">Browse by subject, then let the connections do the work.</p>
		</div>
		<div class="mandala-bank-list">
			{#each posts.filter((post) => post.title !== 'Writings') as post (post.slug)}
				<a class="mandala-bank-row" href="/{post.slug}">
					<span>{post.title}</span>
					<span>{post.description}</span>
					<b aria-hidden="true">→</b>
				</a>
			{/each}
		</div>
	</section>

	<footer class="mandala-home-footer">
		<span>Keep looking.</span>
		<a href="/search.json">Search the archive <span aria-hidden="true">↗</span></a>
	</footer>
</div>
