<script lang="ts">
  import { Component, Plus, Trash2, Copy, ExternalLink } from "lucide-svelte";
  import type { ComponentDefinition, ComponentProperty, DesignNode } from "$lib/domain";
  import type { EditorSession } from "$lib/editor/editor.svelte";

  let { session }: { session: EditorSession } = $props();
  let showCreate = $state(false);
  let newComponentName = $state("");
  let showOverrides = $state(false);

  const components = $derived(Object.values(session.document.components));
  const selected = $derived(session.selectedNodes);
  const singleNode = $derived(selected.length === 1 ? selected[0] : null);
  const isInstance = $derived(singleNode?.isInstance === true);
  const componentDef = $derived(isInstance && singleNode?.componentId ? session.document.components[singleNode.componentId] : null);
  const instanceOverrides = $derived(singleNode?.overrides ?? {});

  const canCreateComponent = $derived(selected.length > 0);

  function createComponent() {
    if (!newComponentName.trim() || !canCreateComponent) return;
    session.createComponent(newComponentName.trim());
    newComponentName = "";
    showCreate = false;
  }

  function createInstance(component: ComponentDefinition) {
    const viewport = session.document.viewport;
    const cx = -viewport.x / viewport.zoom + 200;
    const cy = -viewport.y / viewport.zoom + 200;
    session.createInstance(component.id, cx, cy);
  }

  function detachInstance() {
    if (singleNode?.isInstance) {
      session.detachInstance(singleNode.id);
    }
  }

  function goToSource(component: ComponentDefinition) {
    session.select(component.sourceNodeId);
  }

  function toggleOverride(propId: string, value: boolean) {
    if (singleNode) session.setInstanceOverride(singleNode.id, propId, value);
  }
</script>

<div class="component-manager">
  <div class="comp-header">
    <span class="comp-title">Components</span>
    <button class="comp-add-btn" title="Create component" onclick={() => (showCreate = !showCreate, newComponentName = "")}>
      <Plus size={12} />
    </button>
  </div>

  {#if showCreate}
    <div class="new-comp-input">
      <input placeholder="Component name" bind:value={newComponentName} onkeydown={(e) => e.key === "Enter" && createComponent()} />
      <button class="confirm-btn" disabled={!canCreateComponent || !newComponentName.trim()} onclick={createComponent}>Create</button>
    </div>
  {/if}

  {#if isInstance && componentDef}
    <div class="instance-bar">
      <button class="instance-btn" onclick={() => (showOverrides = !showOverrides)}>
        <Component size={11} />
        <span>{componentDef.name}</span>
        <span class="chevron">{showOverrides ? "⌃" : "⌄"}</span>
      </button>
      {#if showOverrides && componentDef.properties.length > 0}
        <div class="overrides-list">
          {#each componentDef.properties as prop}
            <div class="override-row">
              <span class="override-label">{prop.name}</span>
              {#if prop.type === "boolean"}
                <button class="toggle-btn" class:active={Boolean(instanceOverrides[prop.id] ?? prop.defaultValue)} onclick={() => toggleOverride(prop.id, !(instanceOverrides[prop.id] ?? prop.defaultValue))}>
                  {Boolean(instanceOverrides[prop.id] ?? prop.defaultValue) ? "On" : "Off"}
                </button>
              {:else if prop.type === "text"}
                <input class="override-input" value={String(instanceOverrides[prop.id] ?? prop.defaultValue)} onblur={(event) => session.setInstanceOverride(singleNode!.id, prop.id, event.currentTarget.value)} />
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      <button class="detach-btn" onclick={detachInstance}>Detach instance</button>
    </div>
  {/if}

  <div class="comp-list">
    {#if components.length === 0}
      <div class="comp-empty">
        <Component size={18} />
        <p>No components yet</p>
        <span>Select layers and create a component to reuse them.</span>
      </div>
    {:else}
      {#each components as comp}
        <div class="comp-item">
          <button class="comp-name" onclick={() => createInstance(comp)}>
            <Component size={11} />
            <span>{comp.name}</span>
          </button>
          <button class="comp-action" title="Go to source" onclick={() => goToSource(comp)}>
            <ExternalLink size={9} />
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .component-manager { display: flex; flex-direction: column; border-top: 1px solid #3d3d3d; }
  .comp-header { height: 32px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; }
  .comp-title { font-size: 9px; font-weight: 600; color: #aaa; }
  .comp-add-btn { border: 0; background: transparent; color: #aaa; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 4px; cursor: pointer; }
  .comp-add-btn:hover { background: #3a3a3a; color: white; }
  .comp-add-btn:disabled { opacity: .3; }
  .new-comp-input { display: flex; gap: 4px; padding: 0 10px 6px; }
  .new-comp-input input { flex: 1; height: 26px; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #eee; padding: 0 6px; font-size: 9px; }
  .confirm-btn { height: 26px; border: 0; border-radius: 4px; background: #0d99ff; color: white; padding: 0 10px; font-size: 8px; cursor: pointer; }
  .confirm-btn:disabled { opacity: .3; cursor: default; }
  .instance-bar { padding: 6px 10px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #3a3a3a; }
  .instance-btn { width: 100%; height: 30px; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #0d99ff; display: flex; align-items: center; gap: 6px; padding: 0 10px; cursor: pointer; font-size: 9px; }
  .instance-btn:hover { border-color: #0d99ff; }
  .chevron { margin-left: auto; font-size: 8px; }
  .overrides-list { padding: 4px 0; display: flex; flex-direction: column; gap: 4px; }
  .override-row { display: flex; align-items: center; justify-content: space-between; padding: 0 4px; }
  .override-label { color: #999; font-size: 8px; }
  .override-input { width: 60px; height: 22px; border: 1px solid #444; border-radius: 3px; background: #2a2a2a; color: #eee; padding: 0 5px; font-size: 8px; }
  .toggle-btn { height: 22px; border: 0; border-radius: 3px; background: #3a3a3a; color: #999; padding: 0 10px; font-size: 8px; cursor: pointer; }
  .toggle-btn.active { background: #0d99ff; color: white; }
  .detach-btn { height: 24px; border: 1px solid #555; border-radius: 3px; background: transparent; color: #f87171; font-size: 8px; cursor: pointer; }
  .detach-btn:hover { background: #3a1a1a; }
  .comp-list { padding: 4px; display: flex; flex-direction: column; gap: 2px; max-height: 200px; overflow-y: auto; }
  .comp-empty { height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #555; text-align: center; padding: 10px; }
  .comp-empty p { color: #888; font-size: 9px; margin: 6px 0 2px; }
  .comp-empty span { font-size: 7px; line-height: 1.4; }
  .comp-item { display: flex; align-items: center; gap: 2px; }
  .comp-name { flex: 1; height: 28px; border: 0; border-radius: 4px; background: transparent; color: #ddd; display: flex; align-items: center; gap: 6px; padding: 0 8px; cursor: pointer; font-size: 9px; }
  .comp-name:hover { background: #353535; }
  .comp-action { opacity: 0; border: 0; background: transparent; color: #aaa; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 3px; cursor: pointer; }
  .comp-item:hover .comp-action { opacity: 1; }
  .comp-action:hover { background: #3a3a3a; color: white; }
</style>