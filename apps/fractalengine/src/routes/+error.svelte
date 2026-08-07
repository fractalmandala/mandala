<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="app-shell box full100 xcenter ycenter">
	<div class="panel-error box xcenter ycenter gap8 pad16">
		<span class="text-item">{page.status}: {page.error?.message ?? 'Something went wrong.'}</span>
		<a class="btn-app" href="/"><span class="button-text">Back to workspace</span></a>
	</div>
</div>
