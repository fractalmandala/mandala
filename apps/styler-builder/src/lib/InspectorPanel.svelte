<script lang="ts">
  import type { BuilderNode } from './types';

  let {
    selectedNode,
    rootNode,
    breadcrumbs,
    onSelectNode,
    onDeleteNode,
    onNodeUpdate
  }: {
    selectedNode: BuilderNode;
    rootNode: BuilderNode;
    breadcrumbs: BuilderNode[];
    onSelectNode: (id: string) => void;
    onDeleteNode: () => void;
    onNodeUpdate: () => void;
  } = $props();

  let isParentGrid = $derived.by(() => {
    const findParentLocal = (curr: BuilderNode, id: string): BuilderNode | null => {
      for (const child of curr.children) {
        if (child.id === id) return curr;
        const res = findParentLocal(child, id);
        if (res) return res;
      }
      return null;
    };
    const parent = findParentLocal(rootNode, selectedNode.id);
    return parent ? parent.display === 'grid' : false;
  });

  let radiusPills = ['radius0', 'radius4', 'radius8', 'radius12', 'radius16', 'radiusfull'];

  function togglePerSidePadding() {
    selectedNode.isPerSidePadding = !selectedNode.isPerSidePadding;
    if (selectedNode.isPerSidePadding) {
      selectedNode.paddingTop = selectedNode.padding || 0;
      selectedNode.paddingRight = selectedNode.padding || 0;
      selectedNode.paddingBottom = selectedNode.padding || 0;
      selectedNode.paddingLeft = selectedNode.padding || 0;
    }
    onNodeUpdate();
  }

  function togglePerSideBorder() {
    selectedNode.isPerSideBorder = !selectedNode.isPerSideBorder;
    if (selectedNode.isPerSideBorder) {
      selectedNode.borderTopWidth = selectedNode.borderWidth || '0';
      selectedNode.borderRightWidth = selectedNode.borderWidth || '0';
      selectedNode.borderBottomWidth = selectedNode.borderWidth || '0';
      selectedNode.borderLeftWidth = selectedNode.borderWidth || '0';
    }
    onNodeUpdate();
  }

  function togglePerCornerRadius() {
    selectedNode.isPerCornerRadius = !selectedNode.isPerCornerRadius;
    if (selectedNode.isPerCornerRadius) {
      const radNumMap: Record<string, number> = { radius0: 0, radius4: 4, radius8: 8, radius12: 12, radius16: 16, radiusfull: 999 };
      const val = radNumMap[selectedNode.radius] || 0;
      selectedNode.radiusTL = val;
      selectedNode.radiusTR = val;
      selectedNode.radiusBR = val;
      selectedNode.radiusBL = val;
    }
    onNodeUpdate();
  }
</script>

<aside class="sidebar-r">
  <div class="inspector-header">
    <span class="inspector-title">Inspector Settings</span>
  </div>

  <div class="inspector-body">
    
    <!-- Hierarchy Breadcrumbs -->
    <div class="inspector-section">
      <div class="inspector-section-title">Hierarchy Trail</div>
      <div class="breadcrumb-trail">
        {#each breadcrumbs as crumb, idx}
          <button class="crumb-item" class:active={crumb.id === selectedNode.id} onclick={() => onSelectNode(crumb.id)}>
            {crumb.name}
          </button>
          {#if idx < breadcrumbs.length - 1}<span class="crumb-sep">></span>{/if}
        {/each}
      </div>
    </div>

    <!-- 1. Position Section (Figma / Penpot style) -->
    <div class="inspector-section">
      <div class="inspector-section-title">Position</div>
      
      <!-- Alignment Buttons -->
      <div class="align-bar">
        <button class="align-btn" title="Align Left" onclick={() => { selectedNode.alignItems = 'flex-start'; onNodeUpdate(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v16M8 8h12M8 16h8"/></svg>
        </button>
        <button class="align-btn" title="Align Center" onclick={() => { selectedNode.alignItems = 'center'; onNodeUpdate(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16M6 8h12M8 16h8"/></svg>
        </button>
        <button class="align-btn" title="Align Right" onclick={() => { selectedNode.alignItems = 'flex-end'; onNodeUpdate(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 4v16M4 8h12M8 16h8"/></svg>
        </button>
        <div class="v-divider"></div>
        <button class="align-btn" title="Justify Start" onclick={() => { selectedNode.justifyContent = 'flex-start'; onNodeUpdate(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16M8 8v12M16 8v8"/></svg>
        </button>
        <button class="align-btn" title="Justify Center" onclick={() => { selectedNode.justifyContent = 'center'; onNodeUpdate(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M8 6v12M16 8v8"/></svg>
        </button>
        <button class="align-btn" title="Justify Between" onclick={() => { selectedNode.justifyContent = 'space-between'; onNodeUpdate(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16M8 4v12M16 4v12"/></svg>
        </button>
      </div>

      <div class="form-group">
        <div class="form-label">Node Identifier</div>
        <input type="text" class="form-control" bind:value={selectedNode.name} oninput={onNodeUpdate} />
      </div>

      {#if selectedNode.content !== null && selectedNode.content !== undefined}
        <div class="form-group">
          <div class="form-label">Button / Text Label</div>
          <input type="text" class="form-control" bind:value={selectedNode.content} oninput={onNodeUpdate} />
        </div>
      {/if}
    </div>

    <!-- 2. Layout Section -->
    <div class="inspector-section">
      <div class="inspector-section-title">Layout</div>

      <!-- Flow Display Toggle Icons -->
      <div class="flow-toggle-group">
        <button class="flow-btn" class:active={selectedNode.display === 'flex' && selectedNode.direction === 'column'} onclick={() => { selectedNode.display = 'flex'; selectedNode.direction = 'column'; onNodeUpdate(); }}>
          <span class="flow-icon">⫶</span>
          <span>Column</span>
        </button>
        <button class="flow-btn" class:active={selectedNode.display === 'flex' && selectedNode.direction === 'row'} onclick={() => { selectedNode.display = 'flex'; selectedNode.direction = 'row'; onNodeUpdate(); }}>
          <span class="flow-icon">⫴</span>
          <span>Row</span>
        </button>
        <button class="flow-btn" class:active={selectedNode.display === 'grid'} onclick={() => { selectedNode.display = 'grid'; onNodeUpdate(); }}>
          <span class="flow-icon">▦</span>
          <span>Grid</span>
        </button>
      </div>

      <!-- Dimensions -->
      <div class="grid-2col">
        <div class="form-group">
          <div class="form-label">Width Mode</div>
          <select bind:value={selectedNode.width} onchange={onNodeUpdate}>
            <option value="auto">Auto</option>
            <option value="100%">100% (w100)</option>
            <option value="100vw">100vw (vw100)</option>
            <option value="fill">Fill Space (grow)</option>
            <option value="custom">Custom px</option>
            <option value="minmax">Min/Max Range</option>
          </select>
        </div>
        <div class="form-group">
          <div class="form-label">Height Mode</div>
          <select bind:value={selectedNode.height} onchange={onNodeUpdate}>
            <option value="auto">Auto</option>
            <option value="100%">100% (h100)</option>
            <option value="100vh">100vh (vh100)</option>
            <option value="fill">Fill Space (grow)</option>
            <option value="custom">Custom px</option>
            <option value="minmax">Min/Max Range</option>
          </select>
        </div>
      </div>

      {#if selectedNode.width === 'custom'}
        <div class="form-group">
          <div class="form-label">Width Value (px)</div>
          <input type="text" class="form-control" placeholder="320px" bind:value={selectedNode.widthVal} oninput={onNodeUpdate} />
        </div>
      {:else if selectedNode.width === 'minmax'}
        <div class="grid-2col">
          <div class="form-group">
            <div class="form-label">Min Width</div>
            <input type="text" class="form-control" placeholder="180px" bind:value={selectedNode.minWVal} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Max Width</div>
            <input type="text" class="form-control" placeholder="400px" bind:value={selectedNode.maxWVal} oninput={onNodeUpdate} />
          </div>
        </div>
      {/if}

      {#if selectedNode.height === 'custom'}
        <div class="form-group">
          <div class="form-label">Height Value (px)</div>
          <input type="text" class="form-control" placeholder="200px" bind:value={selectedNode.heightVal} oninput={onNodeUpdate} />
        </div>
      {:else if selectedNode.height === 'minmax'}
        <div class="grid-2col">
          <div class="form-group">
            <div class="form-label">Min Height</div>
            <input type="text" class="form-control" placeholder="100px" bind:value={selectedNode.minHVal} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Max Height</div>
            <input type="text" class="form-control" placeholder="500px" bind:value={selectedNode.maxHVal} oninput={onNodeUpdate} />
          </div>
        </div>
      {/if}

      {#if selectedNode.display === 'grid'}
        <div class="form-group">
          <div class="form-label">Grid Columns</div>
          <select bind:value={selectedNode.gridCols} onchange={onNodeUpdate}>
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
            <option value={6}>6 Columns</option>
            <option value={12}>12 Columns</option>
          </select>
        </div>
      {/if}

      {#if isParentGrid}
        <div class="grid-2col">
          <div class="form-group">
            <div class="form-label">Column Span ({selectedNode.colSpan || 1})</div>
            <input type="range" min="1" max="12" bind:value={selectedNode.colSpan} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Row Span ({selectedNode.rowSpan || 1})</div>
            <input type="range" min="1" max="6" bind:value={selectedNode.rowSpan} oninput={onNodeUpdate} />
          </div>
        </div>
      {/if}

      <!-- Spacing (Unified or Per-Side) -->
      <div class="form-group">
        <div class="form-label">
          <span>Padding</span>
          <button class="toggle-link-btn" onclick={togglePerSidePadding}>
            {selectedNode.isPerSidePadding ? '🌐 All Sides' : '🔲 Per Side'}
          </button>
        </div>

        {#if selectedNode.isPerSidePadding}
          <div class="grid-2col">
            <div class="form-group">
              <div class="form-label">Top (px)</div>
              <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.paddingTop} oninput={onNodeUpdate} />
            </div>
            <div class="form-group">
              <div class="form-label">Right (px)</div>
              <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.paddingRight} oninput={onNodeUpdate} />
            </div>
            <div class="form-group">
              <div class="form-label">Bottom (px)</div>
              <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.paddingBottom} oninput={onNodeUpdate} />
            </div>
            <div class="form-group">
              <div class="form-label">Left (px)</div>
              <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.paddingLeft} oninput={onNodeUpdate} />
            </div>
          </div>
        {:else}
          <input type="range" min="0" max="64" step="4" bind:value={selectedNode.padding} oninput={onNodeUpdate} />
        {/if}
      </div>

      <div class="form-group">
        <div class="form-label">Gap <span>gap{selectedNode.gap}</span></div>
        <input type="range" min="0" max="48" step="4" bind:value={selectedNode.gap} oninput={onNodeUpdate} />
      </div>
      <div class="form-group">
        <div class="form-label">Margin Bottom <span>marginbot{selectedNode.marginBot}</span></div>
        <input type="range" min="0" max="48" step="4" bind:value={selectedNode.marginBot} oninput={onNodeUpdate} />
      </div>
    </div>

    <!-- 3. Appearance Section (Corner Radius Unified or Per-Corner ⛶) -->
    <div class="inspector-section">
      <div class="inspector-section-title flex-title">
        <span>Appearance</span>
        <button class="icon-toggle-btn" title="Toggle Per-Corner Radius" onclick={togglePerCornerRadius}>
          ⛶
        </button>
      </div>

      {#if selectedNode.isPerCornerRadius}
        <div class="grid-2col">
          <div class="form-group">
            <div class="form-label">Top-Left</div>
            <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.radiusTL} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Top-Right</div>
            <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.radiusTR} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Bottom-Right</div>
            <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.radiusBR} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Bottom-Left</div>
            <input type="number" min="0" max="100" class="form-control" bind:value={selectedNode.radiusBL} oninput={onNodeUpdate} />
          </div>
        </div>
      {:else}
        <div class="form-group">
          <div class="form-label">Corner Radius Token</div>
          <div class="radius-row">
            {#each radiusPills as rad}
              <button 
                class="radius-pill" 
                class:active={selectedNode.radius === rad} 
                onclick={() => { selectedNode.radius = rad as any; onNodeUpdate(); }}
              >
                {rad.replace('radius', '')}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- 4. Fill Section (Explicit Background Color + Surface Token) -->
    <div class="inspector-section">
      <div class="inspector-section-title">Fill</div>

      <div class="form-group">
        <div class="form-label">Background Color Picker</div>
        <div class="color-picker-row">
          <input type="color" class="color-picker-input" bind:value={selectedNode.backgroundColor} oninput={onNodeUpdate} />
          <input type="text" class="form-control" bind:value={selectedNode.backgroundColor} oninput={onNodeUpdate} />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Surface Preset Token</div>
        <select bind:value={selectedNode.surface} onchange={onNodeUpdate}>
          <option value="surface">Surface (var(--bg-surface))</option>
          <option value="panel">Panel (var(--bg-app) + border)</option>
          <option value="raised">Raised (var(--bg-raised))</option>
          <option value="subtle">Subtle (var(--slate-100))</option>
          <option value="none">Transparent</option>
          <option value="custom">Custom Color Picker</option>
        </select>
      </div>

      {#if selectedNode.surface === 'custom'}
        <div class="color-picker-row">
          <input type="color" class="color-picker-input" bind:value={selectedNode.customBg} oninput={onNodeUpdate} />
          <input type="text" class="form-control" bind:value={selectedNode.customBg} oninput={onNodeUpdate} />
        </div>
      {/if}
    </div>

    <!-- 5. Stroke & Typography Section (Unified or Per-Side Border) -->
    <div class="inspector-section">
      <div class="inspector-section-title flex-title">
        <span>Stroke & Text</span>
        <button class="toggle-link-btn" onclick={togglePerSideBorder}>
          {selectedNode.isPerSideBorder ? '🌐 All Borders' : '🔲 Per Side'}
        </button>
      </div>

      {#if selectedNode.isPerSideBorder}
        <div class="grid-2col">
          <div class="form-group">
            <div class="form-label">Border Top</div>
            <input type="text" class="form-control" placeholder="1px" bind:value={selectedNode.borderTopWidth} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Border Right</div>
            <input type="text" class="form-control" placeholder="1px" bind:value={selectedNode.borderRightWidth} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Border Bottom</div>
            <input type="text" class="form-control" placeholder="1px" bind:value={selectedNode.borderBottomWidth} oninput={onNodeUpdate} />
          </div>
          <div class="form-group">
            <div class="form-label">Border Left</div>
            <input type="text" class="form-control" placeholder="1px" bind:value={selectedNode.borderLeftWidth} oninput={onNodeUpdate} />
          </div>
        </div>
      {:else}
        <div class="grid-2col">
          <div class="form-group">
            <div class="form-label">Border Width</div>
            <select bind:value={selectedNode.borderWidth} onchange={onNodeUpdate}>
              <option value="0">None (0px)</option>
              <option value="1px">1px</option>
              <option value="2px">2px</option>
            </select>
          </div>
          <div class="form-group">
            <div class="form-label">Border Color</div>
            <input type="color" class="color-picker-input" bind:value={selectedNode.borderColor} oninput={onNodeUpdate} />
          </div>
        </div>
      {/if}

      <div class="grid-2col">
        <div class="form-group">
          <div class="form-label">Font Size Token</div>
          <select bind:value={selectedNode.fontSize} onchange={onNodeUpdate}>
            <option value="font12">12px (font12)</option>
            <option value="font14">14px (font14)</option>
            <option value="font16">16px (font16)</option>
            <option value="font20">20px (font20)</option>
            <option value="font24">24px (font24)</option>
            <option value="font32">32px (font32)</option>
          </select>
        </div>
        <div class="form-group">
          <div class="form-label">Text Color</div>
          <input type="color" class="color-picker-input" bind:value={selectedNode.textColor} oninput={onNodeUpdate} />
        </div>
      </div>
    </div>

    <!-- Delete Action -->
    <div class="form-group" style="margin-top: 4px;">
      <button class="btn btn-danger" onclick={onDeleteNode}>🗑️ Delete Node (Backspace/Del)</button>
    </div>

  </div>
</aside>

<style>
.sidebar-r {
  width: 360px;
  background-color: #0f172a;
  border-left: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
}

.inspector-header {
  padding: 12px 16px;
  border-bottom: 1px solid #1e293b;
  background: #0b0f17;
}

.inspector-title {
  font-size: 12px;
  font-weight: 700;
  color: #f9fafb;
  letter-spacing: -0.01em;
}

.inspector-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspector-section {
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: #0b0f17;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inspector-section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.flex-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-link-btn {
  background: transparent;
  border: none;
  color: #fb006f;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.icon-toggle-btn {
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
}

.icon-toggle-btn:hover {
  color: #fff;
  border-color: #fb006f;
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.crumb-item {
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.crumb-item:hover {
  color: #fb006f;
}

.crumb-item.active {
  color: #f9fafb;
  font-weight: 700;
  background: #1e293b;
}

.crumb-sep {
  color: #334155;
  font-size: 10px;
}

.align-bar {
  display: flex;
  align-items: center;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.align-btn {
  flex: 1;
  padding: 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
}

.align-btn:hover {
  background: #1e293b;
  color: #f9fafb;
}

.v-divider {
  width: 1px;
  height: 16px;
  background: #1e293b;
}

.flow-toggle-group {
  display: flex;
  gap: 4px;
}

.flow-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 0;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 6px;
  cursor: pointer;
}

.flow-btn:hover {
  color: #cbd5e1;
  background: #1e293b;
}

.flow-btn.active {
  background: #1e293b;
  border-color: #fb006f;
  color: #f9fafb;
}

.flow-icon {
  font-size: 13px;
}

.grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  display: flex;
  justify-content: space-between;
}

.form-control, select, input[type="range"], input[type="number"] {
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #1e293b;
  background: #0f172a;
  color: #f9fafb;
  font-size: 12px;
  outline: none;
}

.form-control:focus, select:focus {
  border-color: #fb006f;
}

.radius-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.radius-pill {
  padding: 6px 0;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid #1e293b;
  background: #0f172a;
  color: #64748b;
  cursor: pointer;
}

.radius-pill:hover {
  color: #f9fafb;
}

.radius-pill.active {
  background: #1e293b;
  border-color: #fb006f;
  color: #f9fafb;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker-input {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #1e293b;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.btn-danger {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #7f1d1d;
  border: 1px solid #991b1b;
  color: #fca5a5;
  cursor: pointer;
}

.btn-danger:hover {
  background: #991b1b;
  color: #fff;
}
</style>
