<script lang="ts">
	import { resolve } from '$app/paths';

	const highlights = [
		{
			title: 'Architecture',
			description:
				'The pramana and karaka axes that give every memory entry a verifiable, honest shape.',
			slug: 'architecture'
		},
		{
			title: 'Installation Guide',
			description:
				'Wire the MCP server into Claude Desktop, Claude Code, or Cowork in a few steps.',
			slug: 'installation-guide'
		},
		{
			title: 'Package Rules',
			description:
				'The numbered sutras — quotable by ID — that keep the system consistent as it grows.',
			slug: 'package-rules'
		}
	];
</script>

<svelte:head>
	<title>fractalmem — persistent memory for AI agents</title>
	<meta
		name="description"
		content="Documentation for SKAA, a persistent, structured episodic memory system for AI agents."
	/>
</svelte:head>

<section class="landing-hero">
	<div class="landing-hero-inner box gap16">
		<span class="text-sm tt-u fw600 col3">SKAA documentation</span>
		<h1>Persistent memory for AI agents</h1>
		<p class="text-lg col2">
			fractalmem hosts the docs for SKAA — a structured episodic memory system exposed as an
			MCP server, so any MCP-capable client can read and write to it across sessions.
		</p>
		<a class="btn-primary blank" href={resolve('/docs')}>Read the docs</a>
	</div>
</section>

<section class="landing-highlights">
	<div class="grid grid-cols-3 gap24">
		{#each highlights as item (item.slug)}
			<a class="landing-card blank" href={resolve('/docs/[doc]', { doc: item.slug })}>
				<h3>{item.title}</h3>
				<p class="text-sm col2">{item.description}</p>
			</a>
		{/each}
	</div>
</section>
