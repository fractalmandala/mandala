<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Executive Bosses · Fractal Agentic</title>
</svelte:head>

<div class="reference-page reference-page--bosses">
	<header class="page-head">
		<p class="page-head__kicker">Progressive discovery / Executive routing</p>
		<h1 class="page-head__title">Executive bosses</h1>
		<p class="page-head__desc">
			The startup router selects exactly one domain executive. Read only that boss's nested
			playbook, then use <a href="/commands/orchestrate">/orchestrate</a> for delivery, verification,
			and final review.
		</p>
		<p class="page-head__meta">
			<a href="/docs/agents">Startup router</a>
			<span aria-hidden="true"> → </span>
			<a href="/docs/bosses">Boss playbook index</a>
		</p>
	</header>

	<div class="boss-grid">
		{#each data.bosses as boss (boss.id)}
			<a class="boss-card" href={boss.href}>
				<span class="boss-card__name">{boss.name}</span>
				<span class="boss-card__mission">{boss.mission}</span>
			</a>
		{/each}
	</div>
</div>
