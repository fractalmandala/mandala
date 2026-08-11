<script lang="ts">
	import { page } from '$app/state';
	import './+error.sass';

	const status = $derived(page.status);
	const message = $derived(status === 404 ? 'Page not found' : 'Something went wrong');
</script>

<svelte:head>
	<title>{status} — {{ AppName }}</title>
</svelte:head>

<div class="error-page">
	<div class="error-inner stack gap-4 center">
		<span class="error-status">{status}</span>
		<h1 class="error-message">{message}</h1>
		<a href="/" class="error-link">Go home</a>
	</div>
</div>
