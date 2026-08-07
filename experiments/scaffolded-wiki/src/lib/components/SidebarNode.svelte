<script lang="ts">
	import SidebarNode from './SidebarNode.svelte'; // recursive self-reference (Svelte 5)
	import type { TreeItem } from '$lib/server/wiki';

	let {
		node,
		depth,
		currentPath,
		isOpen,
		onToggle
	}: {
		node: TreeItem;
		depth: number;
		currentPath: string;
		isOpen: (sectionPath: string) => boolean;
		onToggle: (sectionPath: string) => void;
	} = $props();
</script>

{#if node.kind === 'section'}
	<div class="side-group">
		<button
			class="side-head"
			class:open={isOpen(node.path)}
			onclick={() => onToggle(node.path)}
			aria-expanded={isOpen(node.path)}
			style={depth > 0 ? 'font-weight:600' : ''}
		>
			<svg class="chev" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<span>{node.title}</span>
			{#if node.count !== undefined}
				<span class="side-count">{node.count}</span>
			{/if}
		</button>
		{#if isOpen(node.path)}
			<div class="side-children">
				{#each node.children ?? [] as child (child.path)}
					<SidebarNode node={child} depth={depth + 1} {currentPath} {isOpen} {onToggle} />
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<a class="side-link" class:active={currentPath === node.path} href={node.path}>
		<span class="dot" aria-hidden="true"></span>
		<span>{node.title}</span>
	</a>
{/if}
