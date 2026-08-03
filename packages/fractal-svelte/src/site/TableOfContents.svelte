<script lang="ts">
	let { items }: { items: { id: string; label: string }[] } = $props();
</script>

<nav class="toc" aria-label="On this page">
	<strong>On this page</strong>
	<ul>{#each items as item}<li><a href="#{item.id}">{item.label}</a></li>{/each}</ul>
</nav>
