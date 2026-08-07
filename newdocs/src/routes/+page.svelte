<script lang="ts">
	import { docsConfig } from '$lib/docs/config.js';
</script>

<main class="home">
	<section class="home-hero">
		<span class="home-kicker">Knowledge base</span>
		<h1 class="home-title">{docsConfig.site.title}</h1>
		<p class="home-lead">
			{docsConfig.site.description}
		</p>
		<div class="home-actions">
			<a class="home-cta" href="/docs">Open documentation</a>
			{#if docsConfig.site.social?.github}
				<a class="home-cta-secondary" href={docsConfig.site.social.github} target="_blank" rel="noopener noreferrer">
					GitHub
				</a>
			{/if}
		</div>
	</section>
</main>
