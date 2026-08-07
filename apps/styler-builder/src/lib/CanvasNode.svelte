<script lang="ts">
  import type { BuilderNode } from './types';
  import CanvasNode from './CanvasNode.svelte';

  let {
    node,
    selectedId = $bindable(),
    isPreviewMode = false,
    snapMode = true,
    viewMode = 'desktop',
    onSelectNode,
    onParentSelect,
    onNodeUpdate,
    onShowContextMenu,
    onDropNode,
    onStartResize
  }: {
    node: BuilderNode;
    selectedId: string;
    isPreviewMode?: boolean;
    snapMode?: boolean;
    viewMode?: 'desktop' | 'mobile';
    onSelectNode: (id: string) => void;
    onParentSelect: (id: string) => void;
    onNodeUpdate: () => void;
    onShowContextMenu: (x: number, y: number, id: string) => void;
    onDropNode: (targetNode: BuilderNode, addType: string) => void;
    onStartResize: (e: MouseEvent, targetNode: BuilderNode, dir: 'r' | 'b' | 'br') => void;
  } = $props();

  let isSelected = $derived(node.id === selectedId);
  let isDragTarget = $state(false);
  let isInlineEditing = $state(false);

  function handleClick(e: MouseEvent) {
    if (isPreviewMode) return;
    e.stopPropagation();
    onSelectNode(node.id);
  }

  function handleDblClick(e: MouseEvent) {
    if (isPreviewMode) return;
    e.stopPropagation();
    if (node.content !== null && node.content !== undefined) {
      isInlineEditing = true;
    } else {
      onParentSelect(node.id);
    }
  }

  function handleContextMenu(e: MouseEvent) {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    onSelectNode(node.id);
    onShowContextMenu(e.clientX, e.clientY, node.id);
  }

  function handleDragOver(e: DragEvent) {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    isDragTarget = true;
  }

  function handleDragLeave(e: DragEvent) {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    isDragTarget = false;
  }

  function handleDrop(e: DragEvent) {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    isDragTarget = false;
    const addType = e.dataTransfer?.getData('text/plain');
    if (addType) {
      onDropNode(node, addType);
    }
  }

  function handleInlineBlur(e: FocusEvent) {
    isInlineEditing = false;
    const target = e.target as HTMLElement;
    node.content = target.textContent || '';
    onNodeUpdate();
  }

  function handleInlineKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }

  // Dynamic inline style construction with per-side padding, border & radius
  const nodeStyle = $derived.by(() => {
    if (isPreviewMode && node.primitive === 'button') {
      return '';
    }

    let s = '';
    
    // Padding
    if (node.isPerSidePadding) {
      s += `padding-top: ${node.paddingTop || 0}px; padding-right: ${node.paddingRight || 0}px; padding-bottom: ${node.paddingBottom || 0}px; padding-left: ${node.paddingLeft || 0}px;`;
    } else {
      s += `padding: ${node.padding || 0}px;`;
    }

    s += ` gap: ${node.gap || 0}px; margin-bottom: ${node.marginBot || 0}px;`;
    s += ` display: ${node.display};`;
    
    if (node.display === 'flex' || node.display === 'inline-flex') {
      s += ` flex-direction: ${node.direction};`;
      if (node.alignItems) s += ` align-items: ${node.alignItems};`;
      if (node.justifyContent) s += ` justify-content: ${node.justifyContent};`;
    }

    const effectiveCols = (viewMode === 'mobile' && node.gridCols && node.gridCols > 1) ? 1 : (node.gridCols || 1);
    if (node.display === 'grid') s += ` grid-template-columns: repeat(${effectiveCols}, 1fr);`;

    if (node.colSpan && node.colSpan > 1) s += ` grid-column: span ${node.colSpan};`;
    if (node.rowSpan && node.rowSpan > 1) s += ` grid-row: span ${node.rowSpan};`;

    if (node.width === '100%') s += ' width: 100%;';
    else if (node.width === '100vw') s += ' width: 100vw;';
    else if (node.width === 'fill') s += ' flex-grow: 1;';
    else if (node.width === 'custom' && node.widthVal) s += ` width: ${node.widthVal.includes('px') || node.widthVal.includes('rem') ? node.widthVal : node.widthVal + 'px'};`;
    else if (node.width === 'minmax') {
      if (node.minWVal) s += ` min-width: ${node.minWVal.includes('px') || node.minWVal.includes('rem') ? node.minWVal : node.minWVal + 'px'};`;
      if (node.maxWVal) s += ` max-width: ${node.maxWVal.includes('px') || node.maxWVal.includes('rem') ? node.maxWVal : node.maxWVal + 'px'};`;
    }

    if (node.height === '100%') s += ' height: 100%;';
    else if (node.height === '100vh') s += ' height: 100vh;';
    else if (node.height === 'fill') s += ' flex-grow: 1;';
    else if (node.height === 'custom' && node.heightVal) s += ` height: ${node.heightVal.includes('px') || node.heightVal.includes('rem') ? node.heightVal : node.heightVal + 'px'};`;
    else if (node.height === 'minmax') {
      if (node.minHVal) s += ` min-height: ${node.minHVal.includes('px') || node.minHVal.includes('rem') ? node.minHVal : node.minHVal + 'px'};`;
      if (node.maxHVal) s += ` max-height: ${node.maxHVal.includes('px') || node.maxHVal.includes('rem') ? node.maxHVal : node.maxHVal + 'px'};`;
    }

    // Background color / surface
    if (node.backgroundColor) {
      s += ` background-color: ${node.backgroundColor};`;
    } else if (node.surface === 'surface') s += ' background-color: var(--bg-surface, #0f172a);';
    else if (node.surface === 'panel') s += ' background-color: var(--bg-raised, #1e293b); border: 1px solid var(--border, #1e293b);';
    else if (node.surface === 'raised') s += ' background-color: var(--bg-hover, #334155);';
    else if (node.surface === 'subtle') s += ' background-color: #475569;';
    else if (node.surface === 'custom') s += ` background-color: ${node.customBg || '#0f172a'};`;

    // Border per side or unified
    if (node.isPerSideBorder) {
      if (node.borderTopWidth && node.borderTopWidth !== '0') s += ` border-top: ${node.borderTopWidth} solid ${node.borderColor || '#334155'};`;
      if (node.borderRightWidth && node.borderRightWidth !== '0') s += ` border-right: ${node.borderRightWidth} solid ${node.borderColor || '#334155'};`;
      if (node.borderBottomWidth && node.borderBottomWidth !== '0') s += ` border-bottom: ${node.borderBottomWidth} solid ${node.borderColor || '#334155'};`;
      if (node.borderLeftWidth && node.borderLeftWidth !== '0') s += ` border-left: ${node.borderLeftWidth} solid ${node.borderColor || '#334155'};`;
    } else if (node.borderWidth && node.borderWidth !== '0') {
      s += ` border: ${node.borderWidth} solid ${node.borderColor || '#334155'};`;
    }

    // Radius per corner or unified
    if (node.isPerCornerRadius) {
      s += ` border-radius: ${node.radiusTL || 0}px ${node.radiusTR || 0}px ${node.radiusBR || 0}px ${node.radiusBL || 0}px;`;
    } else {
      const radMap: Record<string, string> = { radius2: '2px', radius4: '4px', radius8: '8px', radius12: '12px', radius16: '16px', radiusfull: '999px' };
      if (radMap[node.radius]) s += ` border-radius: ${radMap[node.radius]};`;
    }

    if (node.shadow && node.shadow !== 'none') s += ' box-shadow: 0 10px 25px rgba(0,0,0,0.4);';

    return s;
  });
</script>

{#if node.primitive === 'button'}
  <div 
    class="builder-node button-wrapper" 
    class:selected={isSelected && !isPreviewMode}
    class:drag-target={isDragTarget}
    style="position: relative; display: inline-block;"
    onclick={handleClick}
    ondblclick={handleDblClick}
    oncontextmenu={handleContextMenu}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="button"
    tabindex="0"
  >
    {#if !isPreviewMode}
      <div class="node-tag">{node.name} (button.{node.buttonVariant || 'default'})</div>
    {/if}

    <button 
      class="btn-preview" 
      class:btn-preview-primary={node.buttonVariant === 'primary'}
      class:btn-preview-quiet={node.buttonVariant === 'quiet'}
      class:btn-preview-icon={node.buttonVariant === 'icon'}
      contenteditable={isInlineEditing}
      onblur={handleInlineBlur}
      onkeydown={handleInlineKeydown}
    >
      {node.content || 'Button'}
    </button>
  </div>
{:else}
  <div 
    class="builder-node" 
    class:selected={isSelected && !isPreviewMode}
    class:drag-target={isDragTarget}
    style={nodeStyle}
    onclick={handleClick}
    ondblclick={handleDblClick}
    oncontextmenu={handleContextMenu}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="region"
    aria-label={node.name}
  >
    {#if !isPreviewMode}
      <div class="node-tag">{node.name} ({node.display}{node.display === 'flex' ? '-' + node.direction : ''})</div>

      {#if isSelected}
        <!-- Resize Handles -->
        <div 
          class="resize-handle resize-handle-r"
          onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); onStartResize(e, node, 'r'); }}
          role="button"
          tabindex="0"
          aria-label="Resize width"
        ></div>
        <div 
          class="resize-handle resize-handle-b"
          onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); onStartResize(e, node, 'b'); }}
          role="button"
          tabindex="0"
          aria-label="Resize height"
        ></div>
        <div 
          class="resize-handle resize-handle-br"
          onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); onStartResize(e, node, 'br'); }}
          role="button"
          tabindex="0"
          aria-label="Resize width and height"
        ></div>
      {/if}
    {/if}

    {#if node.content !== null && node.content !== undefined}
      <div 
        class="node-text-content" 
        class:inline-editing={isInlineEditing}
        style="color: {node.textColor || 'var(--text-secondary)'}; font-weight: 600; text-align: {node.textAlign || 'left'};"
        contenteditable={isInlineEditing}
        onblur={handleInlineBlur}
        onkeydown={handleInlineKeydown}
      >
        {node.content}
      </div>
    {/if}

    {#each node.children as child (child.id)}
      <CanvasNode 
        node={child} 
        bind:selectedId 
        {isPreviewMode} 
        {snapMode} 
        {viewMode}
        {onSelectNode} 
        {onParentSelect} 
        {onNodeUpdate} 
        {onShowContextMenu}
        {onDropNode}
        {onStartResize}
      />
    {/each}
  </div>
{/if}

<style>
.builder-node {
  border: 1px dashed rgba(255, 255, 255, 0.15);
  position: relative;
  transition: border-color 120ms ease, box-shadow 120ms ease;
  cursor: pointer;
  box-sizing: border-box;
}

.builder-node:hover {
  border-color: rgba(56, 189, 248, 0.5) !important;
}

.builder-node.selected {
  border: 2px solid #fb006f !important;
  box-shadow: 0 0 0 2px rgba(251, 0, 111, 0.25) !important;
}

.builder-node.drag-target {
  border: 2px dashed #05be54 !important;
  background-color: rgba(5, 190, 84, 0.15) !important;
}

.node-tag {
  position: absolute;
  top: -12px;
  left: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  background: #fb006f;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;
  z-index: 20;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fb006f;
  border: 2px solid #fff;
  border-radius: 50%;
  z-index: 30;
  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
}

.resize-handle-r {
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
  cursor: e-resize;
}

.resize-handle-b {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}

.resize-handle-br {
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
}

.inline-editing {
  outline: 2px solid #fb006f !important;
  background: rgba(251, 0, 111, 0.15) !important;
  border-radius: 4px;
  padding: 2px 4px;
}

.btn-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #334155;
  background: #1e293b;
  color: #f9fafb;
  cursor: pointer;
  user-select: none;
}

.btn-preview-primary {
  background: #fb006f;
  border-color: #fb006f;
  color: #fff;
}

.btn-preview-quiet {
  background: transparent;
  border-color: transparent;
  color: #cbd5e1;
}

.btn-preview-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 6px;
  background: #1e293b;
  border: 1px solid #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
