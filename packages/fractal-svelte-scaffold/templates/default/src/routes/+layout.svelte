<script lang="ts">
	import '$lib/styles/base.sass';
	import Navigation from '$lib/layout/Navigation.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import './+layout.sass';

	let { children } = $props();
</script>

<a href="#main" class="skip-link">Skip to content</a>

<Navigation />

<main id="main" class="app-main">
	{@render children()}
</main>

<Footer />
