<script lang="ts">
  import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-svelte";
  import type { Variable, VariableCollection, VariableType } from "$lib/domain";
  import type { EditorSession } from "$lib/editor/editor.svelte";

  let { session }: { session: EditorSession } = $props();
  let expanded = $state(new Set<string>());
  let renamingId = $state<string | null>(null);
  let renameValue = $state("");
  let showAddVar = $state<string | null>(null);
  let newVarName = $state("");
  let newVarType = $state<VariableType>("color");
  let newCollectionModeId = $state<string | null>(null);
  let newModeName = $state("");

  const collections = $derived(session.document.variableCollections);
  const variables = $derived(session.document.variables);

  function collectionVariables(collectionId: string): Variable[] {
    return variables.filter((v) => v.collectionId === collectionId);
  }

  function activeMode(collection: VariableCollection) {
    const modeId = session.getActiveModeId(collection.id);
    return collection.modes.find((m) => m.id === modeId) ?? collection.modes[0];
  }

  function nextCollectionName(): string {
    let n = 1;
    const names = new Set(collections.map((c) => c.name));
    while (names.has(`Collection ${n}`)) n++;
    return `Collection ${n}`;
  }

  function nextModeName(collection: VariableCollection): string {
    let n = 1;
    const names = new Set(collection.modes.map((m) => m.name));
    while (names.has(`Mode ${n}`)) n++;
    return `Mode ${n}`;
  }

  function addCollection() {
    session.createVariableCollection(nextCollectionName());
  }

  function toggleExpand(id: string) {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    expanded = next;
  }

  function startRename(id: string, name: string) {
    renamingId = id;
    renameValue = name;
  }

  function commitRename() {
    if (!renamingId || !renameValue.trim()) { renamingId = null; return; }
    const parts = renamingId.split(":");
    if (parts.length === 1) session.renameCollection(parts[0], renameValue.trim());
    else session.renameMode(parts[0], parts[1], renameValue.trim());
    renamingId = null;
  }

  function cancelRename() { renamingId = null; }

  function addMode(collectionId: string) {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;
    session.addMode(collectionId, nextModeName(collection));
  }

  function addVariable(collectionId: string) {
    if (!newVarName.trim()) return;
    session.createVariable(collectionId, newVarName.trim(), newVarType);
    newVarName = "";
    newVarType = "color";
    showAddVar = null;
  }

  function deleteCollection(collectionId: string) {
    session.deleteCollection(collectionId);
    expanded.delete(collectionId);
  }

  function deleteVariable(id: string) {
    session.deleteVariable(id);
  }

  function updateValue(variableId: string, modeId: string, raw: string) {
    const variable = variables.find((v) => v.id === variableId);
    if (!variable) return;
    let value: string | number | boolean = raw;
    if (variable.type === "number") value = Number(raw) || 0;
    else if (variable.type === "boolean") value = raw === "true";
    session.setVariableModeValue(variableId, modeId, value);
  }

  function typeIcon(type: VariableType): string {
    return type === "color" ? "●" : type === "number" ? "#" : type === "boolean" ? "◉" : "T";
  }

  function modeValue(collection: VariableCollection, variableId: string): string | number | boolean {
    const mode = activeMode(collection);
    return mode?.values[variableId]?.value ?? "";
  }
</script>

<div class="variable-manager">
  <div class="vm-header">
    <span class="vm-title">Variables</span>
    <button title="Add collection" onclick={addCollection}><Plus size={13} /></button>
  </div>

  <div class="vm-list">
    {#each collections as collection (collection.id)}
      {@const vars = collectionVariables(collection.id)}
      {@const mode = activeMode(collection)}
      <div class="vm-collection">
        <div class="vm-collection-header">
          <button class="vm-expand" onclick={() => toggleExpand(collection.id)}>
            {#if expanded.has(collection.id)}<ChevronDown size={11} />{:else}<ChevronRight size={11} />{/if}
          </button>
          {#if renamingId === collection.id}
            <input class="vm-rename" bind:value={renameValue} onblur={commitRename} onkeydown={(e) => e.key === "Enter" ? commitRename() : e.key === "Escape" && cancelRename()} />
          {:else}
            <button class="vm-name-btn" onclick={() => startRename(collection.id, collection.name)}>
              <span>{collection.name}</span>
              <small>{vars.length}</small>
            </button>
          {/if}
          <button class="vm-delete" title="Delete collection" onclick={() => deleteCollection(collection.id)}><Trash2 size={10} /></button>
        </div>

        {#if expanded.has(collection.id)}
          <div class="vm-modes">
            {#each collection.modes as m (m.id)}
              {#if renamingId === `${collection.id}:${m.id}`}
                <input class="vm-mode-rename" bind:value={renameValue} onblur={commitRename} onkeydown={(e) => e.key === "Enter" ? commitRename() : e.key === "Escape" && cancelRename()} />
              {:else}
                <button class="vm-mode" class:active={mode?.id === m.id} onclick={() => session.setActiveMode(collection.id, m.id)} ondblclick={() => startRename(`${collection.id}:${m.id}`, m.name)}>
                  {m.name}
                </button>
              {/if}
              {#if collection.modes.length > 1 && mode?.id !== m.id}
                <button class="vm-mode-delete" title="Delete mode" onclick={() => session.deleteMode(collection.id, m.id)}>×</button>
              {/if}
            {/each}
            <button class="vm-add-mode" title="Add mode" onclick={() => addMode(collection.id)}><Plus size={10} /></button>
          </div>

          <div class="vm-variables">
            {#if vars.length === 0}
              <div class="vm-empty">No variables yet<span>Add a variable to this collection.</span></div>
            {:else}
              {#each vars as variable (variable.id)}
                <div class="vm-var">
                  <span class="vm-var-icon">{typeIcon(variable.type)}</span>
                  <span class="vm-var-name">{variable.name}</span>
                  {#if variable.type === "color"}
                    <input type="color" class="vm-color" value={String(modeValue(collection, variable.id) || "#6366f1")} oninput={(e) => updateValue(variable.id, mode?.id ?? "", e.currentTarget.value)} />
                  {:else if variable.type === "number"}
                    <input type="number" class="vm-num" value={modeValue(collection, variable.id)} onblur={(e) => updateValue(variable.id, mode?.id ?? "", e.currentTarget.value)} />
                  {:else if variable.type === "boolean"}
                    <button class="vm-bool" class:on={modeValue(collection, variable.id) === true} onclick={() => updateValue(variable.id, mode?.id ?? "", String(modeValue(collection, variable.id) !== true))}>{modeValue(collection, variable.id) === true ? "On" : "Off"}</button>
                  {:else}
                    <input type="text" class="vm-str" value={String(modeValue(collection, variable.id) ?? "")} onblur={(e) => updateValue(variable.id, mode?.id ?? "", e.currentTarget.value)} />
                  {/if}
                  <button class="vm-var-delete" title="Delete variable" onclick={() => deleteVariable(variable.id)}><Trash2 size={9} /></button>
                </div>
              {/each}
            {/if}

            {#if showAddVar === collection.id}
              <div class="vm-add-form">
                <input placeholder="Variable name" bind:value={newVarName} onkeydown={(e) => e.key === "Enter" && addVariable(collection.id)} />
                <select bind:value={newVarType}>
                  <option value="color">Color</option>
                  <option value="number">Number</option>
                  <option value="string">String</option>
                  <option value="boolean">Boolean</option>
                </select>
                <button class="vm-create" onclick={() => addVariable(collection.id)}>Create</button>
              </div>
            {:else}
              <button class="vm-add-var" onclick={() => { showAddVar = collection.id; newVarName = ""; newVarType = "color"; }}>
                <Plus size={11} /> Add variable
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/each}

    {#if collections.length === 0}
      <div class="vm-empty">No collections yet<span>Create a collection to organize design variables.</span></div>
    {/if}
  </div>
</div>

<style>
  .variable-manager { display: flex; flex-direction: column; border-top: 1px solid #3d3d3d; }
  .vm-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px 4px; }
  .vm-title { font-size: 10px; font-weight: 600; color: #ddd; }
  .vm-header button { border: 0; background: transparent; color: #bbb; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 4px; cursor: pointer; }
  .vm-header button:hover { background: #3b3b3b; color: white; }
  .vm-list { padding: 0 4px 6px; display: flex; flex-direction: column; gap: 2px; max-height: 360px; overflow-y: auto; }
  .vm-collection { border-radius: 4px; }
  .vm-collection-header { display: flex; align-items: center; gap: 4px; height: 28px; padding: 0 4px; }
  .vm-expand { border: 0; background: transparent; color: #888; display: grid; place-items: center; cursor: pointer; padding: 0; width: 16px; }
  .vm-name-btn { flex: 1; min-width: 0; border: 0; background: transparent; color: #ddd; display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 9px; text-align: left; padding: 0; }
  .vm-name-btn span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vm-name-btn small { color: #777; font-size: 7px; flex-shrink: 0; }
  .vm-rename { flex: 1; height: 22px; border: 1px solid #0d99ff; border-radius: 3px; background: #2a2a2a; color: #eee; font-size: 9px; padding: 0 5px; min-width: 0; }
  .vm-delete { opacity: 0; border: 0; background: transparent; color: #f87171; cursor: pointer; padding: 2px; border-radius: 3px; display: flex; }
  .vm-collection-header:hover .vm-delete { opacity: 1; }
  .vm-delete:hover { background: #3a1a1a; }
  .vm-modes { display: flex; flex-wrap: wrap; gap: 3px; padding: 2px 0 4px 20px; align-items: center; }
  .vm-mode { height: 20px; border: 1px solid #444; border-radius: 3px; background: #333; color: #aaa; font-size: 8px; padding: 0 7px; cursor: pointer; }
  .vm-mode.active { background: #0d99ff33; border-color: #0d99ff; color: #eee; }
  .vm-mode:hover { border-color: #666; }
  .vm-mode-rename { height: 20px; border: 1px solid #0d99ff; border-radius: 3px; background: #2a2a2a; color: #eee; font-size: 8px; padding: 0 5px; width: 60px; }
  .vm-mode-delete { border: 0; background: transparent; color: #888; font-size: 10px; cursor: pointer; padding: 0 2px; line-height: 1; }
  .vm-mode-delete:hover { color: #f87171; }
  .vm-add-mode { width: 20px; height: 20px; border: 1px dashed #555; border-radius: 3px; background: transparent; color: #888; display: grid; place-items: center; cursor: pointer; }
  .vm-add-mode:hover { border-color: #0d99ff; color: #0d99ff; }
  .vm-variables { padding: 2px 0 4px 20px; display: flex; flex-direction: column; gap: 2px; }
  .vm-empty { padding: 10px; color: #666; text-align: center; font-size: 8px; }
  .vm-empty span { display: block; margin-top: 3px; color: #555; font-size: 7px; }
  .vm-var { display: flex; align-items: center; gap: 5px; height: 24px; padding: 0 4px; border-radius: 3px; }
  .vm-var:hover { background: #333; }
  .vm-var-icon { width: 14px; text-align: center; font-size: 9px; color: #888; flex-shrink: 0; }
  .vm-var-name { flex: 1; min-width: 0; font-size: 8px; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vm-color { width: 22px; height: 18px; border: 1px solid #555; border-radius: 3px; padding: 1px; background: transparent; cursor: pointer; }
  .vm-num { width: 48px; height: 20px; border: 1px solid #444; border-radius: 3px; background: #2a2a2a; color: #eee; font-size: 8px; padding: 0 4px; text-align: right; }
  .vm-str { flex: 1; height: 20px; border: 1px solid #444; border-radius: 3px; background: #2a2a2a; color: #eee; font-size: 8px; padding: 0 4px; min-width: 0; }
  .vm-bool { height: 20px; border: 1px solid #555; border-radius: 3px; background: #333; color: #aaa; font-size: 7px; padding: 0 8px; cursor: pointer; }
  .vm-bool.on { background: #0d99ff33; border-color: #0d99ff; color: #eee; }
  .vm-var-delete { opacity: 0; border: 0; background: transparent; color: #f87171; cursor: pointer; padding: 2px; border-radius: 2px; display: flex; }
  .vm-var:hover .vm-var-delete { opacity: 1; }
  .vm-var-delete:hover { background: #3a1a1a; }
  .vm-add-form { display: flex; flex-direction: column; gap: 4px; padding: 4px 0; }
  .vm-add-form input { height: 24px; border: 1px solid #444; border-radius: 3px; background: #2a2a2a; color: #eee; font-size: 8px; padding: 0 6px; }
  .vm-add-form select { height: 24px; border: 1px solid #444; border-radius: 3px; background: #353535; color: #eee; font-size: 8px; padding: 0 4px; }
  .vm-create { height: 24px; border: 0; border-radius: 3px; background: #0d99ff; color: white; font-size: 8px; cursor: pointer; }
  .vm-create:hover { background: #0b8ae8; }
  .vm-add-var { height: 26px; border: 1px dashed #444; border-radius: 3px; background: transparent; color: #888; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; font-size: 8px; margin-top: 2px; }
  .vm-add-var:hover { border-color: #0d99ff; color: #0d99ff; }
</style>
