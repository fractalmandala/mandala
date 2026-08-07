<script lang="ts">
	import type { DocsFileTreeNode } from './file-tree.js';
	import Self from './FileTreeNode.svelte';

	let { node }: { node: DocsFileTreeNode } = $props();

	const isDirectory = $derived(node.children !== undefined && node.children.length > 0);
</script>

<li
	class="docs-file-tree__item"
	role="treeitem"
	aria-selected="false"
	aria-expanded={isDirectory ? true : undefined}
>
	<span class="docs-file-tree__name" data-kind={isDirectory ? 'directory' : 'file'}>
		{node.name}
	</span>
	{#if node.comment}
		<span class="docs-file-tree__comment">{node.comment}</span>
	{/if}
	{#if isDirectory}
		<ul class="docs-file-tree__children" role="group">
			{#each node.children ?? [] as child (child.name)}
				<Self node={child} />
			{/each}
		</ul>
	{/if}
</li>
