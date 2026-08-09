<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const profileEntries = $derived(data.profiles ? Object.entries(data.profiles.profiles) : []);
</script>

<svelte:head>
	<title>Hooks | fractalagentic</title>
	<meta
		name="description"
		content="Lifecycle guard hooks shipped with Fractal Agentic — minimal, standard, and strict profiles."
	/>
</svelte:head>

<div class="site-container box gap32 padtop32 padbot64">
	<header class="box gap12">
		<p class="eyebrow">Continuity layer</p>
		<h1 class="display-md">Hooks</h1>
		<p class="lede">
			Lifecycle guards installed into the coding-agent host — session start, bash safety, config
			protection, essay cadence, and stop-time quality checks, bundled into profiles.
		</p>
	</header>

	{#if data.profiles}
		<div class="index-grid">
			{#each profileEntries as [name, hooks] (name)}
				<div class="asset-card profiles-card">
					<div class="card-top">
						<span class="chip">{data.profiles?.default === name ? 'default' : 'profile'}</span>
					</div>
					<h2 class="title">{name}</h2>
					<div class="row wrap gap8">
						{#each hooks as hook (hook)}
							<span class="chip">{hook}</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="prose">
		<!-- eslint-disable svelte/no-at-html-tags -->
		{@html data.readmeHtml}
		<!-- eslint-enable svelte/no-at-html-tags -->
	</div>
</div>
