<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} · fractalmem</title>
</svelte:head>

<section class="landing-hero">
	<div class="landing-hero-inner box gap16">
		<span class="text-sm tt-u fw600 col3">Error {page.status}</span>
		<h1>{page.error?.message ?? 'Something went wrong'}</h1>
		<a class="btn-primary blank" href={resolve('/')}>Back to home</a>
	</div>
</section>
