<script lang="ts">
	let {
		onopen,
		label = 'Search'
	}: { onopen: () => void; label?: string } = $props();
</script>

<button type="button" class="docs-button docs-search-trigger" onclick={onopen}>
	<span>{label}</span>
	<kbd class="docs-search-trigger__key">⌘K</kbd>
</button>
