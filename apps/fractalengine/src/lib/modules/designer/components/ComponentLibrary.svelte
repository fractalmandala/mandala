<script lang="ts">
	// designcanvas/ComponentLibrary
	//
	// Sidebar tab listing everything the user can drag into the canvas:
	//
	//   1. Built-in templates    (Hero / Auth / Bento / Pricing / Nav /
	//                             Footer — from `designtemplates.ts`)
	//   2. Layout primitives     (Flexbox / Grid / Text — CSS classes
	//                             defined in `_designblock.sass`,
	//                             applied via `props.layoutClass`)
	//   3. User components       (saved subtrees, persisted to localStorage,
	//                             editable inline via rename / duplicate /
	//                             delete)
	//
	// Drag payload schema (see DesignLayout.handleLibraryDrop):
	//   { kind: 'template',         templateId }
	//   { kind: 'user-component',   componentId }
	//   { kind: 'layout-primitive', className, name? }
	//
	// "Save selection as component" captures the currently selected block
	// subtree (or, if nothing is selected, the entire canvas) and stores a
	// deep clone in `designcanvas.userComponents`.

	import { designcanvas, type UserComponent } from '$lib/modules/designer/state/designcanvas.svelte';
	import type { DesignBlock } from '$lib/modules/designer/engine/designtypes';
	import { TEMPLATES, componentTypes } from '$lib/modules/designer/data/designtemplates';
	import { tick, onDestroy } from 'svelte';

	type Section = 'templates' | 'primitives' | 'user';
	let openSection = $state<Section>('templates');

	// ── Save selection as component ────────────────────────────────────────
	let showSaveInput = $state(false);
	let saveName = $state('');
	let saveInputEl = $state<HTMLInputElement | null>(null);
	let saveFlash = $state(false);
	let saveFlashTimer: ReturnType<typeof setTimeout> | null = null;

	async function openSaveInput() {
		saveName = '';
		showSaveInput = true;
		await tick();
		saveInputEl?.focus();
	}

	function cancelSave() {
		showSaveInput = false;
		saveName = '';
	}

	function commitSave() {
		const name = saveName.trim();
		if (!name) {
			cancelSave();
			return;
		}
		const blocks = selectedSubtree();
		if (blocks.length === 0) {
			cancelSave();
			return;
		}
		designcanvas.saveUserComponent(name, blocks);
		cancelSave();
		// Flash a confirmation in the User Components section header so the
		// user knows where the new entry landed.
		openSection = 'user';
		flashSaved();
	}

	function flashSaved() {
		saveFlash = true;
		if (saveFlashTimer) clearTimeout(saveFlashTimer);
		saveFlashTimer = setTimeout(() => (saveFlash = false), 1500);
	}

	// Clear any pending flash timer when the component unmounts so the
	// callback can't fire on a destroyed state.
	onDestroy(() => {
		if (saveFlashTimer) clearTimeout(saveFlashTimer);
	});

	// Snapshot the selected block + every descendant. Falls back to the
	// whole canvas when nothing is selected. Re-roots children whose parent
	// isn't in the selection so the saved subtree is self-contained.
	function selectedSubtree(): DesignBlock[] {
		const ids = designcanvas.selectedIds.filter((id) =>
			designcanvas.items.some((b) => b.id === id)
		);
		const items = designcanvas.items;
		const byId = new Map(items.map((b) => [b.id, b]));

		let seedIds: string[];
		if (ids.length > 0) {
			// BFS DOWN through children so the user gets a meaningful chunk
			// even if they only picked a single leaf.
			const visited = new Set<string>(ids);
			const queue = [...ids];
			while (queue.length > 0) {
				const cur = queue.shift()!;
				const block = byId.get(cur);
				if (!block) continue;
				for (const childId of block.children) {
					if (!visited.has(childId) && byId.has(childId)) {
						visited.add(childId);
						queue.push(childId);
					}
				}
			}
			// Walk UP through ancestors so the saved component retains its
			// visual hierarchy. Without this pass, selecting a nested leaf
			// would orphan it on `parentId: null` when re-inserted and lose
			// the parent frame/container it lived in.
			for (const id of Array.from(visited)) {
				let cursor: string | null = byId.get(id)?.parentId ?? null;
				while (cursor && byId.has(cursor) && !visited.has(cursor)) {
					visited.add(cursor);
					cursor = byId.get(cursor)!.parentId;
				}
			}
			seedIds = Array.from(visited);
		} else {
			// No selection — save the entire canvas. Roots are items with
			// `parentId === null` so we don't drop nested children when
			// their parent was already captured.
			seedIds = items.map((b) => b.id);
		}

		// For the saved entry to be self-contained, every captured block's
		// parent must either be captured too, or we re-parent the block to
		// null. The latter loses visual structure; we prefer capturing
		// whole subtrees from a root when the user only selected a fragment.
		const captured = new Set(seedIds);
		const result: DesignBlock[] = [];
		for (const id of seedIds) {
			const block = byId.get(id);
			if (!block) continue;
			const cloned: DesignBlock = JSON.parse(JSON.stringify(block));
			if (cloned.parentId && !captured.has(cloned.parentId)) {
				cloned.parentId = null;
			}
			result.push(cloned);
		}
		return result;
	}

	// ── Pointer drop helpers ──────────────────────────────────────────────
	type LibraryPayload =
		| { kind: 'template'; templateId: string }
		| { kind: 'user-component'; componentId: string }
		| { kind: 'layout-primitive'; className: string; name?: string };

	let pointerDrag = $state<{ payload: LibraryPayload; pointerId: number } | null>(null);

	function startPointerDrag(event: PointerEvent, payload: LibraryPayload) {
		if (event.button !== 0) return;
		// Library insertion uses one pointer-captured path instead of racing the
		// browser's native HTML drag implementation. WebKit can fire `dragstart`
		// for a draggable button, cancel the pointer sequence, then omit `drop` on
		// the Tauri webview; that left the canvas unchanged. Pointer capture keeps
		// the terminal coordinates with this card until we can create the block.
		event.preventDefault();
		pointerDrag = { payload, pointerId: event.pointerId };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function finishPointerDrag(event: PointerEvent) {
		const active = pointerDrag;
		pointerDrag = null;
		if (!active || active.pointerId !== event.pointerId) return;
		const viewport = document.querySelector<HTMLElement>('.design-viewport');
		if (!viewport) return;
		const rect = viewport.getBoundingClientRect();
		if (
			event.clientX < rect.left || event.clientX > rect.right ||
			event.clientY < rect.top || event.clientY > rect.bottom
		) return;

		const target = designcanvas.screenToCanvas(event.clientX, event.clientY);
		const payload = active.payload;
		if (payload.kind === 'template') {
			const template = TEMPLATES.find((item) => item.id === payload.templateId);
			if (template) designcanvas.insertTemplate(template.blocks, { target });
		} else if (payload.kind === 'user-component') {
			designcanvas.insertUserComponent(payload.componentId, { target });
		} else {
			designcanvas.createBlockFromPrimitive({
				className: payload.className,
				name: payload.name,
				x: target.x,
				y: target.y
			});
		}
	}

	function cancelPointerDrag() {
		pointerDrag = null;
	}

	// ── User component mutations ──────────────────────────────────────────
	let renamingId = $state<string | null>(null);
	let renameValue = $state('');
	let renameInputEl = $state<HTMLInputElement | null>(null);

	async function beginRename(c: UserComponent) {
		renamingId = c.id;
		renameValue = c.name;
		await tick();
		renameInputEl?.focus();
		renameInputEl?.select();
	}

	function commitRename() {
		if (renamingId && renameValue.trim()) {
			designcanvas.renameUserComponent(renamingId, renameValue.trim());
		}
		renamingId = null;
	}

	function cancelRename() {
		renamingId = null;
	}

	function onRenameKey(event: KeyboardEvent) {
		if (event.key === 'Enter') commitRename();
		else if (event.key === 'Escape') cancelRename();
	}

	function deleteComponent(id: string) {
		designcanvas.deleteUserComponent(id);
	}

	function duplicateComponent(id: string) {
		designcanvas.duplicateUserComponent(id);
	}

	// Sort user components newest-first; built-ins stay in their declared order.
	const userComponents = $derived(
		[...designcanvas.userComponents].sort((a, b) => b.updatedAt - a.updatedAt)
	);

	const selectionCount = $derived(designcanvas.selectedIds.length);
</script>

<div class="component-library-root">
	<!-- ── Save bar ──────────────────────────────────────────────────── -->
	<div class="library-save-bar">
		{#if !showSaveInput}
			<button type="button" class="library-save-btn" onclick={openSaveInput}>
				<img src="/iconset/save.svg" alt="" class="icon-svg-sm" />
				<span>
					{selectionCount > 0
						? `Save ${selectionCount} selected as component`
						: 'Save canvas as component'}
				</span>
			</button>
		{:else}
			<input
				bind:this={saveInputEl}
				class="library-save-input"
				bind:value={saveName}
				placeholder="Component name…"
				onkeydown={(e) => {
					if (e.key === 'Enter') commitSave();
					else if (e.key === 'Escape') cancelSave();
				}}
				onblur={commitSave}
			/>
		{/if}
	</div>

	<!-- ── Section: Built-in templates ───────────────────────────────── -->
	<button
		type="button"
		class="library-section-header"
		aria-expanded={openSection === 'templates'}
		onclick={() => (openSection = openSection === 'templates' ? 'primitives' : 'templates')}
	>
		<span>TEMPLATES</span>
		<img src="/iconset/chevronDown.svg" alt="" class="icon-svg-xs" class:open={openSection === 'templates'} />
	</button>
	{#if openSection === 'templates'}
		<div class="library-grid">
			{#each TEMPLATES as tpl (tpl.id)}
				<button
					type="button"
					class="library-card"
					onpointerdown={(e) => startPointerDrag(e, { kind: 'template', templateId: tpl.id })}
					onpointerup={finishPointerDrag}
					onpointercancel={cancelPointerDrag}
					title={tpl.description}
				>
					<span class="library-card-thumb" aria-hidden="true">
						<img src="/iconset/template.svg" alt="" />
					</span>
					<span class="library-card-meta">
						<span class="library-card-name">{tpl.name}</span>
						<span class="library-card-cat">{tpl.category}</span>
					</span>
				</button>
			{/each}
		</div>
	{/if}

	<!-- ── Section: Layout primitives ────────────────────────────────── -->
	<button
		type="button"
		class="library-section-header"
		aria-expanded={openSection === 'primitives'}
		onclick={() => (openSection = openSection === 'primitives' ? 'user' : 'primitives')}
	>
		<span>PRIMITIVES</span>
		<img src="/iconset/chevronDown.svg" alt="" class="icon-svg-xs" class:open={openSection === 'primitives'} />
	</button>
	{#if openSection === 'primitives'}
		<div class="library-grid">
			{#each componentTypes as c (c.name)}
				<button
					type="button"
					class="library-card"
					onpointerdown={(e) => startPointerDrag(e, { kind: 'layout-primitive', className: c.class, name: c.name })}
					onpointerup={finishPointerDrag}
					onpointercancel={cancelPointerDrag}
					title={`Drag to add a ${c.name} block`}
				>
					<span class="library-card-icon" aria-hidden="true">
						<img src="/iconset/{c.icon}" alt="" />
					</span>
					<span class="library-card-meta">
						<span class="library-card-name">{c.name}</span>
						<span class="library-card-cat">{c.class}</span>
					</span>
				</button>
			{/each}
		</div>
	{/if}

	<!-- ── Section: User components ──────────────────────────────────── -->
	<button
		type="button"
		class="library-section-header"
		aria-expanded={openSection === 'user'}
		onclick={() => (openSection = openSection === 'user' ? 'templates' : 'user')}
	>
		<span>
			MY COMPONENTS
			<span class="library-section-count">{userComponents.length}</span>
			{#if saveFlash}
				<span class="library-save-flash">· Saved!</span>
			{/if}
		</span>
		<img src="/iconset/chevronDown.svg" alt="" class="icon-svg-xs" class:open={openSection === 'user'} />
	</button>
	{#if openSection === 'user'}
		{#if userComponents.length === 0}
			<div class="library-empty">
				No saved components yet. Select blocks on the canvas and click
				<strong>Save</strong> above to capture them as a reusable component.
			</div>
		{:else}
			<div class="library-list">
				{#each userComponents as c (c.id)}
					<div class="library-row">
						{#if renamingId === c.id}
							<input
								bind:this={renameInputEl}
								class="library-row-rename-input"
								bind:value={renameValue}
								onkeydown={onRenameKey}
								onblur={commitRename}
							/>
						{:else}
						<button
							type="button"
							class="library-row-drag"
							onpointerdown={(e) => startPointerDrag(e, { kind: 'user-component', componentId: c.id })}
							onpointerup={finishPointerDrag}
							onpointercancel={cancelPointerDrag}
							title={`Drag ${c.name} to the canvas`}
						>
							<span class="library-row-name">{c.name}</span>
							<span class="library-row-meta">
								{c.blocks.length} block{c.blocks.length === 1 ? '' : 's'}
							</span>
						</button>
						{/if}
						<div class="library-row-actions">
							<button type="button" class="library-row-btn" title="Rename" onclick={() => beginRename(c)} aria-label="Rename component">
								<img src="/iconset/edit.svg" alt="" class="icon-svg-xs" />
							</button>
							<button type="button" class="library-row-btn" title="Duplicate" onclick={() => duplicateComponent(c.id)} aria-label="Duplicate component">
								<img src="/iconset/copy.svg" alt="" class="icon-svg-xs" />
							</button>
							<button type="button" class="library-row-btn library-row-btn-danger" title="Delete" onclick={() => deleteComponent(c.id)} aria-label="Delete component">
								<img src="/iconset/delete.svg" alt="" class="icon-svg-xs" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
