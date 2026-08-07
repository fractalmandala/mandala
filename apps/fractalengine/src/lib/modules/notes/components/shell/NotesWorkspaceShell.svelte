<script lang="ts">
	import WorkspaceShell from '$lib/components/shell/WorkspaceShell.svelte';
	import NotesSidebar1 from '../NotesSidebar1.svelte';
	import NotesSidebar2 from '../NotesSidebar2.svelte';
	import NotesEditor from '../NotesEditor.svelte';
	import AIChat from '$lib/components/AIChat.svelte';
	import { notes } from '$lib/modules/notes/state/notes.svelte';
	import { onDestroy } from 'svelte';

	interface MdFile {
		name: string;
		path: string;
		description?: string;
	}

	let openNoteRestored = $state(false);
	let editorResizeActive = $state(false);

	function beginEditorResize(event: PointerEvent): void {
		event.preventDefault();
		editorResizeActive = true;
		notes.beginLayoutGesture();
		window.addEventListener('pointermove', resizeEditor);
		window.addEventListener('pointerup', endEditorResize);
		window.addEventListener('pointercancel', endEditorResize);
	}

	function resizeEditor(event: PointerEvent): void {
		if (!editorResizeActive) return;
		const slot = document.querySelector('.notes-shell-editor') as HTMLElement | null;
		if (!slot) return;
		const rect = slot.getBoundingClientRect();
		if (rect.width <= 0) return;
		notes.setEditorSplitRatio(((event.clientX - rect.left) / rect.width) * 100);
	}

	function endEditorResize(): void {
		if (!editorResizeActive) return;
		editorResizeActive = false;
		notes.endLayoutGesture();
		window.removeEventListener('pointermove', resizeEditor);
		window.removeEventListener('pointerup', endEditorResize);
		window.removeEventListener('pointercancel', endEditorResize);
	}

	function resizeEditorWithKeyboard(event: KeyboardEvent): void {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		notes.pushUndo();
		notes.setEditorSplitRatio(notes.editorSplitRatio + (event.key === 'ArrowRight' ? 2 : -2));
	}

	onDestroy(endEditorResize);
	let selectedFolderFiles = $derived.by<MdFile[]>(() => {
		const folderPath = notes.vaultSelectedFolderPath;
		if (!folderPath) return [];
		const entries = notes.vaultExpandedFolderPaths[folderPath] ?? notes.currentVaultTrees[folderPath] ?? [];
		return entries
			.filter((entry) => !entry.isDir && entry.name.toLowerCase().endsWith('.md'))
			.map((entry) => ({
				name: entry.name,
				path: entry.path,
				description: entry.name.replace(/\.md$/i, '').replace(/[-_]/g, ' ')
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	});
	let selectedFolderLabel = $derived.by(() => {
		const folderPath = notes.vaultSelectedFolderPath;
		if (!folderPath) return '';
		return notes.currentVaultRoots.find((root) => root.path === folderPath)?.label
			?? folderPath.split('/').filter(Boolean).pop()
			?? folderPath;
	});

	$effect(() => {
		if (openNoteRestored || notes.currentVaultRoots.length === 0) return;
		openNoteRestored = true;
		const savedPath = notes.selectedFilePath;
		if (!savedPath) return;
		const isInVault = notes.currentVaultRoots.some((root) => savedPath === root.path || savedPath.startsWith(`${root.path}/`));
		if (!isInVault) {
			notes.selectedFilePath = '';
			notes.persistOpenFilePath();
			return;
		}
		void notes.openFile(savedPath).then((opened) => {
			if (opened) return;
			notes.selectedFilePath = '';
			notes.persistOpenFilePath();
		});
	});
</script>

<WorkspaceShell profile="notes">
	{#snippet left()}
		<NotesSidebar1 />
	{/snippet}
	{#snippet leftSecondary()}
		<NotesSidebar2
			files={selectedFolderFiles}
			selectedFilePath={notes.selectedFilePath}
			{selectedFolderLabel}
			onFileSelect={(path) => notes.openFile(path)}
			onCreateNote={(name) => notes.createNote(notes.vaultSelectedFolderPath ?? '', name)}
		/>
	{/snippet}
	{#snippet center()}
		<div class="notes-shell-editor">
			{#if notes.loadError}
				<div class="notes-save-status is-error" role="alert"><span>{notes.loadError}</span></div>
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
				fileName={notes.selectedFilePath.split('/').pop() ?? ''}
				onContentUpdate={(markdown) => notes.handleContentUpdate(markdown)}
				splitRatio={notes.editorSplitRatio}
				onSplitResize={beginEditorResize}
				onSplitKeydown={resizeEditorWithKeyboard}
				hasVault={notes.currentVaultRoots.length > 0}
				canCreateNote={Boolean(notes.vaultSelectedFolderPath)}
				onOpenVault={() => notes.openVaultFromFolder()}
				onCreateNote={() => window.dispatchEvent(new CustomEvent('fractalnotes:new-note'))}
			/>
		</div>
	{/snippet}
	{#snippet right()}
		<div class="notes-shell-ai"><AIChat /></div>
	{/snippet}
</WorkspaceShell>

{#if notes.pendingVaultAccessPath}
	<div class="notes-access-request-overlay">
		<div class="notes-access-request" role="dialog" aria-modal="true" aria-labelledby="notes-access-request-title">
			<h2 id="notes-access-request-title">Grant folder access</h2>
			<p>The saved vault needs permission to read <code>{notes.pendingVaultAccessPath}</code>.</p>
			<p class="notes-access-request-hint">Choose this folder or one of its parent folders in the native picker. FractalEngine will only access folders you explicitly select.</p>
			<div class="notes-access-request-actions">
				<button class="btn-app" onclick={() => notes.grantPendingVaultAccess()}>Choose folder…</button>
				<button class="btn-text" onclick={() => notes.cancelPendingVaultAccess()}>Not now</button>
			</div>
		</div>
	</div>
{/if}
