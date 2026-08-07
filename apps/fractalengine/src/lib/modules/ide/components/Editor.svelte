<script lang="ts">
	import { ideState } from '$lib/state/ide.svelte';
	import { theme } from '$lib/globalstores.svelte'
	import { onMount, onDestroy } from 'svelte';
	
	// CodeMirror 6 Core
	import { EditorState, Compartment } from '@codemirror/state';
	import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, ViewUpdate } from '@codemirror/view';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	
	// CodeMirror Languages
	import { javascript } from '@codemirror/lang-javascript';
	import { html } from '@codemirror/lang-html';
	import { sass } from '@codemirror/lang-sass';
	import { markdown } from '@codemirror/lang-markdown';
	
	// Custom dynamic theme bindings
	import { customEditorTheme, dynamicSyntaxHighlighting } from '$lib/editorTheme';

	let activeFile = $derived(ideState.activeFile);
	let openFiles = $derived(ideState.openFiles);

	let editorContainer = $state<HTMLDivElement | null>(null);
	let editorView: EditorView | null = null;
	// Undo history lives per-file: switching files swaps in that file's EditorState via
	// setState() instead of diffing content into the live (shared) state, which used to let
	// Ctrl+Z after a file switch undo into a previous file's content. The current file's
	// live state is saved back into this map right before we switch away from it.
	const fileStates = new Map<string, EditorState>();
	let currentFilePath: string | null = null;
	const languageCompartment = new Compartment();
	const wrapCompartment = new Compartment();

	function getLanguageExtension(filename: string) {
		const ext = filename.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'ts':
			case 'js':
			case 'json':
				return javascript({ typescript: ext === 'ts', jsx: false });
			case 'svelte':
			case 'html':
				return html();
			case 'sass':
				return sass({ indented: true });
			case 'md':
				return markdown();
			default:
				return [];
		}
	}

	function buildExtensions(filename: string) {
		return [
			lineNumbers(),
			highlightActiveLineGutter(),
			highlightActiveLine(),
			history(),
			keymap.of([
				{ key: "Mod-s", run: () => { ideState.saveActiveFile(); return true; } },
				...defaultKeymap,
				...historyKeymap
			]),
			customEditorTheme,
			dynamicSyntaxHighlighting,
			languageCompartment.of(getLanguageExtension(filename)),
			wrapCompartment.of(ideState.editorLineWrapping ? EditorView.lineWrapping : []),
			EditorView.updateListener.of((update: ViewUpdate) => {
				if (update.docChanged) {
					const newContent = update.state.doc.toString();
					ideState.updateActiveFileContent(newContent);
				}
			})
		];
	}

	// Returns the file's cached state (preserving its undo history) if its content still
	// matches what's cached, otherwise builds a fresh state — the content only diverges from
	// the cache when it changed from outside the editor (e.g. an on-disk reload), in which
	// case there's no sensible history to preserve anyway.
	function getOrCreateFileState(path: string, filename: string, content: string): EditorState {
		const cached = fileStates.get(path);
		if (cached && cached.doc.toString() === content) {
			return cached;
		}
		return EditorState.create({ doc: content, extensions: buildExtensions(filename) });
	}

	// Reactive synchronization between global activeFile and CodeMirror instance
	$effect(() => {
		if (editorContainer && activeFile) {
			if (!editorView) {
				editorView = new EditorView({
					state: getOrCreateFileState(activeFile.path, activeFile.name, activeFile.content),
					parent: editorContainer
				});
				currentFilePath = activeFile.path;
			} else if (activeFile.path !== currentFilePath) {
				if (currentFilePath) fileStates.set(currentFilePath, editorView.state);
				editorView.setState(getOrCreateFileState(activeFile.path, activeFile.name, activeFile.content));
				currentFilePath = activeFile.path;
			} else {
				const currentDoc = editorView.state.doc.toString();
				if (currentDoc !== activeFile.content) {
					editorView.dispatch({
						changes: { from: 0, to: currentDoc.length, insert: activeFile.content },
						effects: languageCompartment.reconfigure(getLanguageExtension(activeFile.name))
					});
				}
			}
		} else if (!activeFile && editorView) {
			editorView.destroy();
			editorView = null;
			currentFilePath = null;
			fileStates.clear();
		}
	});
	// Drop cached history for files that are no longer open, so it doesn't linger in memory.
	$effect(() => {
		const openPaths = new Set(openFiles.map(f => f.path));
		for (const path of [...fileStates.keys()]) {
			if (!openPaths.has(path)) fileStates.delete(path);
		}
	});
	$effect(() => {
		const wrap = ideState.editorLineWrapping;
		if (editorView) {
			editorView.dispatch({
				effects: wrapCompartment.reconfigure(wrap ? EditorView.lineWrapping : [])
			});
		}
	});
	onDestroy(() => {
		if (editorView) {
			editorView.destroy();
		}
	});
</script>

<div class="box w100">
	{#if openFiles.length > 0}
		<!-- Tab bar -->
		<div class="editor-tab">
			{#each openFiles as file (file.path)}
				<div class="editor-file-tab row ycenter {activeFile?.path === file.path ? 'is-active' : ''}">
					<button class="btn-text" onclick={() => ideState.openFile(file.path, file.name)}>
						<span>{file.name}</span>
						{#if activeFile?.path === file.path && activeFile.isDirty}
							<span class="unsaved-dot"></span>
						{/if}
					</button>
					<button class="btn-icon" onclick={() => ideState.closeFile(file.path)} title="Close Tab">
						<img src="/iconset/close.svg" alt="Close" class="icon-svg-sm" />
					</button>
				</div>
			{/each}
		</div>

		{#if activeFile}
			<div 
				class="ide-editor" 
				bind:this={editorContainer}
				style="--editor-font-size: {ideState.editorFontSize}px; --editor-font-family: {ideState.editorFontFamily};"
			></div>
		{/if}
	{:else}
		<!-- Splash / Welcome screen -->
		<div class="ide-welcome-screen">
			<div class="box ycenter xcenter gap8">
				<img src="/ic-fin/module-code.svg" alt="Logo" class="icon-svg-large" />
				<span class="text-lg bold">fractalCode</span>
			</div>
			<div class="splash-shortcuts box gap8 pad16 xcenter">
					<button class="btn-app" onclick={() => ideState.browseAndOpenFile()}><span>Open File</span></button>
					<button class="btn-app" onclick={() => ideState.selectAndLoadDirectory()}><span>Open Folder</span></button>
					<button class="btn-app" onclick={() => ideState.openWorkspaceFromFile()}><span>Open Workspace</span></button>
			</div>
		</div>
	{/if}
</div>
