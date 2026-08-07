<script lang="ts">
  import { onMount } from 'svelte';
  import type { BuilderNode, SavedBlock } from './lib/types';
  import { getLayoutTemplate, findNode, findParent, getNodePath, createNode } from './lib/nodes';
  import { generateSass, generateHtml, generateSvelteComponent } from './lib/generator';
  import CanvasNode from './lib/CanvasNode.svelte';
  import InspectorPanel from './lib/InspectorPanel.svelte';
  import LayerTree from './lib/LayerTree.svelte';

  let root = $state<BuilderNode>(getLayoutTemplate('pancake'));
  let selectedId = $state<string>('node_1');

  let activeTab = $state<'layouts' | 'palette' | 'tree' | 'ui' | 'my'>('tree');
  let viewMode = $state<'desktop' | 'mobile'>('desktop');
  let isPreviewMode = $state<boolean>(false);
  let canvasTheme = $state<'dark' | 'light'>('dark');
  let snapMode = $state<boolean>(true);

  let historyStack = $state<Array<{ root: BuilderNode; selectedId: string }>>([]);
  let historyIndex = $state<number>(-1);
  let customSavedBlocks = $state<SavedBlock[]>([]);
  let copiedStyle = $state<any>(null);

  let dimTooltipText = $state<string>('');
  let dimTooltipPos = $state<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  let contextMenu = $state<{ x: number; y: number; visible: boolean; nodeId: string }>({ x: 0, y: 0, visible: false, nodeId: '' });

  const selectedNode = $derived(findNode(root, selectedId) || root);
  const breadcrumbs = $derived(getNodePath(root, selectedId) || [root]);

  const sassOutput = $derived(generateSass(selectedNode, 0));
  const htmlOutput = $derived(generateHtml(selectedNode, 0));
  const fullSvelteOutput = $derived(generateSvelteComponent(selectedNode).svelteCode);

  function saveState() {
    const stateObj = { root: JSON.parse(JSON.stringify(root)), selectedId };
    const str = JSON.stringify(stateObj);
    if (historyIndex >= 0 && historyStack[historyIndex] && JSON.stringify(historyStack[historyIndex]) === str) {
      return;
    }
    if (historyIndex < historyStack.length - 1) {
      historyStack = historyStack.slice(0, historyIndex + 1);
    }
    historyStack.push(JSON.parse(str));
    historyIndex = historyStack.length - 1;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      const state = historyStack[historyIndex];
      root = JSON.parse(JSON.stringify(state.root));
      selectedId = state.selectedId;
    }
  }

  function redo() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      const state = historyStack[historyIndex];
      root = JSON.parse(JSON.stringify(state.root));
      selectedId = state.selectedId;
    }
  }

  function deleteSelectedNode(nodeIdToDelete?: string) {
    const targetId = nodeIdToDelete || selectedId;
    if (targetId === root.id) {
      alert('Cannot delete root node!');
      return;
    }
    const res = findParent(root, targetId);
    if (res) {
      res.parent.children.splice(res.index, 1);
      selectedId = res.parent.id;
      saveState();
    }
  }

  function applyLayoutTemplate(key: string) {
    root = getLayoutTemplate(key);
    selectedId = root.id;
    saveState();
  }

  function addNodeToTarget(targetNode: BuilderNode, addType: string) {
    let newNode: BuilderNode;

    if (addType.startsWith('button-')) {
      const variant = addType.replace('button-', '') as any;
      newNode = createNode('button', {
        name: 'Btn_' + variant,
        primitive: 'button',
        buttonVariant: variant,
        content: variant === 'icon' ? '⚡' : (variant.charAt(0).toUpperCase() + variant.slice(1) + ' Button')
      });
    } else if (addType === 'ui-header') {
      newNode = createNode('row', {
        name: 'HeaderBar',
        direction: 'row',
        padding: 16,
        surface: 'panel',
        children: [
          createNode('box', { name: 'Logo', padding: 0, content: '⚡ Logo' }),
          createNode('row', { name: 'Nav', padding: 0, gap: 12, children: [
            createNode('button', { name: 'Nav1', primitive: 'button', buttonVariant: 'quiet', content: 'Features' }),
            createNode('button', { name: 'Nav2', primitive: 'button', buttonVariant: 'quiet', content: 'Pricing' })
          ]})
        ]
      });
    } else if (addType === 'ui-hero') {
      newNode = createNode('box', {
        name: 'HeroSection',
        padding: 32,
        gap: 16,
        surface: 'panel',
        radius: 'radius12',
        alignItems: 'center',
        children: [
          createNode('box', { name: 'HeroHeading', padding: 0, textAlign: 'center', content: 'Build Faster with Styler' }),
          createNode('button', { name: 'HeroCTA', primitive: 'button', buttonVariant: 'primary', content: 'Get Started Free' })
        ]
      });
    } else if (addType.startsWith('custom-')) {
      const idx = parseInt(addType.replace('custom-', ''));
      if (customSavedBlocks[idx]) {
        newNode = JSON.parse(JSON.stringify(customSavedBlocks[idx].node));
      } else {
        newNode = createNode('box');
      }
    } else {
      newNode = createNode(addType);
    }

    targetNode.children.push(newNode);
    selectedId = newNode.id;
    saveState();
  }

  function handlePaletteAdd(addType: string) {
    const parent = findNode(root, selectedId) || root;
    addNodeToTarget(parent, addType);
  }

  function handleSaveCustomBlock() {
    const target = findNode(root, selectedId);
    if (!target) return;
    const name = prompt('Enter a name for your custom component block:', target.name);
    if (!name) return;
    customSavedBlocks.push({
      name,
      node: JSON.parse(JSON.stringify(target))
    });
    alert(`Saved "${name}" into "My Blocks"!`);
  }

  function handleCopySvelteComponent() {
    navigator.clipboard.writeText(fullSvelteOutput);
    alert('Full Svelte 5 Component code copied to clipboard!');
  }

  function downloadFiles() {
    const svelteBlob = new Blob([fullSvelteOutput], { type: 'text/plain' });
    const svelteUrl = URL.createObjectURL(svelteBlob);
    const a1 = document.createElement('a');
    a1.href = svelteUrl;
    a1.download = `${selectedNode.name || 'Component'}.svelte`;
    a1.click();
    URL.revokeObjectURL(svelteUrl);

    const sassBlob = new Blob([sassOutput], { type: 'text/plain' });
    const sassUrl = URL.createObjectURL(sassBlob);
    const a2 = document.createElement('a');
    a2.href = sassUrl;
    a2.download = `${(selectedNode.name || 'component').toLowerCase()}.sass`;
    a2.click();
    URL.revokeObjectURL(sassUrl);
  }

  function handleShowContextMenu(x: number, y: number, nodeId: string) {
    contextMenu = { x, y, visible: true, nodeId };
  }

  function handleContextDuplicate() {
    const res = findParent(root, contextMenu.nodeId || selectedId);
    if (res) {
      const clone = JSON.parse(JSON.stringify(res.parent.children[res.index]));
      clone.id = 'node_' + Math.floor(Math.random() * 10000);
      clone.name += '_copy';
      res.parent.children.splice(res.index + 1, 0, clone);
      selectedId = clone.id;
      saveState();
    }
    contextMenu.visible = false;
  }

  function handleContextWrapBox() {
    const res = findParent(root, contextMenu.nodeId || selectedId);
    if (res) {
      const target = res.parent.children[res.index];
      const wrapperNode = createNode('box', {
        name: target.name + 'Wrapper',
        padding: 16,
        surface: 'panel',
        children: [target]
      });
      res.parent.children[res.index] = wrapperNode;
      selectedId = wrapperNode.id;
      saveState();
    }
    contextMenu.visible = false;
  }

  function handleContextWrapRow() {
    const res = findParent(root, contextMenu.nodeId || selectedId);
    if (res) {
      const target = res.parent.children[res.index];
      const wrapperNode = createNode('row', {
        name: target.name + 'Wrapper',
        direction: 'row',
        padding: 16,
        surface: 'panel',
        children: [target]
      });
      res.parent.children[res.index] = wrapperNode;
      selectedId = wrapperNode.id;
      saveState();
    }
    contextMenu.visible = false;
  }

  function handleContextCopyStyle() {
    const target = findNode(root, contextMenu.nodeId || selectedId);
    if (target) {
      copiedStyle = {
        padding: target.padding,
        gap: target.gap,
        marginBot: target.marginBot,
        surface: target.surface,
        customBg: target.customBg,
        borderColor: target.borderColor,
        textColor: target.textColor,
        radius: target.radius,
        borderWidth: target.borderWidth,
        fontSize: target.fontSize,
        shadow: target.shadow,
        textAlign: target.textAlign
      };
      alert('Copied style properties!');
    }
    contextMenu.visible = false;
  }

  function handleContextPasteStyle() {
    if (!copiedStyle) {
      alert('No style copied yet!');
      return;
    }
    const target = findNode(root, contextMenu.nodeId || selectedId);
    if (target) {
      Object.assign(target, copiedStyle);
      saveState();
    }
    contextMenu.visible = false;
  }

  // Interactive Resizing Handler
  function handleStartResize(e: MouseEvent, targetNode: BuilderNode, direction: 'r' | 'b' | 'br') {
    const startX = e.clientX;
    const startY = e.clientY;

    const parentInfo = findParent(root, targetNode.id);
    const isParentGrid = parentInfo && parentInfo.parent.display === 'grid';
    const gridCols = isParentGrid ? (parentInfo.parent.gridCols || 12) : 12;

    const targetEl = (e.target as HTMLElement).parentElement;
    const startWidth = targetEl ? targetEl.offsetWidth : 100;
    const startHeight = targetEl ? targetEl.offsetHeight : 100;

    dimTooltipPos = { x: e.clientX + 16, y: e.clientY + 16, visible: true };

    function onMouseMove(me: MouseEvent) {
      me.preventDefault();
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;

      dimTooltipPos = { x: me.clientX + 16, y: me.clientY + 16, visible: true };

      let newW = Math.max(40, startWidth + dx);
      let newH = Math.max(30, startHeight + dy);

      if (isParentGrid) {
        const colWidth = 960 / gridCols;
        const calculatedSpan = Math.min(gridCols, Math.max(1, Math.round(newW / colWidth)));
        targetNode.colSpan = calculatedSpan;
        dimTooltipText = `▦ Grid Span: col-span-${calculatedSpan} (${Math.round(newW)}px)`;
      } else {
        if (snapMode) {
          newW = Math.round(newW / 8) * 8;
          newH = Math.round(newH / 8) * 8;
        }

        if (direction === 'r' || direction === 'br') {
          targetNode.width = 'custom';
          targetNode.widthVal = `${Math.round(newW)}`;
        }

        if (direction === 'b' || direction === 'br') {
          targetNode.height = 'custom';
          targetNode.heightVal = `${Math.round(newH)}`;
        }

        dimTooltipText = `📐 ${Math.round(newW)}px × ${Math.round(newH)}px`;
      }
    }

    function onMouseUp() {
      dimTooltipPos.visible = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      saveState();
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  onMount(() => {
    saveState();
    window.addEventListener('keydown', (e) => {
      const tag = e.target ? (e.target as HTMLElement).tagName : '';
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return;
      }
      const isMeta = e.metaKey || e.ctrlKey;
      const keyLow = e.key ? e.key.toLowerCase() : '';
      if (isMeta && keyLow === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (isMeta && keyLow === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedId && selectedId !== root.id) {
          e.preventDefault();
          deleteSelectedNode();
        }
      }
    });

    window.addEventListener('click', () => {
      contextMenu.visible = false;
    });
  });
</script>

<div class="app-container" data-canvas-theme={canvasTheme}>
  
  <!-- Floating Dimension Badge -->
  {#if dimTooltipPos.visible}
    <div class="dimension-tooltip" style="left: {dimTooltipPos.x}px; top: {dimTooltipPos.y}px;">
      {dimTooltipText}
    </div>
  {/if}

  <!-- Context Menu Popover -->
  {#if contextMenu.visible}
    <div class="context-menu" style="left: {contextMenu.x}px; top: {contextMenu.y}px;">
      <button class="context-menu-item" onclick={handleContextDuplicate}><span>📋</span> Duplicate</button>
      <button class="context-menu-item" onclick={handleContextWrapBox}><span>📦</span> Wrap in Box</button>
      <button class="context-menu-item" onclick={handleContextWrapRow}><span>↔️</span> Wrap in Row</button>
      <button class="context-menu-item" onclick={handleContextCopyStyle}><span>🎨</span> Copy Style</button>
      <button class="context-menu-item" onclick={handleContextPasteStyle}><span>🖌️</span> Paste Style</button>
      <button class="context-menu-item text-danger" onclick={() => deleteSelectedNode()}><span>🗑️</span> Delete</button>
    </div>
  {/if}

  <!-- Header -->
  <header>
    <div class="logo-badge">
      <div class="logo-icon">⚡</div>
      <span>styler-builder</span>
      <span class="ver-pill">Standalone Dev Builder</span>
    </div>

    <div class="hdr-toggles">
      <div class="toggle-group">
        <button class="toggle-btn" class:active={!isPreviewMode} onclick={() => isPreviewMode = false}>🛠️ Edit</button>
        <button class="toggle-btn preview-btn" class:active={isPreviewMode} onclick={() => isPreviewMode = true}>▶️ Preview</button>
      </div>

      <div class="toggle-group">
        <button class="toggle-btn" class:active={canvasTheme === 'dark'} onclick={() => canvasTheme = 'dark'}>🌙 Dark</button>
        <button class="toggle-btn" class:active={canvasTheme === 'light'} onclick={() => canvasTheme = 'light'}>☀️ Light</button>
      </div>

      <div class="toggle-group">
        <button class="toggle-btn" class:active={viewMode === 'desktop'} onclick={() => viewMode = 'desktop'}>🖥️ Desktop</button>
        <button class="toggle-btn" class:active={viewMode === 'mobile'} onclick={() => viewMode = 'mobile'}>📱 Mobile</button>
        <button class="toggle-btn" onclick={() => snapMode = !snapMode}>
          {snapMode ? '🧲 Snap 8px' : '📐 Smooth 1px'}
        </button>
      </div>
    </div>

    <div class="hdr-actions">
      <button class="btn" disabled={historyIndex <= 0} onclick={undo} title="Undo (⌘Z)">↩️ Undo</button>
      <button class="btn" disabled={historyIndex >= historyStack.length - 1} onclick={redo} title="Redo (⌘⇧Z)">↪️ Redo</button>
      <button class="btn" onclick={handleSaveCustomBlock}>⭐ Save Block</button>
      <button class="btn btn-secondary" onclick={downloadFiles}>💾 Download Files</button>
      <button class="btn btn-brand" onclick={handleCopySvelteComponent}>📋 Copy Svelte 5</button>
    </div>
  </header>

  <!-- App Shell -->
  <div class="app-shell" class:mode-preview={isPreviewMode}>
    
    <!-- Left Sidebar: Palette, Layouts & Layer Tree -->
    <aside class="sidebar-l">
      <div class="tab-bar">
        <button class="tab-btn" class:active={activeTab === 'tree'} onclick={() => activeTab = 'tree'}>🌳 Layers</button>
        <button class="tab-btn" class:active={activeTab === 'palette'} onclick={() => activeTab = 'palette'}>Primitives</button>
        <button class="tab-btn" class:active={activeTab === 'layouts'} onclick={() => activeTab = 'layouts'}>Layouts</button>
        <button class="tab-btn" class:active={activeTab === 'ui'} onclick={() => activeTab = 'ui'}>UI</button>
        <button class="tab-btn" class:active={activeTab === 'my'} onclick={() => activeTab = 'my'}>My</button>
      </div>

      <div class="tab-content">
        {#if activeTab === 'tree'}
          <div class="section-title">Layer Hierarchy Tree</div>
          <div class="tree-container">
            <LayerTree 
              node={root} 
              {selectedId} 
              onSelectNode={(id) => selectedId = id}
              onDeleteNode={(id) => deleteSelectedNode(id)}
              onAddChild={(target) => addNodeToTarget(target, 'box')}
            />
          </div>
        {:else if activeTab === 'layouts'}
          <div class="section-title">Standard Layout Templates</div>
          <div class="palette-grid">
            {#each ['pancake', 'sidebar', 'html5', 'col12', 'collage', 'grid3x3'] as key}
              <button class="palette-card" onclick={() => applyLayoutTemplate(key)}>
                <span style="font-size:16px;">📐</span>
                <span>{key.toUpperCase()}</span>
              </button>
            {/each}
          </div>
        {:else if activeTab === 'palette'}
          <div class="section-title">Basic Primitives</div>
          <div class="palette-grid">
            <button class="palette-card" draggable="true" ondragstart={(e) => e.dataTransfer?.setData('text/plain', 'box')} onclick={() => handlePaletteAdd('box')}>📦 box</button>
            <button class="palette-card" draggable="true" ondragstart={(e) => e.dataTransfer?.setData('text/plain', 'row')} onclick={() => handlePaletteAdd('row')}>↔️ row</button>
            <button class="palette-card" draggable="true" ondragstart={(e) => e.dataTransfer?.setData('text/plain', 'grid')} onclick={() => handlePaletteAdd('grid')}>▦ grid</button>
            <button class="palette-card" draggable="true" ondragstart={(e) => e.dataTransfer?.setData('text/plain', 'button-primary')} onclick={() => handlePaletteAdd('button-primary')}>💖 button</button>
          </div>
        {:else if activeTab === 'ui'}
          <div class="section-title">Pre-built UI Components</div>
          <div class="palette-grid">
            <button class="palette-card" draggable="true" ondragstart={(e) => e.dataTransfer?.setData('text/plain', 'ui-header')} onclick={() => handlePaletteAdd('ui-header')}>🔝 Header Bar</button>
            <button class="palette-card" draggable="true" ondragstart={(e) => e.dataTransfer?.setData('text/plain', 'ui-hero')} onclick={() => handlePaletteAdd('ui-hero')}>🚀 Hero Section</button>
          </div>
        {:else if activeTab === 'my'}
          <div class="section-title">My Saved Blocks</div>
          {#if customSavedBlocks.length === 0}
            <div class="empty-hint">Click "⭐ Save Block" in header to add blocks here.</div>
          {:else}
            <div class="palette-grid">
              {#each customSavedBlocks as block, idx}
                <button class="palette-card" onclick={() => handlePaletteAdd(`custom-${idx}`)}>
                  <span>⭐</span><span>{block.name}</span>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </aside>

    <!-- Main Canvas View -->
    <main class="canvas-view" class:canvas-light={canvasTheme === 'light'}>
      <div 
        class="device-container" 
        class:mode-desktop={viewMode === 'desktop'} 
        class:mode-mobile={viewMode === 'mobile'} 
        id="deviceFrame"
      >
        {#if viewMode === 'mobile'}
          <div class="mobile-notch"><div class="mobile-notch-pill"></div></div>
        {/if}

        <!-- Canvas Root Node (Recursive) -->
        <CanvasNode 
          node={root} 
          bind:selectedId 
          {isPreviewMode} 
          {snapMode} 
          {viewMode}
          onSelectNode={(id) => selectedId = id}
          onParentSelect={(id) => {
            const res = findParent(root, id);
            if (res) selectedId = res.parent.id;
          }}
          onNodeUpdate={saveState}
          onShowContextMenu={handleShowContextMenu}
          onDropNode={(target, addType) => addNodeToTarget(target, addType)}
          onStartResize={handleStartResize}
        />
      </div>
    </main>

    <!-- Right Inspector Panel (Matching Figma/Penpot Reference Image) -->
    <InspectorPanel 
      {selectedNode}
      rootNode={root}
      {breadcrumbs}
      onSelectNode={(id) => selectedId = id}
      onDeleteNode={() => deleteSelectedNode()}
      onNodeUpdate={saveState}
    />

  </div>
</div>

<style>
:root {
  --bg-app: #0b0f17;
  --bg-surface: #0f172a;
  --bg-raised: #1e293b;
  --bg-hover: #334155;
  --text-primary: #f9fafb;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border: #1e293b;
  --border-accent: #334155;
  --brand: #fb006f;
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Google Sans Flex', sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0b0f17;
  color: #f9fafb;
  font-family: 'Google Sans Flex', sans-serif;
  overflow: hidden;
}

header {
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid #1e293b;
  background-color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.logo-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
}

.logo-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, #fb006f, #a0034a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
}

.ver-pill {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 99px;
  color: #cbd5e1;
}

.hdr-toggles, .hdr-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-group {
  display: flex;
  background: #0b0f17;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.toggle-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  border: none;
  background: transparent;
  cursor: pointer;
}

.toggle-btn.active {
  background: #1e293b;
  color: #f9fafb;
}

.toggle-btn.preview-btn.active {
  background: #05be54;
  color: #fff;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #334155;
  background: #1e293b;
  color: #f9fafb;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-brand {
  background: #fb006f;
  border-color: #fb006f;
  color: #fff;
}

.btn-secondary {
  background: #334155;
  border-color: #475569;
  color: #fff;
}

.app-shell {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-l {
  width: 280px;
  background-color: #0f172a;
  border-right: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid #1e293b;
  background: #0b0f17;
}

.tab-btn {
  flex: 1;
  padding: 10px 0;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  border: none;
  background: transparent;
  cursor: pointer;
}

.tab-btn.active {
  color: #f9fafb;
  border-bottom: 2px solid #fb006f;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
}

.tree-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.empty-hint {
  font-size: 11px;
  color: #64748b;
  padding: 12px;
  text-align: center;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.palette-card {
  padding: 10px 6px;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #0b0f17;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.palette-card:hover {
  border-color: #fb006f;
  color: #fff;
  background: #1e293b;
}

.canvas-view {
  flex: 1;
  background: #07090e;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 32px;
  overflow: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transition: all 200ms ease;
}

.canvas-view.canvas-light {
  background: #f8fafc;
  background-image: radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px);
}

.device-container.mode-desktop {
  width: 100%;
  max-width: 960px;
}

.device-container.mode-mobile {
  width: 375px;
  border: 12px solid #1e293b;
  border-radius: 36px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.mobile-notch {
  height: 24px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-notch-pill {
  width: 80px;
  height: 10px;
  background: #0b0f17;
  border-radius: 99px;
}

.dimension-tooltip {
  position: fixed;
  z-index: 2000;
  background: #fb006f;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.context-menu {
  position: fixed;
  z-index: 1000;
  width: 180px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  padding: 4px;
  display: flex;
  flex-direction: column;
}

.context-menu-item {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #cbd5e1;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.context-menu-item:hover {
  background: #fb006f;
  color: #fff;
}

.text-danger {
  color: #fca5a5;
}
</style>
