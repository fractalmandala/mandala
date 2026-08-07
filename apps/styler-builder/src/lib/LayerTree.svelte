<script lang="ts">
  import type { BuilderNode } from './types';
  import LayerTree from './LayerTree.svelte';

  let {
    node,
    selectedId,
    depth = 0,
    onSelectNode,
    onDeleteNode,
    onAddChild
  }: {
    node: BuilderNode;
    selectedId: string;
    depth?: number;
    onSelectNode: (id: string) => void;
    onDeleteNode: (id: string) => void;
    onAddChild: (targetNode: BuilderNode) => void;
  } = $props();

  let isSelected = $derived(node.id === selectedId);
  let isExpanded = $state(true);

  function handleSelect(e: MouseEvent) {
    e.stopPropagation();
    onSelectNode(node.id);
  }

  function handleAdd(e: MouseEvent) {
    e.stopPropagation();
    onAddChild(node);
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    onDeleteNode(node.id);
  }
</script>

<div class="tree-item-wrapper">
  <div 
    class="tree-node-row" 
    class:selected={isSelected} 
    style="padding-left: {depth * 14 + 8}px;"
    onclick={handleSelect}
    role="treeitem"
    tabindex="0"
    aria-selected={isSelected}
  >
    {#if node.children.length > 0}
      <button class="expand-btn" onclick={(e) => { e.stopPropagation(); isExpanded = !isExpanded; }}>
        {isExpanded ? '▼' : '▶'}
      </button>
    {:else}
      <span class="tree-bullet">•</span>
    {/if}

    <span class="tree-icon">
      {#if node.display === 'grid'}▦{:else if node.direction === 'row'}↔️{:else if node.primitive === 'button'}💖{:else}📦{/if}
    </span>

    <span class="tree-name">{node.name}</span>
    <span class="tree-type">.{node.display}</span>

    <div class="tree-actions">
      <button class="tree-action-btn" title="Add Child Node" onclick={handleAdd}>+</button>
      {#if depth > 0}
        <button class="tree-action-btn delete-btn" title="Delete Node" onclick={handleDelete}>🗑️</button>
      {/if}
    </div>
  </div>

  {#if isExpanded && node.children.length > 0}
    <div class="tree-children">
      {#each node.children as child (child.id)}
        <LayerTree 
          node={child} 
          {selectedId} 
          depth={depth + 1} 
          {onSelectNode} 
          {onDeleteNode} 
          {onAddChild} 
        />
      {/each}
    </div>
  {/if}
</div>

<style>
.tree-item-wrapper {
  display: flex;
  flex-direction: column;
}

.tree-node-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #cbd5e1;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
}

.tree-node-row:hover {
  background: #1e293b;
  color: #fff;
}

.tree-node-row.selected {
  background: #1e293b;
  border-color: #fb006f;
  color: #fff;
  font-weight: 700;
}

.expand-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 8px;
  cursor: pointer;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tree-bullet {
  color: #475569;
  width: 12px;
  text-align: center;
  font-size: 10px;
}

.tree-icon {
  font-size: 11px;
}

.tree-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-type {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #64748b;
}

.tree-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
}

.tree-node-row:hover .tree-actions, .tree-node-row.selected .tree-actions {
  opacity: 1;
}

.tree-action-btn {
  background: #0f172a;
  border: 1px solid #334155;
  color: #cbd5e1;
  border-radius: 4px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
}

.tree-action-btn:hover {
  background: #fb006f;
  border-color: #fb006f;
  color: #fff;
}

.tree-action-btn.delete-btn:hover {
  background: #991b1b;
  border-color: #991b1b;
}
</style>
