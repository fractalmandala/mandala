<script lang="ts">
	let { title, description }: { title: string; description?: string | undefined } = $props();
</script>

<div class="docs-page-header">
	<h1>{title}</h1>
	{#if description}
		<p class="docs-page-header__description">{description}</p>
	{/if}
</div>
