<script lang="ts">
	let { target = '#docs-content', label = 'Skip to content' } = $props();
</script>

<a class="docs-skip-link" href={target}>{label}</a>
