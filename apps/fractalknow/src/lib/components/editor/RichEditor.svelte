<script lang="ts">
	import { onMount } from 'svelte';
	import {
		resetRichEditorStatus,
		richEditorStatus,
		setRichEditorStatus,
		updateDocumentViewState,
		type WorkspaceDocument,
	} from '$lib/shell';
	import {
		getActiveCollabSession,
		getCollabUser,
		startCollabSession,
		stopCollabSession,
		type CollabSession,
	} from '$lib/editor/collab';
	import { createBaseExtensions, createCollaborativeExtensions } from '$lib/editor/extensions';
	import { createPasteHandler } from '$lib/editor/paste';
	import {
		editorHtmlToMarkdown,
		markdownToEditorHtml,
	} from '$lib/editor/serialization';
	import type { Editor } from '@tiptap/core';
	import { appConfig } from '$lib/shell';

	let {
		document,
		onUpdate,
		collaboration = true,
	}: {
		document: WorkspaceDocument;
		onUpdate: (content: string) => void;
		collaboration?: boolean;
	} = $props();

	let host: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let activePath = '';
	let lastContent = '';
	let applyingExternalUpdate = false;
	let linkUrl = $state('');
	let showLinkInput = $state(false);

	// Per-document editors so undo/redo history survives tab switches.
	// collabDoc records the Y.Doc the editor was built against so stale
	// entries (session reaped → Y.Doc destroyed) are never reused.
	const editorCache = new Map<
		string,
		{ editor: Editor; host: HTMLDivElement; collabDoc: CollabSession['doc'] | null }
	>();
	let disposed = false;
	// Monotonic mount token: an async build that is superseded by a newer
	// document switch (or by unmount) must destroy itself instead of leaking
	// a live Editor instance that is never cached nor destroyed.
	let mountSeq = 0;

	function syncStatus(): void {
		if (!editor) {
			resetRichEditorStatus(document.path);
			return;
		}
		setRichEditorStatus({
			activePath: document.path,
			bold: editor.isActive('bold'),
			italic: editor.isActive('italic'),
			strike: editor.isActive('strike'),
			code: editor.isActive('code'),
			link: editor.isActive('link'),
			heading: editor.isActive('heading'),
			bulletList: editor.isActive('bulletList'),
			orderedList: editor.isActive('orderedList'),
			blockquote: editor.isActive('blockquote'),
			codeBlock: editor.isActive('codeBlock'),
			selectionEmpty: editor.state.selection.empty,
			characterCount: editor.getText().length,
			canUndo: editor.can().undo(),
			canRedo: editor.can().redo(),
		});
		const { from, to } = editor.state.selection;
		updateDocumentViewState(document.path, {
			richSelection: { from, to },
			richJson: editor.getJSON(),
		});
	}

	async function buildEditorForPath(
		path: string,
		content: string,
	): Promise<{ editor: Editor; collabDoc: CollabSession['doc'] | null }> {
		const { Editor } = await import('@tiptap/core');
		const collabUrl = $appConfig.syncCollaboration.serverUrl || $appConfig.project.collabUrl || null;
		const collabEnabled =
			collaboration && $appConfig.syncCollaboration.collaborationEnabled && Boolean(collabUrl);

		let extensions;
		let collabDoc: CollabSession['doc'] | null = null;
		if (collabEnabled) {
			const session = await startCollabSession(path, collabUrl);
			collabDoc = session.doc;
			extensions = await createCollaborativeExtensions({
				document: session.doc,
				fragmentName: session.fragmentName,
				provider: session.provider,
				user: getCollabUser(),
			});
		} else {
			await stopCollabSession(path);
			extensions = await createBaseExtensions();
		}

		let instance: Editor | null = null;
		instance = new Editor({
			element: host,
			content: markdownToEditorHtml(content),
			extensions,
			editorProps: {
				attributes: {
					'aria-label': 'Rich document content',
					class: 'tiptap',
				},
				handlePaste: (view, event) => {
					if (!instance) return false;
					return createPasteHandler(instance)(view, event);
				},
			},
			onUpdate: ({ editor: current }) => {
				const next = editorHtmlToMarkdown(current.getHTML());
				lastContent = next;
				syncStatus();
				if (applyingExternalUpdate) return;
				onUpdate(next);
			},
			onSelectionUpdate: syncStatus,
			onTransaction: syncStatus,
			onCreate: ({ editor: current }) => {
				const selection = document.viewState?.richSelection;
				if (selection) {
					const max = current.state.doc.content.size;
					current.commands.setTextSelection({
						from: Math.min(selection.from, max),
						to: Math.min(selection.to, max),
					});
				}
				current.commands.focus('end');
			},
		});

		// When collab is off, seed from markdown. When collab is on, Y.Doc owns content;
		// still push markdown if the fragment is empty.
		if (collabEnabled) {
			const session = getActiveCollabSession(path);
			const fragment = session?.doc.getXmlFragment(session.fragmentName);
			if (fragment && fragment.length === 0 && content.trim()) {
				instance.commands.setContent(markdownToEditorHtml(content), { emitUpdate: false });
			}
		}

		return { editor: instance, collabDoc };
	}

	async function mountActiveDocument(): Promise<void> {
		if (!host || disposed) return;
		const seq = ++mountSeq;
		const cached = editorCache.get(document.path);
		if (cached) {
			// Never reuse an editor whose collab session was reaped (its Y.Doc is
			// destroyed) or that was already destroyed itself — rebuild instead.
			const stale =
				cached.editor.isDestroyed ||
				(cached.collabDoc != null && getActiveCollabSession(document.path)?.doc !== cached.collabDoc);
			if (stale) {
				cached.editor.destroy();
				editorCache.delete(document.path);
			} else {
				// Reattach cached editor DOM.
				host.replaceChildren();
				host.appendChild(cached.host.firstChild ? cached.host : cached.editor.view.dom);
				editor = cached.editor;
				activePath = document.path;
				lastContent = document.content;
				if (document.content !== editorHtmlToMarkdown(editor.getHTML())) {
					replaceContent(document.content);
				}
				editor.commands.focus();
				syncStatus();
				return;
			}
		}

		host.replaceChildren();
		activePath = document.path;
		lastContent = document.content;
		const built = await buildEditorForPath(document.path, document.content);
		// A newer switch (or unmount) superseded this build while it awaited:
		// destroy the orphaned editor rather than leaking it uncached.
		if (disposed || seq !== mountSeq || !host) {
			built.editor.destroy();
			return;
		}
		editor = built.editor;
		editorCache.set(document.path, {
			editor: built.editor,
			host: host.cloneNode(false) as HTMLDivElement,
			collabDoc: built.collabDoc,
		});
		syncStatus();
	}

	function replaceContent(content: string): void {
		if (!editor) return;
		lastContent = content;
		applyingExternalUpdate = true;
		editor.commands.setContent(markdownToEditorHtml(content), { emitUpdate: false });
		const selection = document.viewState?.richSelection;
		if (selection) {
			const max = editor.state.doc.content.size;
			editor.commands.setTextSelection({
				from: Math.min(selection.from, max),
				to: Math.min(selection.to, max),
			});
		}
		applyingExternalUpdate = false;
		syncStatus();
	}

	function runCommand(
		command:
			| 'bold'
			| 'italic'
			| 'strike'
			| 'code'
			| 'bulletList'
			| 'orderedList'
			| 'heading'
			| 'blockquote'
			| 'codeBlock'
			| 'horizontalRule'
			| 'undo'
			| 'redo'
			| 'sinkListItem'
			| 'liftListItem',
	): void {
		if (!editor) return;
		const chain = editor.chain().focus();
		if (command === 'bold') chain.toggleBold().run();
		if (command === 'italic') chain.toggleItalic().run();
		if (command === 'strike') chain.toggleStrike().run();
		if (command === 'code') chain.toggleCode().run();
		if (command === 'bulletList') chain.toggleBulletList().run();
		if (command === 'orderedList') chain.toggleOrderedList().run();
		if (command === 'heading') chain.toggleHeading({ level: 2 }).run();
		if (command === 'blockquote') chain.toggleBlockquote().run();
		if (command === 'codeBlock') chain.toggleCodeBlock().run();
		if (command === 'horizontalRule') chain.setHorizontalRule().run();
		if (command === 'undo') chain.undo().run();
		if (command === 'redo') chain.redo().run();
		if (command === 'sinkListItem') chain.sinkListItem('listItem').run();
		if (command === 'liftListItem') chain.liftListItem('listItem').run();
		syncStatus();
	}

	function applyLink(): void {
		if (!editor) return;
		const href = linkUrl.trim();
		if (!href) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
		} else {
			editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
		}
		showLinkInput = false;
		linkUrl = '';
		syncStatus();
	}

	onMount(() => {
		void mountActiveDocument();
		return () => {
			disposed = true;
			// Invalidate any in-flight async build so its continuation destroys
			// the editor instead of caching it after teardown.
			mountSeq++;
			// Keep editors in cache for undo restoration; only destroy on full unmount of all.
			for (const entry of editorCache.values()) {
				entry.editor.destroy();
			}
			editorCache.clear();
			editor = null;
			resetRichEditorStatus(null);
			void stopCollabSession();
		};
	});

	$effect(() => {
		if (!host) return;
		if (document.path !== activePath) {
			void mountActiveDocument();
			return;
		}
		if (editor && document.content !== lastContent) {
			replaceContent(document.content);
		}
	});
</script>

<div class="rich-editor">
	<div class="rich-editor__toolbar" aria-label="Rich editor formatting">
		<button type="button" aria-pressed={$richEditorStatus.heading} class:active={$richEditorStatus.heading} onclick={() => runCommand('heading')}>H2</button>
		<button type="button" aria-pressed={$richEditorStatus.bold} class:active={$richEditorStatus.bold} onclick={() => runCommand('bold')}>B</button>
		<button type="button" aria-pressed={$richEditorStatus.italic} class:active={$richEditorStatus.italic} onclick={() => runCommand('italic')}>I</button>
		<button type="button" aria-pressed={$richEditorStatus.strike} class:active={$richEditorStatus.strike} onclick={() => runCommand('strike')}>S</button>
		<button type="button" aria-pressed={$richEditorStatus.code} class:active={$richEditorStatus.code} onclick={() => runCommand('code')}>Code</button>
		<button type="button" aria-pressed={$richEditorStatus.link} class:active={$richEditorStatus.link} onclick={() => (showLinkInput = !showLinkInput)}>Link</button>
		<button type="button" aria-pressed={$richEditorStatus.bulletList} class:active={$richEditorStatus.bulletList} onclick={() => runCommand('bulletList')}>List</button>
		<button type="button" aria-pressed={$richEditorStatus.orderedList} class:active={$richEditorStatus.orderedList} onclick={() => runCommand('orderedList')}>1.</button>
		<button type="button" onclick={() => runCommand('sinkListItem')} title="Indent list">↳</button>
		<button type="button" onclick={() => runCommand('liftListItem')} title="Outdent list">↰</button>
		<button type="button" aria-pressed={$richEditorStatus.blockquote} class:active={$richEditorStatus.blockquote} onclick={() => runCommand('blockquote')}>Quote</button>
		<button type="button" aria-pressed={$richEditorStatus.codeBlock} class:active={$richEditorStatus.codeBlock} onclick={() => runCommand('codeBlock')}>Block</button>
		<button type="button" onclick={() => runCommand('horizontalRule')}>HR</button>
		<button type="button" disabled={!$richEditorStatus.canUndo} onclick={() => runCommand('undo')}>Undo</button>
		<button type="button" disabled={!$richEditorStatus.canRedo} onclick={() => runCommand('redo')}>Redo</button>
		<span>{$richEditorStatus.characterCount} chars</span>
	</div>
	{#if showLinkInput}
		<div class="rich-editor__link">
			<input bind:value={linkUrl} type="url" placeholder="https://…" aria-label="Link URL" />
			<button type="button" onclick={applyLink}>Apply</button>
			<button type="button" onclick={() => (showLinkInput = false)}>Cancel</button>
		</div>
	{/if}
	<div class="rich-editor__surface" bind:this={host}></div>
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.rich-editor
		width: 100%
		border: 1px solid var(--ok-line)
		border-radius: 8px
		background: var(--ok-surface)
		color: var(--ok-ink)
		overflow: hidden

		&:focus-within
			border-color: var(--ok-accent)

		&__toolbar
			padding: 8px
			border-bottom: 1px solid var(--ok-line)
			background: var(--ok-panel)
			display: flex
			align-items: center
			flex-wrap: wrap
			gap: 6px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer
				font-weight: 700

				&:hover:not(:disabled)
					border-color: var(--ok-accent)

				&:disabled
					opacity: 0.45
					cursor: not-allowed

				&.active
					border-color: var(--ok-accent)
					background: var(--ok-accent)
					color: white

			span
				margin-left: auto
				color: var(--ok-muted)
				font-size: 12px
				font-weight: 700

		&__link
			display: flex
			gap: 8px
			padding: 8px
			border-bottom: 1px solid var(--ok-line)
			background: var(--ok-panel)

			input
				flex: 1
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)

		&__surface
			min-height: 320px

			:global(.tiptap)
				min-height: 320px
				padding: 16px
				line-height: 1.55
				outline: none

			:global(.tiptap p)
				margin: 0 0 10px

			:global(.tiptap h1),
			:global(.tiptap h2),
			:global(.tiptap h3)
				margin: 0 0 12px

			:global(.tiptap ul),
			:global(.tiptap ol)
				margin: 0 0 12px
				padding-left: 22px

			:global(.tiptap ul ul),
			:global(.tiptap ol ol),
			:global(.tiptap ul ol),
			:global(.tiptap ol ul)
				margin: 4px 0

			:global(.tiptap blockquote)
				margin: 0 0 12px
				padding-left: 12px
				border-left: 3px solid var(--ok-accent)
				color: var(--ok-muted)

			:global(.tiptap pre)
				margin: 0 0 12px
				padding: 12px
				border-radius: 8px
				background: var(--ok-panel)
				overflow: auto

			:global(.tiptap code)
				font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

			:global(.tiptap hr)
				border: none
				border-top: 1px solid var(--ok-line)
				margin: 16px 0

			:global(.tiptap a)
				color: var(--ok-accent)

			:global(.collaboration-carets__caret)
				border-left: 2px solid
				margin-left: -1px
				pointer-events: none
				position: relative
				word-break: normal

			:global(.collaboration-carets__label)
				position: absolute
				top: -1.4em
				left: -1px
				font-size: 10px
				font-weight: 700
				color: white
				padding: 1px 4px
				border-radius: 3px
				white-space: nowrap

			:global(.tiptap p.is-editor-empty:first-child::before)
				content: attr(data-placeholder)
				color: var(--ok-muted)
				float: left
				height: 0
				pointer-events: none
</style>
