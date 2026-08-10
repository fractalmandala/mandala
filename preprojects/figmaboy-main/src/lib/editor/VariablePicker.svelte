<script lang="ts">
  import { X, Plus } from "lucide-svelte";
  import type { Variable, VariableCollection, VariableType } from "$lib/domain";
  import type { EditorSession } from "$lib/editor/editor.svelte";

  let {
    session, propertyPath, onPick, onUnbind, onClose,
  }: {
    session: EditorSession;
    propertyPath: string;
    onPick: (variableId: string) => void;
    onUnbind: () => void;
    onClose: () => void;
  } = $props();

  let showCreate = $state(false);
  let createName = $state("");
  let createType = $state<VariableType>("color");
  let createCollectionId = $state<string | null>(null);

  const collections = $derived(session.document.variableCollections);
  const allVariables = $derived(session.document.variables);
  const node = $derived(session.selectedNodes.length === 1 ? session.selectedNodes[0] : null);
  const currentBinding = $derived(node?.boundVariables?.[propertyPath] ?? null);

  function collectionVars(collectionId: string): Variable[] {
    return allVariables.filter((v) => v.collectionId === collectionId);
  }

  function typeIcon(type: VariableType): string {
    return type === "color" ? "●" : type === "number" ? "#" : type === "boolean" ? "◉" : "T";
  }

  function resolvedValue(variable: Variable): string {
    const val = session.resolveVariableValue(variable.id);
    if (val === undefined) return "—";
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") return String(Math.round(val * 100) / 100);
    return val;
  }

  function pick(id: string) {
    onPick(id);
    onClose();
  }

  function createAndPick() {
    if (!createName.trim() || !createCollectionId) return;
    const variable = session.createVariable(createCollectionId, createName.trim(), createType);
    if (variable) pick(variable.id);
    showCreate = false;
  }

  function startCreate() {
    showCreate = true;
    createCollectionId = collections[0]?.id ?? null;
    createName = "";
    createType = "color";
  }

  function handleBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement)?.closest(".vp-dropdown")) return;
    onClose();
  }
</script>

<svelte:window onclick={handleBackdropClick} />

<div class="vp-dropdown">
  <div class="vp-header">
    <span>Bind variable</span>
    {#if currentBinding}<button class="vp-unbind" onclick={onUnbind}>Unbind</button>{/if}
    <button class="vp-close" onclick={onClose}><X size={11} /></button>
  </div>

  {#if !showCreate}
    <div class="vp-list">
      {#each collections as collection (collection.id)}
        {@const vars = collectionVars(collection.id)}
        {#if vars.length > 0}
          <div class="vp-group">
            <span class="vp-group-label">{collection.name}</span>
            {#each vars as variable (variable.id)}
              <button class="vp-item" class:selected={currentBinding === variable.id} onclick={() => pick(variable.id)}>
                <span class="vp-icon">{typeIcon(variable.type)}</span>
                <span class="vp-name">{variable.name}</span>
                <span class="vp-value">{resolvedValue(variable)}</span>
              </button>
            {/each}
          </div>
        {/if}
      {/each}

      {#if collections.length === 0}
        <div class="vp-empty">No variables yet</div>
      {/if}

      <button class="vp-create-btn" onclick={startCreate}>
        <Plus size={11} /> Create variable
      </button>
    </div>
  {:else}
    <div class="vp-create-form">
      <input placeholder="Variable name" bind:value={createName} onkeydown={(e) => e.key === "Enter" && createAndPick()} />
      <select bind:value={createType}>
        <option value="color">Color</option>
        <option value="number">Number</option>
        <option value="string">String</option>
        <option value="boolean">Boolean</option>
      </select>
      <select bind:value={createCollectionId}>
        {#each collections as c}<option value={c.id}>{c.name}</option>{/each}
      </select>
      <div class="vp-create-actions">
        <button class="vp-cancel" onclick={() => (showCreate = false)}>Back</button>
        <button class="vp-confirm" onclick={createAndPick}>Create & bind</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .vp-dropdown { position: absolute; z-index: 100; right: 0; top: 100%; width: 220px; max-height: 300px; background: #2a2a2a; border: 1px solid #555; border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,.4); display: flex; flex-direction: column; overflow: hidden; }
  .vp-header { display: flex; align-items: center; padding: 6px 8px; border-bottom: 1px solid #3d3d3d; font-size: 9px; color: #ccc; gap: 4px; }
  .vp-header span { flex: 1; }
  .vp-unbind { border: 0; background: #f8717133; color: #f87171; font-size: 7px; padding: 2px 6px; border-radius: 3px; cursor: pointer; }
  .vp-close { border: 0; background: transparent; color: #888; cursor: pointer; padding: 2px; display: grid; }
  .vp-close:hover { color: #eee; }
  .vp-list { overflow-y: auto; flex: 1; padding: 4px; }
  .vp-group { margin-bottom: 4px; }
  .vp-group-label { display: block; font-size: 7px; color: #888; padding: 3px 6px 2px; font-weight: 600; }
  .vp-item { width: 100%; height: 24px; border: 0; border-radius: 3px; background: transparent; color: #ddd; display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 8px; padding: 0 6px; }
  .vp-item:hover { background: #383838; }
  .vp-item.selected { background: #0d99ff33; color: #eee; }
  .vp-icon { width: 12px; text-align: center; color: #888; font-size: 8px; flex-shrink: 0; }
  .vp-name { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vp-value { color: #777; font-size: 7px; flex-shrink: 0; max-width: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vp-empty { padding: 12px; text-align: center; color: #666; font-size: 8px; }
  .vp-create-btn { width: 100%; height: 26px; border: 1px dashed #444; border-radius: 3px; background: transparent; color: #888; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; font-size: 8px; margin-top: 2px; }
  .vp-create-btn:hover { border-color: #0d99ff; color: #0d99ff; }
  .vp-create-form { padding: 6px; display: flex; flex-direction: column; gap: 4px; }
  .vp-create-form input { height: 24px; border: 1px solid #444; border-radius: 3px; background: #333; color: #eee; font-size: 8px; padding: 0 6px; }
  .vp-create-form select { height: 24px; border: 1px solid #444; border-radius: 3px; background: #353535; color: #eee; font-size: 8px; padding: 0 4px; }
  .vp-create-actions { display: flex; gap: 4px; }
  .vp-cancel { flex: 1; height: 24px; border: 1px solid #444; border-radius: 3px; background: #333; color: #ddd; font-size: 8px; cursor: pointer; }
  .vp-confirm { flex: 1; height: 24px; border: 0; border-radius: 3px; background: #0d99ff; color: white; font-size: 8px; cursor: pointer; }
  .vp-confirm:hover { background: #0b8ae8; }
</style>
