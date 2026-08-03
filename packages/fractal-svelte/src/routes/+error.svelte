<script lang="ts">
	import { page } from '$app/state';
</script>
<svelte:head><title>{page.status} — Fractal Svelte</title><meta name="robots" content="noindex" /></svelte:head>
<div class="page-shell"><header class="page-header"><span class="eyebrow">Error {page.status}</span><h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1><p>{page.error?.message ?? 'The requested page could not be loaded.'}</p></header><a href="/">Return home →</a></div>
