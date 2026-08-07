<script lang="ts">
	import type { DocsFileTreeNode } from './file-tree.js';
	import FileTreeNode from './FileTreeNode.svelte';

	let { tree, label = 'File tree' }: { tree: DocsFileTreeNode[]; label?: string } = $props();
</script>

<ul class="docs-file-tree" role="tree" aria-label={label}>
	{#each tree as node (node.name)}
		<FileTreeNode {node} />
	{/each}
</ul>
