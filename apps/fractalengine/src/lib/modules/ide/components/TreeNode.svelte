<script lang="ts">
	import type { FileEntry } from '$lib/ipc';
	import { ideState } from '$lib/state/ide.svelte';
	import { renameFile, deleteFile, duplicateFile, createFile, copyPath } from '$lib/ipc';
	import { contributions } from '$lib/state/contributions.svelte';
	import { MEDIA_EXTENSIONS } from '$lib/modules/media/types';
	import { getFileIcon } from '$lib/modules/ide/fileIcons';
	import { validateLeafName } from '$lib/pathValidation';
	import TreeNodeSelf from './TreeNode.svelte';

	interface Props {
		entries: FileEntry[];
		depth?: number;
	}

	let { entries, depth = 0 }: Props = $props();

	let expandedFolders = $derived(ideState.expandedFolders);
	let expandedFolderPaths = $derived(ideState.expandedFolderPaths);
	let selectedFiles = $derived(ideState.selectedFiles);

	// Flatten entries maintaining order for shift-select
	let flatPaths = $derived.by(() => {
		const out: { path: string; isDir: boolean }[] = [];
		function walk(list: FileEntry[]) {
			for (const e of list) {
				out.push({ path: e.path, isDir: e.isDir });
				if (e.isDir && expandedFolders.includes(e.path) && expandedFolderPaths[e.path]) {
					walk(expandedFolderPaths[e.path]);
				}
			}
		}
		walk(entries);
		return out;
	});

	// ── Context menu state ──
	let ctxMenu = $state<{ x: number; y: number; targetPath: string; isDir: boolean } | null>(null);
	let ctxMenuEl = $state<HTMLDivElement | null>(null);
	let contextTrigger = $state<HTMLElement | null>(null);

	// ── Rename inline state ──
	let renamingPath = $state<string | null>(null);
	let renameValue = $state('');
	let renameInputRef = $state<HTMLInputElement | null>(null);

	// ── New file inline state ──
	let creatingInFolder = $state<string | null>(null);
	let newFileName = $state('');
	let newFileNameRef = $state<HTMLInputElement | null>(null);

	// ── Selection logic ──
	function isSelected(path: string): boolean {
		return selectedFiles.has(path);
	}

	function handleClick(path: string, name: string, isDir: boolean, e: MouseEvent) {
		// If a context menu is open, close it
		ctxMenu = null;

		if (e.metaKey || e.ctrlKey) {
			// Cmd+click: toggle single item
			if (selectedFiles.has(path)) {
				const next = new Set(selectedFiles);
				next.delete(path);
				ideState.selectedFiles = next;
			} else {
				const next = new Set(selectedFiles);
				next.add(path);
				ideState.selectedFiles = next;
			}
			return;
		}

		if (e.shiftKey) {
			// Shift+click: range select from last item or start
			const idx = flatPaths.findIndex(p => p.path === path);
			if (idx === -1) return;

			// Find the last selected item in the flat list as the anchor
			let anchorIdx = 0;
			for (let i = flatPaths.length - 1; i >= 0; i--) {
				if (selectedFiles.has(flatPaths[i].path)) {
					anchorIdx = i;
					break;
				}
			}

			const start = Math.min(anchorIdx, idx);
			const end = Math.max(anchorIdx, idx);
			const next = new Set(selectedFiles);
			for (let i = start; i <= end; i++) {
				next.add(flatPaths[i].path);
			}
			ideState.selectedFiles = next;
			return;
		}

		// Plain click: if clicked item is part of multi-select, keep selection
		if (selectedFiles.size > 1 && selectedFiles.has(path)) {
			// Don't clear selection — let them open the context menu on the group
			return;
		}

		// Else single-select + open
		ideState.selectedFiles = new Set([path]);
		if (!isDir) {
			ideState.openFile(path, name);
		}
	}

	async function handleContextMenu(path: string, isDir: boolean, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		// Cancel any pending new-file or rename
		creatingInFolder = null;
		renamingPath = null;
		// Ensure the clicked item is part of selection
		if (!selectedFiles.has(path)) {
			ideState.selectedFiles = new Set([path]);
		}
		contextTrigger = e.target instanceof HTMLElement ? e.target.closest('button') : null;
		ctxMenu = { x: e.clientX, y: e.clientY, targetPath: path, isDir };
		await tick();
		if (!ctxMenu || !ctxMenuEl) return;
		const rect = ctxMenuEl.getBoundingClientRect();
		ctxMenu = {
			...ctxMenu,
			x: Math.max(8, Math.min(ctxMenu.x, window.innerWidth - rect.width - 8)),
			y: Math.max(8, Math.min(ctxMenu.y, window.innerHeight - rect.height - 8)),
		};
		ctxMenuEl.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
	}

	function closeCtxMenu() {
		ctxMenu = null;
		if (contextTrigger?.isConnected) contextTrigger.focus();
		contextTrigger = null;
	}

	function handleMenuKeydown(e: KeyboardEvent) {
		if (!ctxMenuEl) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			closeCtxMenu();
			return;
		}
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
		e.preventDefault();
		const items = [...ctxMenuEl.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
		if (items.length === 0) return;
		const current = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement));
		const next = e.key === 'Home' ? 0
			: e.key === 'End' ? items.length - 1
			: e.key === 'ArrowDown' ? (current + 1) % items.length
			: (current - 1 + items.length) % items.length;
		items[next].focus();
	}

	function parentPath(path: string): string {
		const index = path.lastIndexOf('/');
		return index <= 0 ? '/' : path.slice(0, index);
	}

	async function refreshParents(paths: string[]) {
		await Promise.all([...new Set(paths.map(parentPath))].map(path => ideState.refreshExplorerFolder(path)));
	}

	// ── Context menu actions ──

	/** Returns the list of paths the action should operate on. */
	function targetPaths(ctxPath: string): string[] {
		if (selectedFiles.has(ctxPath) && selectedFiles.size > 1) {
			return Array.from(selectedFiles);
		}
		return [ctxPath];
	}

	async function handleRenameStart(ctxPath: string) {
		const paths = targetPaths(ctxPath);
		if (paths.length !== 1) return; // Can only rename one at a time
		const name = paths[0].split('/').pop() || '';
		renamingPath = paths[0];
		renameValue = name;
		closeCtxMenu();
		await tick();
		renameInputRef?.focus();
		renameInputRef?.select();
	}

	async function handleRenameCommit() {
		const oldPath = renamingPath;
		renamingPath = null;
		if (!oldPath || !renameValue.trim()) return;
		try {
			const nextName = validateLeafName(renameValue);
			if (nextName === oldPath.split('/').pop()) return;
			await renameFile(oldPath, nextName);
			const newPath = `${parentPath(oldPath)}/${nextName}`.replace('//', '/');
			ideState.reconcileRenamedPath(oldPath, newPath);
			await refreshParents([oldPath]);
		} catch (err: unknown) {
			ideState.addLog(`Rename failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
		}
	}

	function handleRenameCancel() {
		renamingPath = null;
	}

	// ── New file creation ──

	async function handleAddFileStart(folderPath: string) {
		closeCtxMenu();
		creatingInFolder = folderPath;
		newFileName = '';
		// Ensure folder is expanded so user sees the input
		if (!expandedFolders.includes(folderPath)) {
			await ideState.toggleFolderExpanded(folderPath);
		}
		await tick();
		newFileNameRef?.focus();
	}

	async function handleAddFileCommit() {
		const folder = creatingInFolder;
		creatingInFolder = null;
		if (!folder || !newFileName.trim()) return;
		try {
			const filePath = folder + '/' + validateLeafName(newFileName);
			await createFile(filePath, '');
			await ideState.refreshExplorerFolder(folder);
		} catch (err: unknown) {
			ideState.addLog(`Create file failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
		}
	}

	function handleAddFileCancel() {
		creatingInFolder = null;
	}

	async function handleDelete(ctxPath: string) {
		const paths = targetPaths(ctxPath);
		const label = paths.length === 1 ? `"${paths[0].split('/').pop()}"` : `${paths.length} items`;
		if (!confirm(`Delete ${label}?`)) return;
		closeCtxMenu();
		try {
			for (const p of paths) {
				await deleteFile(p);
				ideState.reconcileDeletedPaths([p]);
			}
			await refreshParents(paths);
		} catch (err: unknown) {
			ideState.addLog(`Delete failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
			await refreshParents(paths);
		}
	}

	async function handleDuplicate(ctxPath: string) {
		const paths = targetPaths(ctxPath);
		closeCtxMenu();
		try {
			for (const p of paths) {
				await duplicateFile(p);
			}
			await refreshParents(paths);
		} catch (err: unknown) {
			ideState.addLog(`Duplicate failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
			await refreshParents(paths);
		}
	}

	async function handleCopyPath(ctxPath: string) {
		closeCtxMenu();
		try {
			await navigator.clipboard.writeText(ctxPath);
		} catch (err) {
			ideState.addLog(`Copy path failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
		}
	}

	async function handleCopyRelativePath(ctxPath: string) {
		const root = ideState.rootPath;
		const relative = root ? ctxPath.replace(root + '/', '') : ctxPath;
		closeCtxMenu();
		try {
			await navigator.clipboard.writeText(relative);
		} catch (err) {
			ideState.addLog(`Copy relative path failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
		}
	}

	function handleCopy(ctxPath: string) {
		ideState.clipboardFiles = { action: 'copy', paths: targetPaths(ctxPath) };
		closeCtxMenu();
	}

	function canAddToGallery(path: string, isDir: boolean): boolean {
		if (isDir) return true;
		const extension = path.split('.').at(-1)?.toLowerCase() ?? '';
		return Object.values(MEDIA_EXTENSIONS).some(extensions => extensions.includes(extension));
	}

	async function handleAddToGallery(ctxPath: string): Promise<void> {
		const paths = targetPaths(ctxPath);
		closeCtxMenu();
		try {
			await contributions.run('media.addToGallery', paths);
			ideState.addLog(`Adding ${paths.length} item${paths.length === 1 ? '' : 's'} to fractalMedia.`, 'info');
		} catch (err) {
			ideState.addLog(`Add to Gallery failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
		}
	}

	function handleCut(ctxPath: string) {
		ideState.clipboardFiles = { action: 'cut', paths: targetPaths(ctxPath) };
		// Visual hint: dim the cut files
		closeCtxMenu();
	}

	// Pastes into ctxPath if it's a folder, otherwise into ctxPath's parent folder. copyPath
	// (backed by lib.rs's copy_path) handles both files and directories, so both are supported.
	async function handlePaste(ctxPath: string) {
		const clip = ideState.clipboardFiles;
		if (!clip) return;
		const targetDir = ctxMenu?.isDir ? ctxPath : (ctxPath.slice(0, ctxPath.lastIndexOf('/')) || '/');
		closeCtxMenu();
		try {
			let failed = false;
			for (const sourcePath of clip.paths) {
				const name = sourcePath.split('/').pop();
				if (!name) continue;
				const destPath = `${targetDir}/${name}`;
				if (destPath === sourcePath) continue;
				// Pasting a folder into its own descendant would recurse forever.
				if (destPath.startsWith(sourcePath + '/')) {
					failed = true;
					ideState.addLog(`Paste failed for "${name}": cannot paste a folder into itself`, 'error');
					continue;
				}
				try {
					await copyPath(sourcePath, destPath);
					if (clip.action === 'cut') {
						await deleteFile(sourcePath);
						ideState.reconcileRenamedPath(sourcePath, destPath);
					}
				} catch (err) {
					failed = true;
					ideState.addLog(`Paste failed for "${name}": ${err instanceof Error ? err.message : String(err)}`, 'error');
				}
			}
			if (clip.action === 'cut' && !failed) {
				ideState.clipboardFiles = null;
			}
			await Promise.all([
				ideState.refreshExplorerFolder(targetDir),
				...(clip.action === 'cut' ? [...new Set(clip.paths.map(parentPath))].map(path => ideState.refreshExplorerFolder(path)) : []),
			]);
		} catch (err: unknown) {
			ideState.addLog(`Paste failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
		}
	}

	// Close context menu on Escape (via window listener)
	function onWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeCtxMenu();
	}

	// ── Click-outside for context menu ──
	function onBackdropClick() {
		closeCtxMenu();
	}

	// Tick helper
	function tick(): Promise<void> {
		return new Promise(resolve => requestAnimationFrame(() => resolve()));
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#each entries as entry (entry.path)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="tree-row"
		class:is-selected={isSelected(entry.path)}
		style="padding-left: {depth * 16 + 4}px"
		oncontextmenu={(e) => handleContextMenu(entry.path, entry.isDir, e)}
	>
		{#if renamingPath === entry.path}
			<div class={entry.isDir ? 'tree-folder-btn' : 'tree-file-btn'}>
				<img
					src={entry.isDir
						? (expandedFolders.includes(entry.path) ? '/icontheme-allicon/folderOpen.svg' : '/icontheme-allicon/folderClosed.svg')
						: getFileIcon(entry.name)}
					alt=""
					class="icon-svg-sm"
				/>
				<input
					bind:this={renameInputRef}
					type="text"
					aria-label="Rename {entry.name}"
					bind:value={renameValue}
					onblur={handleRenameCommit}
					onkeydown={(e) => { if (e.key === 'Enter') handleRenameCommit(); else if (e.key === 'Escape') handleRenameCancel(); }}
					class="tree-rename-input"
				/>
			</div>
		{:else if entry.isDir}
			<button
					class="tree-folder-btn"
					disabled={ideState.isWorkspaceInitializing}
				onclick={(e) => {
					if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
						handleClick(entry.path, entry.name, entry.isDir, e);
						ideState.toggleFolderExpanded(entry.path);
					} else {
						handleClick(entry.path, entry.name, entry.isDir, e);
					}
				}}
				title={expandedFolders.includes(entry.path) ? 'Collapse' : 'Expand'}
				oncontextmenu={(e) => handleContextMenu(entry.path, entry.isDir, e)}
			>
				{#if expandedFolders.includes(entry.path)}
				<img src="/icontheme-allicon/folderOpen.svg" class="icon-svg-sm" alt="Folder Open"/>
				{:else}
				<img src="/icontheme-allicon/folderClosed.svg" class="icon-svg-sm" alt="Folder Closed"/>
				{/if}
				<span class="text-item truncate">{entry.name}</span>
			</button>
		{:else}
			<button
					class="tree-file-btn"
					disabled={ideState.isWorkspaceInitializing}
				onclick={(e) => handleClick(entry.path, entry.name, entry.isDir, e)}
				oncontextmenu={(e) => handleContextMenu(entry.path, entry.isDir, e)}
			>
				<img
					src={getFileIcon(entry.name)}
					alt=""
					class="icon-svg-sm"
				/>
				<span class="text-item truncate">{entry.name}</span>
			</button>
		{/if}
	</div>
	{#if entry.isDir && expandedFolders.includes(entry.path)}
		{#if expandedFolderPaths[entry.path]}
			<TreeNodeSelf entries={expandedFolderPaths[entry.path]} depth={depth + 1} />
			{#if creatingInFolder === entry.path}
				<div class="tree-row" style="padding-left: {(depth + 1) * 16 + 4}px">
					<span class="tree-new-file-indent"></span>
					<input
						bind:this={newFileNameRef}
						type="text"
						placeholder="filename.ext"
						bind:value={newFileName}
						onblur={handleAddFileCommit}
						onkeydown={(e) => { if (e.key === 'Enter') handleAddFileCommit(); else if (e.key === 'Escape') handleAddFileCancel(); }}
						class="tree-rename-input"
					/>
				</div>
			{/if}
		{:else}
			<div class="tree-row tree-loading" style="padding-left: {depth * 16 + 28}px">
				<span class="text-item">Loading...</span>
			</div>
		{/if}
	{/if}
{/each}

<!-- Context menu overlay -->
{#if ctxMenu}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="ctx-backdrop" onclick={onBackdropClick} oncontextmenu={(e) => e.preventDefault()} role="none"></div>
	<div
		bind:this={ctxMenuEl}
		class="ctx-menu"
		role="menu"
		tabindex="-1"
		style="left: {ctxMenu.x}px; top: {ctxMenu.y}px"
		onclick={(e) => e.stopPropagation()}
		onkeydown={handleMenuKeydown}
	>
		{#if ctxMenu.isDir}
			<button class="ctx-item" role="menuitem" onclick={() => handleAddFileStart(ctxMenu!.targetPath)}>
				<img class="ctx-icon icon-svg-sm" src="/iconset/fileUnread.svg" alt="" /> Add File
			</button>
			<div class="ctx-separator" role="separator"></div>
		{/if}
		<button class="ctx-item" role="menuitem" onclick={() => handleRenameStart(ctxMenu!.targetPath)}>
			<img class="ctx-icon icon-svg-sm" src="/iconset/edit.svg" alt="" /> Rename
		</button>
		<button class="ctx-item" role="menuitem" onclick={() => handleCopy(ctxMenu!.targetPath)}>
			<img class="ctx-icon icon-svg-sm" src="/iconset/copy.svg" alt="" /> Copy
		</button>
		<button class="ctx-item" role="menuitem" onclick={() => handleCut(ctxMenu!.targetPath)}>
			<img class="ctx-icon icon-svg-sm" src="/iconset/cut.svg" alt="" /> Cut
		</button>
		{#if ideState.clipboardFiles}
			<button class="ctx-item" role="menuitem" onclick={() => handlePaste(ctxMenu!.targetPath)}>
				<img class="ctx-icon icon-svg-sm" src="/iconset/paste.svg" alt="" /> Paste
			</button>
		{/if}
		<div class="ctx-separator" role="separator"></div>
		{#if canAddToGallery(ctxMenu.targetPath, ctxMenu.isDir)}
			<button class="ctx-item" role="menuitem" onclick={() => void handleAddToGallery(ctxMenu!.targetPath)}>
				<img class="ctx-icon icon-svg-sm" src="/iconset/add.svg" alt="" /> Add to Gallery
			</button>
			<div class="ctx-separator" role="separator"></div>
		{/if}
		<button class="ctx-item" role="menuitem" onclick={() => handleDuplicate(ctxMenu!.targetPath)}>
			<img class="ctx-icon icon-svg-sm" src="/iconset/copyOfFolder.svg" alt="" /> Duplicate
		</button>
		<div class="ctx-separator" role="separator"></div>
		<button class="ctx-item" role="menuitem" onclick={() => handleCopyPath(ctxMenu!.targetPath)}>
			<img class="ctx-icon icon-svg-sm" src="/iconset/link.svg" alt="" /> Copy Path
		</button>
		<button class="ctx-item" role="menuitem" onclick={() => handleCopyRelativePath(ctxMenu!.targetPath)}>
			<img class="ctx-icon icon-svg-sm" src="/iconset/link.svg" alt="" /> Copy Relative Path
		</button>
		<div class="ctx-separator" role="separator"></div>
		<button class="ctx-item ctx-danger" role="menuitem" onclick={() => handleDelete(ctxMenu!.targetPath)}>
			<img class="ctx-icon icon-svg-sm" src="/iconset/delete.svg" alt="" /> Delete
		</button>
	</div>
{/if}
