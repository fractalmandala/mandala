<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="app-home box xcenter ycenter gap12 pad32">
	<h1 class="app-home__title">{page.status}</h1>
	<p class="app-home__subtitle">{page.error?.message ?? 'Something went wrong.'}</p>
	<a href="/">Back to start</a>
</section>
