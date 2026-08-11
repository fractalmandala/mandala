<script lang="ts">
	import Button from '$lib/components/Button/Button.svelte';
	import Card from '$lib/components/Card/Card.svelte';
	import Accordion from '$lib/components/Accordion/Accordion.svelte';
	import './+page.sass';

	const sections = [
		{ id: 'svelte', title: 'Svelte 5 runes', disabled: false },
		{ id: 'sass', title: 'Indented SASS + CUBE CSS', disabled: false },
		{ id: 'agents', title: 'Fractal Agentic wired in', disabled: false }
	];
</script>

<svelte:head>
	<title>{{ AppName }}</title>
	<meta name="description" content="{{ AppName }} — scaffolded with fractal-svelte" />
</svelte:head>

<div class="center">
	<section class="stack gap-8">
		<header class="stack gap-3">
			<span class="badge">scaffolded with fractal-svelte</span>
			<h1 class="h1">{{ AppName }}</h1>
			<p class="text-2 measure-lg leading-relaxed">
				A mature SvelteKit + Svelte 5 + CUBE CSS starting point, with the Fractal Agentic Svelte
				Boss contract wired in. Ask your agent to add components, routes, or styles — it knows the
				conventions.
			</p>
		</header>

		<div class="cluster gap-3">
			<Button onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Scroll to top</Button>
			<Button variant="secondary" href="/about/">About</Button>
			<Button variant="outline" href="https://svelte.dev" target="_blank">Svelte docs</Button>
		</div>

		<div class="grid grid-auto gap-6" style="margin-block-start: var(--s-8)">
			<Card title="Svelte 5 runes" subtitle="Reactive primitives">
				<p class="text-2 text-sm">$state, $derived, $effect, $props — no legacy reactivity.</p>
			</Card>
			<Card title="Indented SASS" subtitle="No BEM, no Tailwind">
				<p class="text-2 text-sm">
					Single-tab SASS, semantic tokens, CUBE CSS composition utilities.
				</p>
			</Card>
			<Card title="Agent-ready" subtitle="Fractal Agentic wired in">
				<p class="text-2 text-sm">
					AGENTS.md + .fractal-agentic/ contract on disk. Short prompts work.
				</p>
			</Card>
		</div>

		<div class="stack gap-3" style="margin-block-start: var(--s-8)">
			<h2 class="h2">Accordion</h2>
			<Accordion {sections}>
				{#snippet children(section)}
					<p class="text-2">
						{section.id === 'svelte'
							? 'Runes are the reactive system in Svelte 5.'
							: section.id === 'sass'
								? 'Styles live in external .sass files; components consume semantic tokens.'
								: 'See AGENTS.md — agents detect the plugin and follow the Svelte Boss.'}
					</p>
				{/snippet}
			</Accordion>
		</div>
	</section>
</div>
