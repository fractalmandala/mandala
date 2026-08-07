<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="error-page">
	<div>
		<h1>{page.status}</h1>
		<p style="color:var(--ink-2)">{page.error?.message ?? 'Something went wrong.'}</p>
		<a class="back" href="/">← Back to the wiki</a>
	</div>
</div>
