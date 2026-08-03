<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import { htmlToMarkdown, markdownToHtml } from '$lib/markdown';
	import { entries } from '$lib/state/entries.svelte';
	import { prefs } from '$lib/state/prefs.svelte';

	// The capture surface. No formatting toolbar by design: paste renders richly and is
	// stored as markdown, which covers both the fast-capture and leisure-editing modes.

	let element: HTMLDivElement;
	let shellElement: HTMLDivElement;
	let titleElement: HTMLHeadingElement;
	let editor = $state<Editor>();
	let titleText = $state('new note');
	let lastToken = -1;

	function displayTitle() {
		return entries.title.trim() || 'new note';
	}

	function syncTitleElement() {
		if (!titleElement || document.activeElement === titleElement) return;
		titleText = displayTitle();
	}

	function scrollEditorTop() {
		requestAnimationFrame(() => {
			const scroller = element?.closest<HTMLElement>('.editor-area') ?? element?.parentElement;
			scroller?.scrollTo({ top: 0, left: 0 });
		});
	}

	function openAtTop() {
		if (!editor) return;
		editor.commands.focus('start');
		scrollEditorTop();
	}

	/**
	 * Applies clipboard content to the editor. Rich HTML is inserted as-is (TipTap maps
	 * it to its schema, and onUpdate re-serializes to markdown). Plain text is treated
	 * as *markdown source* and parsed — so a copied AI answer or a raw ```md``` block
	 * renders as formatting rather than landing as literal `#` and `*` characters.
	 */
	function applyClipboard(event: ClipboardEvent): boolean {
		if (!editor) return false;
		// Tag the entry with its source app (Claude, Codex, …) whenever content lands.
		void entries.applySourceTags();
		const html = event.clipboardData?.getData('text/html');
		if (html && html.trim()) return false; // let TipTap's default rich handling run
		const text = event.clipboardData?.getData('text/plain');
		if (text && text.trim()) {
			editor.commands.insertContent(markdownToHtml(text));
			return true;
		}
		return false;
	}

	// Paste-never-lost: a Cmd+V that lands while focus is anywhere but the editor (e.g.
	// straight after the window regains focus) is still captured. When the editor is
	// focused, its own handlePaste covers it and this stays out of the way.
	function onWindowPaste(event: ClipboardEvent) {
		if (!editor || editor.isFocused) return;
		const target = event.target as HTMLElement | null;
		// Don't hijack a paste meant for the search box or a metadata input.
		if (target && target.closest('input, textarea, [contenteditable]')) return;
		event.preventDefault();
		editor.commands.focus('end');
		if (!applyClipboard(event)) {
			const html = event.clipboardData?.getData('text/html');
			if (html) editor.commands.insertContent(html);
		}
	}

	function focusEditorSurface(event: PointerEvent) {
		if (!editor) return;
		const target = event.target as HTMLElement | null;
		if (target?.closest('.ProseMirror')) return;
		event.preventDefault();
		editor.commands.focus('end');
	}

	function editorSurface(node: HTMLDivElement) {
		node.addEventListener('pointerdown', focusEditorSurface);
		return {
			destroy() {
				node.removeEventListener('pointerdown', focusEditorSurface);
			}
		};
	}

	function commitTitle() {
		const next = titleText.trim();
		entries.setTitle(next === 'New Note' ? '' : next);
	}

	function resetEmptyTitle() {
		if (titleText.trim()) return;
		entries.setTitle('');
		titleText = displayTitle();
	}

	function onTitleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		editor?.commands.focus('start');
	}

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Placeholder.configure({ placeholder: 'Paste or start writing…' })
			],
			content: entries.body ? markdownToHtml(entries.body) : '',
			editorProps: {
				handlePaste: (_view, event) => applyClipboard(event as ClipboardEvent),
				attributes: { class: 'fracta-prose' }
			},
			onUpdate: ({ editor }) => {
				entries.setBody(htmlToMarkdown(editor.getHTML()));
			}
		});
		lastToken = entries.resetToken;
		syncTitleElement();
		openAtTop();
		window.addEventListener('paste', onWindowPaste, true);
	});

	onDestroy(() => {
		window.removeEventListener('paste', onWindowPaste, true);
		editor?.destroy();
	});

	// Reload editor content only on a genuine entry switch (open / new draft), never on
	// the keystroke-driven body updates the editor itself produces.
	$effect(() => {
		const token = entries.resetToken;
		if (!editor || token === lastToken) return;
		lastToken = token;
		const html = entries.body ? markdownToHtml(entries.body) : '';
		editor.commands.setContent(html, { emitUpdate: false });
		syncTitleElement();
		openAtTop();
	});

	$effect(() => {
		entries.title;
		syncTitleElement();
	});

	// Live-apply the footer's font family and size to the editor surface.
	$effect(() => {
		if (!element) return;
		for (const node of [element, shellElement]) {
			node?.style.setProperty('--editor-font', prefs.fontStack);
			node?.style.setProperty('--editor-size', `${prefs.size}px`);
		}
	});
</script>

<div class="editor-area" bind:this={shellElement}>
	<div class="fracta-prose-cousin">
		<h1
			contenteditable="plaintext-only"
			bind:textContent={titleText}
			bind:this={titleElement}
			oninput={commitTitle}
			onblur={resetEmptyTitle}
			onkeydown={onTitleKeydown}
			aria-label="Note title"
		></h1>
	</div>
	<div class="editor-host" bind:this={element} use:editorSurface></div>
</div>
