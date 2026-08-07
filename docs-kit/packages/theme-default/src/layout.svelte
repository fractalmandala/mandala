<script module lang="ts">
	/**
	 * mdsvex layout.
	 *
	 * Components exported here are in scope for every Markdown document, which is how the
	 * directive grammar resolves to real components. Point `mdsvex({ layout })` at this file,
	 * or at your own copy that exports different implementations under the same names.
	 */
	export {
		Accordion,
		Badge,
		Callout,
		Card,
		Cards,
		CodeGroup,
		Columns,
		Diff,
		Frame,
		ImageZoom,
		Mermaid,
		FileTree,
		Step,
		Steps,
		Tab,
		Tabs,
		TypeTable
	} from '@docs-kit/components';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
