<script lang="ts">
	import { onMount } from 'svelte';
	interface MdFile {
		name: string;
		path: string;
		description?: string;
	}

	interface Props {
		files: MdFile[];
		selectedFilePath: string;
		selectedFolderLabel: string;
		onFileSelect: (path: string) => void;
		onCreateNote: (name: string) => Promise<void>;
	}

	let {
		files = [] as MdFile[],
		selectedFilePath = '',
		selectedFolderLabel = '',
		onFileSelect = (_path: string) => {},
		onCreateNote = async (_name: string) => {}
	}: Props = $props();
	let isCreating = $state(false);
	let newNoteName = $state('Untitled');
	let createError = $state('');

	async function submitNewNote() {
		const normalized = newNoteName.trim().replace(/\.md$/i, '');
		if (files.some(file => file.name.toLowerCase() === `${normalized}.md`.toLowerCase())) {
			createError = 'A note with this name already exists.';
			return;
		}
		try {
			createError = '';
			await onCreateNote(newNoteName);
			isCreating = false;
			newNoteName = 'Untitled';
		} catch (error) {
			createError = error instanceof Error ? error.message : String(error);
		}
	}

	onMount(() => {
		const beginCreate = () => {
			if (selectedFolderLabel) isCreating = true;
			else createError = 'Select a vault folder before creating a note.';
		};
		window.addEventListener('fractalnotes:new-note', beginCreate);
		return () => window.removeEventListener('fractalnotes:new-note', beginCreate);
	});

	function getDescription(name: string): string {
		return name.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
	}
</script>

<div class="sidebar-carrier">
	<div class="sidebar-content">
	<div class="sidebar-header row xbetween ycenter">
		<div class="row ycenter gap4">
		<img
			src="/iconset/folder.svg"
			alt=""
			class="icon-svg"
		/>
		<span class="text-header">
			{selectedFolderLabel || 'No folder selected'}
		</span>
		</div>
		{#if selectedFolderLabel}
			<button type="button" class="btn-icon" aria-label="Create note" title="Create note" onclick={() => (isCreating = true)}><span class="text-lg">+</span></button>
		{/if}
	</div>
	<div class="sidebar-content-box">
		{#if isCreating}
			<form class="notes-create-form" onsubmit={(event) => { event.preventDefault(); void submitNewNote(); }}>
				<label for="new-note-name">New note name</label>
				<div class="row gap4">
					<input id="new-note-name" class="settings-input" bind:value={newNoteName} />
					<button type="submit" class="btn-app">Create</button>
					<button type="button" class="btn-app" onclick={() => (isCreating = false)}>Cancel</button>
				</div>
				{#if createError}<p role="alert">{createError}</p>{/if}
			</form>
		{/if}
		{#if selectedFolderLabel && files.length === 0}
			<div class="notes-empty notes-empty-inline">
				No markdown files in this folder.
			</div>
		{:else if !selectedFolderLabel}
			<div class="notes-empty">
				Select a folder in the sidebar.
			</div>
		{/if}
		{#each files as file (file.path)}
			<button
				class="notes-file {file.path === selectedFilePath ? 'is-active' : ''}"
				onclick={() => onFileSelect(file.path)}
			>
				<span class="text-item-lg truncate">{file.name.replace(/\.md$/i, '')}</span>
				<span class="text-item-sm truncate">{file.description ?? getDescription(file.name)}</span>
				<img src="/icontheme-allicon/note.svg" alt="note" class="icon-svg-sm"/>
			</button>
		{/each}
	</div>
	</div>
</div>
