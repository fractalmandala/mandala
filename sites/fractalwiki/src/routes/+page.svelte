<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.siteConfig.site.title} — Home</title>
</svelte:head>

<div class="home-container flex-col gap32 padtop16">
	<section class="hero-section flex-col gap12 pad32 radius12 bdr">
		<span class="hero-badge pad4 padleft12 padright12 radius16 text-xs text-bold inline-self-start">
			{data.siteConfig.site.subtitle}
		</span>
		<h1 class="hero-title text-3xl text-bold">{data.siteConfig.site.title}</h1>
		<p class="hero-desc text-base text-secondary">{data.siteConfig.site.description}</p>
		
		<div class="hero-actions row ycenter gap16 margintop16">
			<div class="search-tip row ycenter gap8 pad8 padleft16 padright16 radius20 text-xs text-secondary bdr">
				<span>Press <kbd class="kbd pad2 padleft6 padright6 radius4">⌘K</kbd> or <kbd class="kbd pad2 padleft6 padright6 radius4">Ctrl+K</kbd> to search docs</span>
			</div>
		</div>
	</section>

	<section class="groups-grid flex-col gap24">
		<h2 class="section-heading text-xl text-bold">Knowledge Banks</h2>

		<div class="grid-layout grid grid-cols-2 gap20">
			{#each data.navGroups as group (group.id)}
				<div class="group-card pad24 radius12 bdr flex-col gap16">
					<div class="card-header row xbetween ycenter">
						<div class="row ycenter gap8">
							<span class="card-icon text-xl">📁</span>
							<h3 class="card-title text-lg text-bold">{group.title}</h3>
						</div>
						<span class="badge text-xs pad2 padleft8 padright8 radius12">{group.sections.length} Banks</span>
					</div>

					<p class="card-desc text-sm text-secondary">{group.description}</p>

					<div class="sections-list flex-col gap8 padtop12 bdr-top">
						{#each group.sections as section (section.id)}
							<div class="section-row row xbetween ycenter">
								<div class="row ycenter gap8">
									<span class="dot"></span>
									<span class="section-name text-sm text-primary">{section.title}</span>
								</div>
								
								{#if section.items.length > 0}
									<a
										href="/{section.items[0].slug}"
										class="explore-btn pad4 padleft12 padright12 radius12 text-xs text-accent"
									>
										Explore ({section.items.length}) →
									</a>
								{:else}
									<span class="text-xs text-tertiary">Empty</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>


