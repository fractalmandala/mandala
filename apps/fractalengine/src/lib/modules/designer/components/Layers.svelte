<script lang="ts">
	// designcanvas/Layers
	//
	// Figma-style layers panel for the design canvas scene graph: nested tree
	// (frames/containers act as groups), collapsible, drag-to-reorder/reparent,
	// multi-select (click / shift-range / cmd-toggle), and a right-click context
	// menu with cut/copy/paste/rename/group/frame/delete.
	//
	// `blocks`/`selectedIds` are bound directly to the host canvas's state — a
	// layer row click selects on canvas and vice versa, since both read/write
	// the same arrays.
	import type { DesignBlock as Block } from '$lib/modules/designer/engine/designtypes';
	import { designcanvas } from '$lib/modules/designer/state/designcanvas.svelte';

	let {
		blocks = designcanvas.items,
		selectedIds = designcanvas.selectedIds,
		onchange,
	}: {
		blocks?: Block[];
		selectedIds?: string[];
		onchange?: () => void;
	} = $props();

	type Row = { block: Block; depth: number };

	let lastSelectedId = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let editingValue = $state('');
	let contextMenu = $state<{ x: number; y: number; blockId: string } | null>(null);
	let renameInput = $state<HTMLInputElement | null>(null);

	function childrenOf(parentId: string | null): Block[] {
		if (parentId === null) return blocks.filter((b) => b.parentId === null);
		const parent = blocks.find((b) => b.id === parentId);
		if (!parent) return [];
		const actualChildren = blocks.filter((b) => b.parentId === parentId);
		const order = new Map(parent.children.map((id, index) => [id, index]));
		return actualChildren.sort(
			(a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER)
		);
	}

	// Flatten the tree into a depth-tagged list, respecting collapse state.
	// This is what's rendered and what drag/shift-range hit-testing walks.
	const rows = $derived.by(() => {
		const result: Row[] = [];
		function walk(parentId: string | null, depth: number) {
			for (const block of childrenOf(parentId)) {
				result.push({ block, depth });
				if (block.children.length > 0 && !designcanvas.isCollapsed(block.id)) {
					walk(block.id, depth + 1);
				}
			}
		}
		walk(null, 0);
		return result;
	});

	function iconFor(block: Block): string {
		switch (block.type) {
			case 'frame': return 'frame.svg';
			case 'container': return 'groups.svg';
			case 'card': return 'designGrid.svg';
			case 'text': return 'text.svg';
			case 'image': return 'image.svg';
			default: return 'designGrid.svg';
		}
	}

	function notifyChange() {
		onchange?.();
	}

	function toggleCollapse(id: string, event: MouseEvent) {
		event.stopPropagation();
		designcanvas.toggleCollapse(id);
	}

	// ── Selection ────────────────────────────────────────────────────────────
	function selectRow(block: Block, event: MouseEvent | KeyboardEvent) {
		if (editingId) return;
		if (event.shiftKey && lastSelectedId) {
			const ids = rows.map((r) => r.block.id);
			const i1 = ids.indexOf(lastSelectedId);
			const i2 = ids.indexOf(block.id);
			if (i1 !== -1 && i2 !== -1) {
				const [start, end] = i1 < i2 ? [i1, i2] : [i2, i1];
				selectedIds = ids.slice(start, end + 1);
				designcanvas.selectedIds = [...selectedIds];
				return;
			}
		}
		if (event.metaKey || event.ctrlKey) {
			selectedIds = selectedIds.includes(block.id)
				? selectedIds.filter((id) => id !== block.id)
				: [...selectedIds, block.id];
		} else {
			selectedIds = [block.id];
		}
		designcanvas.selectedIds = [...selectedIds];
		lastSelectedId = block.id;
	}

	// ── Rename ───────────────────────────────────────────────────────────────
	function startRename(block: Block) {
		editingId = block.id;
		editingValue = block.name;
		closeContextMenu();
		setTimeout(() => {
			renameInput?.focus();
			renameInput?.select();
		}, 0);
	}

	function commitRename() {
		if (editingId) {
			const block = blocks.find((b) => b.id === editingId);
			if (block && editingValue.trim() && editingValue.trim() !== block.name) {
				designcanvas.setBlockName(editingId, editingValue.trim());
				notifyChange();
			}
		}
		editingId = null;
	}

	function cancelRename() {
		editingId = null;
	}

	// ── Visibility / lock toggles ───────────────────────────────────────────
	function toggleHidden(block: Block, event: MouseEvent) {
		event.stopPropagation();
		designcanvas.toggleHide(block.id);
		notifyChange();
	}

	function toggleLocked(block: Block, event: MouseEvent) {
		event.stopPropagation();
		designcanvas.toggleLock(block.id);
		notifyChange();
	}

	// ── Context menu ─────────────────────────────────────────────────────────
	function openContextMenu(event: MouseEvent, block: Block) {
		event.preventDefault();
		event.stopPropagation();
		if (!selectedIds.includes(block.id)) {
			selectedIds = [block.id];
			designcanvas.selectedIds = [block.id];
			lastSelectedId = block.id;
		}
		contextMenu = { x: event.clientX, y: event.clientY, blockId: block.id };
	}

	function closeContextMenu() {
		contextMenu = null;
	}

	function copySelected() {
		designcanvas.copySelected();
		closeContextMenu();
	}

	function cutSelected() {
		designcanvas.cutSelected();
		closeContextMenu();
		notifyChange();
	}

	function pasteClipboard() {
		const targetParentId =
			selectedIds.length === 1 ? blocks.find((b) => b.id === selectedIds[0])?.parentId ?? null : null;
		designcanvas.pasteBlock(targetParentId);
		closeContextMenu();
		notifyChange();
	}

	// ── Delete ───────────────────────────────────────────────────────────────
	function deleteSelected() {
		designcanvas.deleteSelected();
		closeContextMenu();
		notifyChange();
	}

	// ── Group / Frame selected ───────────────────────────────────────────────
	function wrapSelected(kind: 'frame' | 'container', name: string) {
		if (kind === 'frame' && name === 'Frame') designcanvas.frameSelected();
		else designcanvas.groupSelected();
		closeContextMenu();
		notifyChange();
	}

	// ── Drag to reorder / reparent ───────────────────────────────────────────
	const rowDrag = $derived(designcanvas.sidebarDrag);

	function rowPointerDown(event: PointerEvent, block: Block) {
		if (block.locked || event.button !== 0 || editingId) return;
		designcanvas.onLayerPointerDown(event, block);
		selectedIds = [...designcanvas.selectedIds];
		lastSelectedId = block.id;
	}

	function rowPointerMove(event: PointerEvent) {
		designcanvas.onLayerPointerMove(event);
	}

	function rowPointerUp(event: PointerEvent) {
		const before = designcanvas.sceneRevision;
		designcanvas.onLayerPointerUp(event);
		if (designcanvas.sceneRevision !== before) {
			notifyChange();
		}
	}
</script>

<div
	class="layer-tree-container"
	role="tree"
	tabindex="0"
	onclick={() => { selectedIds = []; designcanvas.selectedIds = []; closeContextMenu(); }}
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			selectedIds = [];
			designcanvas.selectedIds = [];
			closeContextMenu();
		}
	}}
>
	{#if rows.length === 0}
		<div class="layer-empty">No layers yet.</div>
	{/if}
	{#each rows as row (row.block.id)}
		{@const block = row.block}
		{@const hasChildren = block.children.length > 0}
		<div
			class="layer-row"
			class:selected={selectedIds.includes(block.id)}
			class:is-hidden={block.hidden}
			class:is-locked={block.locked}
			class:drop-before={rowDrag?.targetId === block.id && rowDrag.dropPosition === 'before'}
			class:drop-after={rowDrag?.targetId === block.id && rowDrag.dropPosition === 'after'}
			class:drop-inside={rowDrag?.targetId === block.id && rowDrag.dropPosition === 'inside'}
			role="treeitem"
			aria-selected={selectedIds.includes(block.id)}
			tabindex="0"
			style="padding-left: {8 + row.depth * 16}px"
			data-block-id={block.id}
			onclick={(e) => { e.stopPropagation(); selectRow(block, e); }}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					e.stopPropagation();
					selectRow(block, e);
				}
			}}
			oncontextmenu={(e) => openContextMenu(e, block)}
			onpointerdown={(e) => rowPointerDown(e, block)}
			onpointermove={rowPointerMove}
			onpointerup={rowPointerUp}
			onpointercancel={rowPointerUp}
		>
			{#if hasChildren}
				<button
					type="button"
					class="layer-caret"
					class:collapsed={designcanvas.isCollapsed(block.id)}
					onpointerdown={(e) => e.stopPropagation()}
					onclick={(e) => toggleCollapse(block.id, e)}
					title={designcanvas.isCollapsed(block.id) ? 'Expand' : 'Collapse'}
				>
					<img src="/iconset/chevronDown.svg" alt="" class="icon-svg-xs" />
				</button>
			{:else}
				<span class="layer-caret-spacer"></span>
			{/if}

			<img src="/iconset/{iconFor(block)}" alt="" class="layer-icon" />

			{#if editingId === block.id}
				<input
					bind:this={renameInput}
					class="layer-rename-input"
					bind:value={editingValue}
					onclick={(e) => e.stopPropagation()}
					onpointerdown={(e) => e.stopPropagation()}
					onkeydown={(e) => {
						if (e.key === 'Enter') commitRename();
						else if (e.key === 'Escape') cancelRename();
					}}
					onblur={commitRename}
				/>
			{:else}
				<span
					class="layer-name truncate"
					role="button"
					tabindex="0"
					ondblclick={() => startRename(block)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') startRename(block);
					}}
				>{block.name}</span>
			{/if}

			<div class="layer-row-actions">
				<button type="button" class="layer-action-btn" onpointerdown={(e) => e.stopPropagation()} onclick={(e) => toggleHidden(block, e)} title={block.hidden ? 'Show' : 'Hide'}>
					{#if block.hidden}
						<img src="/iconset/hide.svg" alt="" class="icon-svg-xs" />
					{:else}
						<img src="/iconset/show.svg" alt="" class="icon-svg-xs" />
					{/if}
				</button>
				<button type="button" class="layer-action-btn" onpointerdown={(e) => e.stopPropagation()} onclick={(e) => toggleLocked(block, e)} title={block.locked ? 'Unlock' : 'Lock'}>
					{#if block.locked}
						<img src="/iconset/lock.svg" alt="" class="icon-svg-xs" />
					{:else}
						<img src="/iconset/unlocked.svg" alt="" class="icon-svg-xs" />
					{/if}
				</button>
			</div>
		</div>
	{/each}
</div>

{#if contextMenu}
	{@const menu = contextMenu}
	{@const menuBlock = blocks.find((b) => b.id === menu.blockId)}
	<div
		class="layer-context-backdrop"
		role="presentation"
		onpointerdown={(e) => { e.stopPropagation(); closeContextMenu(); }}
		oncontextmenu={(e) => { e.preventDefault(); e.stopPropagation(); closeContextMenu(); }}
	>
		<div
			class="layer-context-menu"
			role="menu"
			tabindex="-1"
			style="left: {menu.x}px; top: {menu.y}px"
			onpointerdown={(e) => e.stopPropagation()}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			{#if selectedIds.length === 1 && menuBlock}
				<button type="button" onclick={() => startRename(menuBlock)}>Rename</button>
				<div class="layer-context-sep"></div>
			{/if}
			<button type="button" onclick={cutSelected}>Cut</button>
			<button type="button" onclick={copySelected}>Copy</button>
			<button type="button" disabled={!designcanvas.clipboard} onclick={pasteClipboard}>Paste</button>
			<div class="layer-context-sep"></div>
			<button type="button" onclick={() => wrapSelected('frame', 'Group')}>Group Selection</button>
			<button type="button" onclick={() => wrapSelected('frame', 'Frame')}>Frame Selection</button>
			<div class="layer-context-sep"></div>
			<button type="button" class="layer-context-danger" onclick={deleteSelected}>Delete</button>
		</div>
	</div>
{/if}
