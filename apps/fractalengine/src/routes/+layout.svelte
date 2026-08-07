<script lang="ts">
	import '$lib/styles/index.sass';
	import 'virtual:fractals-styler.css';
	import { theme } from '$lib/globalstores.svelte'
	import { ideState } from '../lib/state/ide.svelte';
	import { appState } from '../lib/state/app.svelte';
	import { shellState } from '../lib/state/shell.svelte';
	import { notes as notesState } from '$lib/modules/notes/state/notes.svelte';
	import { canvas } from '../lib/state/canvas.svelte';
	import { designcanvas } from '$lib/modules/designer/state/designcanvas.svelte';
	import { contributions } from '$lib/state/contributions.svelte';
	import '$lib/state/coreContributions';
	import '$lib/modules/notes/contributions';
	import '$lib/modules/designer/contributions';
	import '$lib/modules/ai/contributions';
	import '$lib/modules/bookmarks/contributions';
	import '$lib/modules/media/contributions';
	import '$lib/modules/fractaldocs/contributions';
	import { onMount, type Snippet } from 'svelte';
	import { onAppCloseRequested, onMenuEvent } from '../lib/ipc';
	import { dictation } from '$lib/state/dictation.svelte';
	import { Tooltip } from "bits-ui";
	import { Agentation } from 'sv-agentation';
	import { annotations } from '$lib/modules/annotations/state/annotations.svelte';
	import SharedAnnotationOverlay from '$lib/modules/annotations/components/SharedAnnotationOverlay.svelte';
	import { browser, dev } from '$app/environment';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
	let workspaceRoot = $derived(ideState.rootPath);

  function handleCopy(markdown: string, payload: any) {
    // Instead of pasting manually, send it directly to the active AI Chat session!
    if (markdown.trim()) {
      ideState.sendAiMessage(
        `Here is visual feedback from the app layout:\n\n${markdown}`
      );
    }
  }

	// Mirror the active app template to the native Window menu checkmark.
	$effect(() => {
		void appState.syncNativeMenu();
	});

	onMount(() => {
		const disposeDictation = dictation.initialize();
		const stopAnnotations = annotations.start();
		// Initialize the virtual filesystem and directory list
		void ideState.initWorkspace().catch((error) => {
			ideState.isWorkspaceInitializing = false;
			ideState.addLog(`Workspace initialization failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
		});

		// Subscribe to native application menu events
		const unsubscribe = onMenuEvent((action) => {
			if (action === 'undo') {
				if (!focusOwnsUndo()) shellState.undo();
			} else if (action === 'redo') {
				if (!focusOwnsUndo()) shellState.redo();
			} else {
				const commandId = contributions.menuCommandFor(action);
				if (commandId) void contributions.run(commandId);
			}
		});
		const unsubscribeClose = onAppCloseRequested(async () => {
			if (!ideState.confirmDiscardDirtyFiles('You have unsaved code changes. Close the window and discard them?')) return false;
			window.dispatchEvent(new CustomEvent('fractalengine:before-persist'));
			const [notesSaved, canvasSaved] = await Promise.all([
				notesState.flushPendingChanges(),
				canvas.flushPendingChanges(),
			]);
			return notesSaved && canvasSaved && designcanvas.flushPendingChanges();
		});

		return () => {
			disposeDictation();
			stopAnnotations();
			unsubscribe();
			unsubscribeClose();
		};
	});

	function handleBeforeUnload(event: BeforeUnloadEvent) {
		window.dispatchEvent(new CustomEvent('fractalengine:before-persist'));
		if (canvas.hasPendingSave) void canvas.flushPendingChanges();
		if (designcanvas.hasPendingPersistence) designcanvas.flushPendingChanges();
		if (!ideState.hasDirtyFiles && !notesState.hasPendingChanges && !canvas.hasPendingSave && !designcanvas.hasPendingPersistence) return;
		event.preventDefault();
		event.returnValue = '';
	}

	// True when focus sits inside a surface that owns its own undo/redo (CodeMirror, a
	// TipTap/ProseMirror rich editor, or a plain input/textarea) — the global shortcut must
	// defer to those instead of firing shellState.undo()/redo() underneath them, which used
	// to fight CodeMirror's own historyKeymap binding.
	function focusOwnsUndo(): boolean {
		const el = document.activeElement as HTMLElement | null;
		if (!el) return false;
		const tag = el.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable) return true;
		return !!el.closest('.cm-editor, .cm-content, .ProseMirror');
	}

	function handleGlobalKeyDown(e: KeyboardEvent) {
		if (e.key === 'Fn' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
			dictation.beginFnGlobeHold();
			return;
		}
		const isCmdOrCtrl = e.metaKey || e.ctrlKey;
		const key = e.key.toLowerCase();

		if (isCmdOrCtrl && key === 'z') {
			if (e.defaultPrevented || focusOwnsUndo()) return;
			e.preventDefault();
			if (e.shiftKey) {
				// Cmd+Shift+Z (Redo)
				shellState.redo();
			} else {
				// Cmd+Z (Undo)
				shellState.undo();
			}
		} else if (isCmdOrCtrl && key === 'y') {
			if (e.defaultPrevented || focusOwnsUndo()) return;
			e.preventDefault();
			// Cmd+Y (Redo)
			shellState.redo();
		} else {
			const commandId = contributions.matchKeybinding(e, appState.activeTemplateId);
			if (commandId) {
				e.preventDefault();
				void contributions.run(commandId);
				return;
			}

			if (isCmdOrCtrl && key === 's') {
				if (e.defaultPrevented) return;
				e.preventDefault();
				if (appState.activeTemplateId === 'code' && ideState.activeFile) void ideState.saveActiveFile();
				else if (appState.activeTemplateId === 'notes') void notesState.flushPendingChanges();
				else if (appState.activeTemplateId === 'design') designcanvas.flushPendingChanges();
				else if (appState.activeTemplateId === 'blank') void canvas.flushPendingChanges();
			} else if (isCmdOrCtrl && key === 'k') {
				e.preventDefault();
				shellState.showCommandPalette = !shellState.showCommandPalette;
			} else if (isCmdOrCtrl && key === ',') {
				e.preventDefault();
				shellState.showSettings = !shellState.showSettings;
			}
		}
	}

	function handleGlobalKeyUp(e: KeyboardEvent) {
		if (e.key === 'Fn') dictation.endFnGlobeHold();
	}
</script>

<svelte:window onkeydown={handleGlobalKeyDown} onkeyup={handleGlobalKeyUp} onbeforeunload={handleBeforeUnload} />

<main class="app-root-shell {theme.value}">
	{#if children}
		<Tooltip.Provider>
		{@render children()}
		</Tooltip.Provider>
	{/if}
	{#if browser && dev}
		<Agentation
			workspaceRoot={ideState.rootPath}
			onAnnotationAdd={(annotation) => void annotations.saveSnapshot(annotation)}
			onAnnotationUpdate={(annotation) => void annotations.saveSnapshot(annotation)}
			onAnnotationDelete={(annotation) => void annotations.remove(annotation.id)}
			onAnnotationsClear={(items) => void Promise.all(items.map(item => annotations.remove(item.id)))}
		/>
		<SharedAnnotationOverlay />
	{/if}
</main>
