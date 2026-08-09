<script lang="ts">
	import type { PageData } from './$types';
	import TerminalBlock from '$lib/components/TerminalBlock.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>CLI | fractalagentic</title>
	<meta
		name="description"
		content="fractal-agentic CLI reference — install, verify, doctor, update, and inventory verbs."
	/>
</svelte:head>

<div class="site-container box gap32 padtop32 padbot64">
	<header class="box gap12">
		<p class="eyebrow">Reference / v{data.version}</p>
		<h1 class="display-md">fractal-agentic CLI</h1>
		<p class="lede">
			One binary for install, verification, inventory, and health — resolvable from the plugin root
			without environment variables.
		</p>
	</header>

	<div class="hero-terminal">
		<TerminalBlock code="npx fractal-agentic doctor" />
	</div>

	{#each data.sections as section (section.heading)}
		<section class="box gap16">
			<h2 class="section-heading">{section.heading}</h2>
			<div class="prose">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html section.html}
				<!-- eslint-enable svelte/no-at-html-tags -->
			</div>
		</section>
	{/each}
</div>
