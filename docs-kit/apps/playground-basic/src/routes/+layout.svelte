<script lang="ts">
	import '@docs-kit/theme-default/tokens.css';
	import '@docs-kit/theme-default/theme.css';
	import '@docs-kit/components/styles.css';
	import 'katex/dist/katex.min.css';

	let { children } = $props();
</script>

{@render children()}
