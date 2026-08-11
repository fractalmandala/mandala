<script lang="ts">
	import '../app.css';
	import '$lib/ui/styles/index.sass';
	let { children }: { children: import('svelte').Snippet } = $props();
</script>

{@render children()}
