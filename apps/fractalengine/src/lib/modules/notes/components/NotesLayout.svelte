<script lang="ts">
	// Dedicated Markdown Notes & Wiki workspace layout with draggable resizing
	import NotesSidebar1 from "./NotesSidebar1.svelte";
	import NotesSidebar2 from "./NotesSidebar2.svelte";
	import NotesEditor from "./NotesEditor.svelte";
	import AIChat from "$lib/components/AIChat.svelte";
	import { notes } from "$lib/modules/notes/state/notes.svelte";
	import { slide } from "svelte/transition";
	import { quadIn, quadOut } from "svelte/easing";
	import { onDestroy } from "svelte";

	// ── Sidebar widths & editor split ratio ──
	let containerEl = $state<HTMLElement | null>(null);

	const SIDEBAR1 = { min: 50, max: 480 };
	const SIDEBAR2 = { min: 120, max: 780 };
	const SIDEBAR3 = { min: 200, max: 780 };

	// ── Unified resize state machine ──
	// Any handle (sidebar1, sidebar2, sidebar3, editor-split) sets `resizing` on
	// pointerdown, then drag updates happen via window-level pointermove so the
	// move events fire even after the cursor leaves the narrow handle hit area.
	type Resizing =
		| "sidebar1"
		| "sidebar2"
		| "sidebar3"
		| "editor-split"
		| null;
	let resizing = $state<Resizing>(null);

	function startResize(which: Exclude<Resizing, null>, e: PointerEvent) {
		e.preventDefault();
		notes.beginLayoutGesture();
		resizing = which;
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", endResize);
		window.addEventListener("pointercancel", endResize);
	}

	function endResize() {
		notes.endLayoutGesture();
		resizing = null;
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", endResize);
		window.removeEventListener("pointercancel", endResize);
	}

	function resizeWithKeyboard(which: Exclude<Resizing, null>, e: KeyboardEvent) {
		if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
		e.preventDefault();
		const direction = e.key === 'ArrowRight' ? 1 : -1;
		notes.pushUndo();
		if (which === 'sidebar1') notes.setSidebarWidth('sidebar1', clamp(notes.sidebar1Expanded + direction * 10, SIDEBAR1));
		else if (which === 'sidebar2') notes.setSidebarWidth('sidebar2', clamp(notes.sidebar2Expanded + direction * 10, SIDEBAR2));
		else if (which === 'sidebar3') notes.setSidebarWidth('sidebar3', clamp(notes.sidebar3Expanded - direction * 10, SIDEBAR3));
		else notes.setEditorSplitRatio(notes.editorSplitRatio + direction * 2);
	}

	function onPointerMove(e: PointerEvent) {
		if (!resizing || !containerEl) return;
		const rect = containerEl.getBoundingClientRect();

		if (resizing === "sidebar1") {
			// Drag handle on the right edge of the LEFT panel.
			// Width = cursor's distance from the wrapper's left edge.
			const w = e.clientX - rect.left;
			notes.setSidebarWidth("sidebar1", clamp(w, SIDEBAR1));
		} else if (resizing === "sidebar2") {
			// Drag handle on the right edge of the MIDDLE panel.
			// sidebar1's right edge sits at rect.left + sidebar1, so sidebar2's
			// width is cursor.x minus that boundary.
			const w = e.clientX - rect.left - notes.sidebar1Expanded;
			notes.setSidebarWidth("sidebar2", clamp(w, SIDEBAR2));
		} else if (resizing === "sidebar3") {
			// Drag handle on the left edge of the RIGHT panel.
			// Width = wrapper's right edge minus cursor.x.
			const w = rect.right - e.clientX;
			notes.setSidebarWidth("sidebar3", clamp(w, SIDEBAR3));
		} else if (resizing === "editor-split") {
			// Drag handle inside the editor slot — compute ratio relative to the
			// editor slot (not the whole wrapper), so the editor width doesn't
			// depend on the sidebars.
			const slot = containerEl.querySelector(
				".notes-editor-slot",
			) as HTMLElement | null;
			if (slot) {
				const slotRect = slot.getBoundingClientRect();
				if (slotRect.width > 0) {
					const ratio = ((e.clientX - slotRect.left) / slotRect.width) * 100;
					notes.setEditorSplitRatio(ratio);
				}
			}
		}
	}

	function clamp(w: number, range: { min: number; max: number }): number {
		return Math.min(range.max, Math.max(range.min, w));
	}

	// Cleanup window listeners on unmount.
	onDestroy(() => {
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", endResize);
		window.removeEventListener("pointercancel", endResize);
	});

	// ── File list state (per-vault-root) ──
	interface MdFile {
		name: string;
		path: string;
		description?: string;
	}

	// ── Persisted open-note path. Restored on mount so the same note stays open
	//    across browser reloads and full app restarts. The file content is re-read
	//    from disk on restore (disk is the source of truth).
	let openNoteRestored = false;

	// Restore once the vault is loaded. Guards against the vault restoration in
	// `ideState.initWorkspace()` being async — if the vault hasn't populated yet,
	// we wait. Only restores if the saved path is within the current vault.
	$effect(() => {
		if (openNoteRestored) return;
		const roots = notes.currentVaultRoots;
		if (roots.length === 0) return;
		openNoteRestored = true;
		const savedPath = notes.selectedFilePath;
		if (!savedPath) return;

		const isInVault = roots.some(
			(r) =>
				savedPath === r.path || savedPath.startsWith(r.path + "/"),
		);
		if (!isInVault) {
			notes.selectedFilePath = "";
			notes.persistOpenFilePath();
			return;
		}

		void notes.openFile(savedPath).then((opened) => {
			if (opened) return;
			notes.selectedFilePath = "";
			notes.persistOpenFilePath();
		});
	});

	// ── Derive the markdown file list for the currently-selected vault folder. ──
	let selectedFolderFiles = $derived.by<MdFile[]>(() => {
		const folderPath = notes.vaultSelectedFolderPath;
		if (!folderPath) return [];
		const entries =
			notes.vaultExpandedFolderPaths[folderPath] ??
			notes.currentVaultTrees[folderPath] ??
			[];
		return entries
			.filter((e) => !e.isDir && e.name.toLowerCase().endsWith(".md"))
			.map((e) => ({
				name: e.name,
				path: e.path,
				description: e.name.replace(/\.md$/i, "").replace(/[-_]/g, " "),
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	// ── Selected folder label for sidebar2 header. ──
	let selectedFolderLabel = $derived.by<string>(() => {
		const folderPath = notes.vaultSelectedFolderPath;
		if (!folderPath) return "";
		// Prefer the label from the vault root if the folder is exactly a root.
		const root = notes.currentVaultRoots.find(
			(r) => r.path === folderPath,
		);
		if (root) return root.label;
		// Otherwise show the folder's basename.
		return folderPath.split("/").filter(Boolean).pop() ?? folderPath;
	});

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="module-wrapper"
	class:resizing={resizing !== null}
	bind:this={containerEl}
>
	{#if !notes.sidebar1Collapsed}
		<div
			class="module-sidebar box notes-sidebar1"
			style="width: {notes.sidebar1Expanded}px"
			in:slide={{ axis: "x", easing: quadOut, duration: 200 }} out:slide={{ axis: "x", easing: quadIn }}
		>
			<NotesSidebar1 />
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="resize-handle-v handle-sidebar-left"
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize left sidebar"
				aria-valuemin={SIDEBAR1.min}
				aria-valuemax={SIDEBAR1.max}
				aria-valuenow={notes.sidebar1Expanded}
				tabindex="0"
				title="Drag to resize"
				onpointerdown={(e) => startResize("sidebar1", e)}
				onkeydown={(e) => resizeWithKeyboard('sidebar1', e)}
			></div>
		</div>
	{/if}

	<!-- Sidebar 2: Markdown file list for the selected folder -->
	{#if !notes.sidebar2Collapsed}
		<div
			class="notes-sidebar2 module-sidebar box"
			style="width: {notes.sidebar2Expanded}px"
			in:slide={{ axis: "x", easing: quadOut, duration: 200 }}
			out:slide={{ axis: "x", easing: quadIn }}
		>
			<NotesSidebar2
				files={selectedFolderFiles}
				selectedFilePath={notes.selectedFilePath}
				{selectedFolderLabel}
				onFileSelect={(path: string) => notes.openFile(path)}
				onCreateNote={(name: string) => notes.createNote(notes.vaultSelectedFolderPath ?? '', name)}
			/>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="resize-handle-v handle-sidebar-left"
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize middle sidebar"
				aria-valuemin={SIDEBAR2.min}
				aria-valuemax={SIDEBAR2.max}
				aria-valuenow={notes.sidebar2Expanded}
				tabindex="0"
				title="Drag to resize"
				onpointerdown={(e) => startResize("sidebar2", e)}
				onkeydown={(e) => resizeWithKeyboard('sidebar2', e)}
			></div>
		</div>
	{/if}
	<!-- Editor: Split pane raw + rich -->
	<div class="module-central notes-editor-slot">
		<div class="central-carrier">
		{#if notes.loadError}
			<div class="notes-save-status is-error" role="alert">
				<span>{notes.loadError}</span>
			</div>
		{/if}
		{#if notes.saveStatus === 'dirty' || notes.saveStatus === 'saving' || notes.saveStatus === 'error'}
			<div class="notes-save-status" class:is-error={notes.saveStatus === 'error'} role={notes.saveStatus === 'error' ? 'alert' : 'status'}>
				<span>{notes.saveStatus === 'error' ? notes.saveError : notes.saveStatus === 'saving' ? 'Saving note…' : 'Unsaved changes'}</span>
				{#if notes.saveStatus === 'error'}
					<button type="button" class="btn-app" onclick={() => notes.retryPendingSave()}>Retry</button>
				{/if}
			</div>
		{/if}
		<NotesEditor
			content={notes.rawContent}
			fileName={notes.selectedFilePath.split("/").pop() ?? ""}
			onContentUpdate={(md: string) => notes.handleContentUpdate(md)}
			splitRatio={notes.editorSplitRatio}
				onSplitResize={(e: PointerEvent) => startResize("editor-split", e)}
				onSplitKeydown={(e: KeyboardEvent) => resizeWithKeyboard('editor-split', e)}
				hasVault={notes.currentVaultRoots.length > 0}
				canCreateNote={Boolean(notes.vaultSelectedFolderPath)}
				onOpenVault={() => notes.openVaultFromFolder()}
				onCreateNote={() => window.dispatchEvent(new CustomEvent('fractalnotes:new-note'))}
		/>
		</div>
	</div>

	<!-- Sidebar 3: AI Chat / Models / Skills with resize handle -->
	{#if !notes.sidebar3Collapsed}
		<div
			class="module-sidebar box notes-sidebar3"
			style="width: {notes.sidebar3Expanded}px"
			in:slide={{ axis: "x", easing: quadOut, duration: 200 }}
			out:slide={{ axis: "x", easing: quadIn }}
		>
			<div class="sidebar-carrier">
				<div class="sidebar-content">
<AIChat />
				</div>
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="resize-handle-v handle-sidebar-right"
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize right sidebar"
				aria-valuemin={SIDEBAR3.min}
				aria-valuemax={SIDEBAR3.max}
				aria-valuenow={notes.sidebar3Expanded}
				tabindex="0"
				title="Drag to resize"
				onpointerdown={(e) => startResize("sidebar3", e)}
				onkeydown={(e) => resizeWithKeyboard('sidebar3', e)}
			></div>
		</div>
	{/if}
</div>

{#if notes.pendingVaultAccessPath}
	<div class="notes-access-request-overlay">
		<div class="notes-access-request" role="dialog" aria-modal="true" aria-labelledby="notes-access-request-title">
			<h2 id="notes-access-request-title">Grant folder access</h2>
			<p>
				The saved vault needs permission to read <code>{notes.pendingVaultAccessPath}</code>.
			</p>
			<p class="notes-access-request-hint">
				Choose this folder or one of its parent folders in the native picker. FractalEngine will only access folders you explicitly select.
			</p>
			<div class="notes-access-request-actions">
				<button class="btn-app" onclick={() => notes.grantPendingVaultAccess()}>Choose folder…</button>
				<button class="btn-text" onclick={() => notes.cancelPendingVaultAccess()}>Not now</button>
			</div>
		</div>
	</div>
{/if}
