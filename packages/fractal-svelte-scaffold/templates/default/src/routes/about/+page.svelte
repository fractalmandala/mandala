<script lang="ts">
	import Card from '$lib/components/Card/Card.svelte';
</script>

<svelte:head>
	<title>About — {{ AppName }}</title>
	<meta name="description" content="About {{ AppName }}" />
</svelte:head>

<div class="center">
	<section class="stack gap-6">
		<header class="stack gap-3">
			<h1 class="h1">About</h1>
			<p class="text-2 measure-lg leading-relaxed">
				This is a sample route group demonstrating SvelteKit routing with the fractal-svelte
				scaffold.
			</p>
		</header>

		<div class="grid grid-2 gap-4">
			<Card title="Route groups" subtitle="src/routes/about/+page.svelte">
				<p class="text-2 text-sm">Add more route groups under src/routes/.</p>
			</Card>
			<Card title="SSR + prerender" subtitle="+layout.ts defaults">
				<p class="text-2 text-sm">Prerendering and trailingSlash set in +layout.ts.</p>
			</Card>
		</div>

		<p>
			<a href="/">← Back home</a>
		</p>
	</section>
</div>
