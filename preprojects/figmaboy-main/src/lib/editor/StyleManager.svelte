<script lang="ts">
  import { Plus, Trash2, PaintBucket, Type, Sparkles } from "lucide-svelte";
  import type { ColorStyle, EffectStyle, TextStyle } from "$lib/domain";
  import type { EditorSession } from "$lib/editor/editor.svelte";

  let { session }: { session: EditorSession } = $props();
  let activeTab = $state<"color" | "text" | "effect">("color");
  let newStyleName = $state("");
  let showNewInput = $state(false);

  const colorStyles = $derived(session.document.colorStyles);
  const textStyles = $derived(session.document.textStyles);
  const effectStyles = $derived(session.document.effectStyles);

  const selected = $derived(session.selectedNodes);
  const singleNode = $derived(selected.length === 1 ? selected[0] : null);

  function createColorStyle() {
    if (!newStyleName.trim()) return;
    const color = singleNode?.fill?.type === "solid" ? singleNode.fill.color : "#6366f1";
    const opacity = singleNode?.fill?.type === "solid" ? singleNode.fill.opacity : 1;
    session.createColorStyle(newStyleName.trim(), { type: "solid", color, opacity });
    newStyleName = "";
    showNewInput = false;
  }

  function createTextStyle() {
    if (!newStyleName.trim() || singleNode?.type !== "text") return;
    session.createTextStyle(newStyleName.trim(), {
      fontFamily: singleNode.fontFamily,
      fontSize: singleNode.fontSize,
      fontWeight: singleNode.fontWeight,
      fontStyle: singleNode.fontStyle,
      lineHeight: singleNode.lineHeight,
      letterSpacing: singleNode.letterSpacing,
      textCase: singleNode.textCase,
      textDecoration: singleNode.textDecoration,
      paragraphSpacing: singleNode.paragraphSpacing,
    });
    newStyleName = "";
    showNewInput = false;
  }

  function createEffectStyle() {
    if (!newStyleName.trim() || !singleNode?.effects?.length) return;
    session.createEffectStyle(newStyleName.trim(), singleNode.effects);
    newStyleName = "";
    showNewInput = false;
  }

  function applyColorStyle(style: ColorStyle) {
    session.applyStyle("color", style.id);
  }

  function applyTextStyle(style: TextStyle) {
    if (singleNode?.type !== "text") return;
    session.applyStyle("text", style.id);
  }

  function applyEffectStyle(style: EffectStyle) {
    session.applyStyle("effect", style.id);
  }

  function deleteStyle(kind: "color" | "text" | "effect", id: string) {
    session.deleteStyle(kind, id);
  }

  function canCreate(type: "color" | "text" | "effect"): boolean {
    if (type === "text" && singleNode?.type !== "text") return false;
    if (type === "effect" && !singleNode?.effects?.length) return false;
    return true;
  }

  const tabs: { id: "color" | "text" | "effect"; label: string; icon: typeof PaintBucket }[] = [
    { id: "color", label: "Color", icon: PaintBucket },
    { id: "text", label: "Text", icon: Type },
    { id: "effect", label: "Effects", icon: Sparkles },
  ];
</script>

<div class="style-manager">
  <div class="style-tabs">
    {#each tabs as tab}
      <button class:active={activeTab === tab.id} onclick={() => (activeTab = tab.id)}>
        <tab.icon size={12} />
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>

  <div class="style-list">
    {#if activeTab === "color"}
      {#each colorStyles as style}
        <div class="style-item" role="button" tabindex="0" onclick={() => applyColorStyle(style)} onkeydown={(e) => e.key === "Enter" && applyColorStyle(style)}>
          <span class="color-swatch" style="background: {style.paint.type === 'solid' ? style.paint.color : style.paint.stops[0]?.color ?? '#6366f1'}"></span>
          <span class="style-name">{style.name}</span>
          <button class="delete-btn" title="Delete style" onclick={(e) => { e.stopPropagation(); deleteStyle("color", style.id); }}>
            <Trash2 size={10} />
          </button>
        </div>
      {/each}
      {#if showNewInput}
        <div class="new-style-input">
          <input placeholder="Style name" bind:value={newStyleName} onkeydown={(e) => e.key === "Enter" && createColorStyle()} />
          <button class="confirm-btn" onclick={createColorStyle}>Create</button>
        </div>
      {:else}
        <button class="add-style-btn" onclick={() => (showNewInput = true, newStyleName = "")}>
          <Plus size={12} /> New color style
        </button>
      {/if}
    {:else if activeTab === "text"}
      {#each textStyles as style}
        <div class="style-item text-item" role="button" tabindex="0" onclick={() => applyTextStyle(style)} onkeydown={(e) => e.key === "Enter" && applyTextStyle(style)}>
          <span class="text-preview" style="font-family: {style.fontFamily}; font-size: {Math.min(style.fontSize, 24)}px; font-weight: {style.fontWeight}">Ag</span>
          <span class="style-name">{style.name}</span>
          <span class="style-meta">{style.fontSize}px / {style.fontWeight}</span>
          <button class="delete-btn" title="Delete style" onclick={(e) => { e.stopPropagation(); deleteStyle("text", style.id); }}>
            <Trash2 size={10} />
          </button>
        </div>
      {/each}
      {#if showNewInput}
        <div class="new-style-input">
          <input placeholder="Style name" bind:value={newStyleName} onkeydown={(e) => e.key === "Enter" && createTextStyle()} />
          <button class="confirm-btn" disabled={!canCreate("text")} onclick={createTextStyle}>Create</button>
        </div>
      {:else}
        <button class="add-style-btn" disabled={!canCreate("text")} onclick={() => (showNewInput = true, newStyleName = "")}>
          <Plus size={12} /> New text style
        </button>
      {/if}
    {:else}
      {#each effectStyles as style}
        <div class="style-item effect-item" role="button" tabindex="0" onclick={() => applyEffectStyle(style)} onkeydown={(e) => e.key === "Enter" && applyEffectStyle(style)}>
          <span class="effect-icon"><Sparkles size={12} /></span>
          <span class="style-name">{style.name}</span>
          <span class="style-meta">{style.effects.length} effect{style.effects.length !== 1 ? "s" : ""}</span>
          <button class="delete-btn" title="Delete style" onclick={(e) => { e.stopPropagation(); deleteStyle("effect", style.id); }}>
            <Trash2 size={10} />
          </button>
        </div>
      {/each}
      {#if showNewInput}
        <div class="new-style-input">
          <input placeholder="Style name" bind:value={newStyleName} onkeydown={(e) => e.key === "Enter" && createEffectStyle()} />
          <button class="confirm-btn" disabled={!canCreate("effect")} onclick={createEffectStyle}>Create</button>
        </div>
      {:else}
        <button class="add-style-btn" disabled={!canCreate("effect")} onclick={() => (showNewInput = true, newStyleName = "")}>
          <Plus size={12} /> New effect style
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .style-manager { display: flex; flex-direction: column; border-top: 1px solid #3d3d3d; }
  .style-tabs { display: flex; padding: 4px; gap: 2px; background: #202020; }
  .style-tabs button { flex: 1; height: 26px; border: 0; border-radius: 4px; background: transparent; color: #999; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; font-size: 8px; }
  .style-tabs button.active { background: #383838; color: #eee; }
  .style-list { padding: 4px; display: flex; flex-direction: column; gap: 2px; max-height: 200px; overflow-y: auto; }
  .style-item { width: 100%; height: 32px; padding: 0 8px; border: 0; border-radius: 4px; background: transparent; color: #ddd; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 9px; }
  .style-item:hover { background: #353535; }
  .color-swatch { width: 16px; height: 16px; border-radius: 3px; border: 1px solid #555; flex-shrink: 0; }
  .text-preview { width: 28px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #eee; }
  .effect-icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #999; }
  .style-name { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .style-meta { color: #777; font-size: 7px; flex-shrink: 0; }
  .delete-btn { opacity: 0; border: 0; background: transparent; color: #f87171; cursor: pointer; padding: 2px; border-radius: 3px; display: flex; }
  .style-item:hover .delete-btn { opacity: 1; }
  .delete-btn:hover { background: #3a1a1a; }
  .add-style-btn { width: 100%; height: 30px; border: 1px dashed #444; border-radius: 4px; background: transparent; color: #888; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; font-size: 8px; }
  .add-style-btn:hover { border-color: #0d99ff; color: #0d99ff; }
  .add-style-btn:disabled { opacity: .3; cursor: default; }
  .new-style-input { display: flex; gap: 4px; padding: 2px 0; }
  .new-style-input input { flex: 1; height: 26px; border: 1px solid #444; border-radius: 4px; background: #2a2a2a; color: #eee; padding: 0 6px; font-size: 9px; }
  .confirm-btn { height: 26px; border: 0; border-radius: 4px; background: #0d99ff; color: white; padding: 0 10px; font-size: 8px; cursor: pointer; }
  .confirm-btn:disabled { opacity: .3; cursor: default; }
</style>