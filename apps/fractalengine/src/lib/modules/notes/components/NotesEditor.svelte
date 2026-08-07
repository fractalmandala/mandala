<script lang="ts">
	// TipTap WYSIWYG editor with raw markdown split pane, toolbar, and slash commands.
	// TipTap itself (plus all its extensions, table support, and selected syntax grammars)
	// is loaded lazily via loadTiptap() below. Marked and the tree-shakeable Lowlight
	// factory stay static because they are small and needed around the lazy boundary.
	// it was the majority of this component's ~676KB chunk, paid on every notes open
	// even for a user who only ever uses Raw mode. Only types are imported statically
	// (erased at build time, zero runtime cost).
	import { onDestroy } from 'svelte';
	import type { Editor as TiptapEditor, AnyExtension, Range } from '@tiptap/core';
	import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
	import { createLowlight } from 'lowlight';
	import { marked } from 'marked';
	import { parseFrontmatter } from '$lib/modules/notes/frontmatter';

type ViewMode = 'split' | 'raw' | 'rich';
	interface Props {
		content?: string;
		fileName?: string;
		onContentUpdate?: (markdown: string) => void;
		splitRatio?: number;
		onSplitResize?: (event: PointerEvent) => void;
		onSplitKeydown?: (event: KeyboardEvent) => void;
		hasVault?: boolean;
		canCreateNote?: boolean;
		onOpenVault?: () => void;
		onCreateNote?: () => void;
	}

	let {
		content = '',
		fileName = 'untitled.md',
		onContentUpdate = (_md: string) => {},
		splitRatio = $bindable(50),
		onSplitResize = (_e: PointerEvent) => {},
		onSplitKeydown = (_e: KeyboardEvent) => {},
		hasVault = false,
		canCreateNote = false,
		onOpenVault = () => {},
		onCreateNote = () => {},
	}: Props = $props();

	// Local drag state. The parent owns `editorSplitRatio` and is updated via
	// `onSplitResize` callback fired from the handle's mousedown. We mirror it
	// locally for instant visual feedback during the drag.
	let localSplitRatio = $state(splitRatio);
	$effect(() => { localSplitRatio = splitRatio; });

	// ── Slash command items ──
	interface SlashItem {
		title: string;
		icon: string;
		command: (props: { editor: TiptapEditor; range: Range }) => void;
	}

	const slashItems: SlashItem[] = [
		{ title: 'Heading 1', icon: '/iconset/headerLevelUp.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run() },
		{ title: 'Heading 2', icon: '/iconset/headerLevelUp.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run() },
		{ title: 'Heading 3', icon: '/iconset/headerLevelUp.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run() },
		{ title: 'Bold', icon: '/iconset/bold.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBold().run() },
		{ title: 'Italic', icon: '/iconset/italic.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleItalic().run() },
		{ title: 'Underline', icon: '/iconset/text.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleUnderline().run() },
		{ title: 'Bullet List', icon: '/iconset/bulletList.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
		{ title: 'Ordered List', icon: '/iconset/numberedList.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
		{ title: 'Task List', icon: '/iconset/task.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
		{ title: 'Blockquote', icon: '/iconset/text.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
		{ title: 'Code Block', icon: '/iconset/codeCell.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
		{ title: 'Table', icon: '/iconset/table.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3 }).run() },
		{ title: 'Divider', icon: '/iconset/separatorHorizontal.svg', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
	];

	// ── TipTap: loaded on demand, cached after first load ──
	// Everything TipTap-related — core, StarterKit, every extension, lowlight's grammars,
	// turndown — is dynamically imported here instead of statically at the top of the
	// file. That was the majority of this component's ~676KB chunk, previously paid by
	// every notes session even when the user only ever used Raw mode.
	interface TiptapBundle {
		Editor: typeof TiptapEditor;
		extensions: AnyExtension[];
		turndownService: { turndown: (html: string) => string };
	}
	let tiptapBundlePromise: Promise<TiptapBundle> | null = null;

	function loadTiptap(): Promise<TiptapBundle> {
		if (!tiptapBundlePromise) {
			tiptapBundlePromise = (async () => {
				const [
					core,
					{ default: StarterKit },
					{ default: Placeholder },
					{ default: LinkExtension },
					{ default: ImageExtension },
					{ default: Underline },
					{ default: TaskList },
					{ default: TaskItem },
					{ default: Highlight },
					{ Table },
					{ TableRow },
					{ TableCell },
					{ TableHeader },
					{ default: CodeBlockLowlight },
					{ default: SuggestionPlugin },
					{ default: TurndownServiceCtor },
					// lowlight's `common` export drags in all ~36 of its bundled grammars as
					// one ~880KB chunk (they're static imports inside common.js, so pulling
					// just a few properties off the resulting object doesn't shrink what's
					// downloaded). Importing individual highlight.js language modules instead
					// only bundles the languages actually registered below.
					{ default: hlJavascript },
					{ default: hlTypescript },
					{ default: hlPython },
					{ default: hlRust },
					{ default: hlBash },
					{ default: hlJson },
					{ default: hlCss },
					{ default: hlXml },
					{ default: hlYaml },
					{ default: hlMarkdown },
					{ default: hlSql },
					{ default: hlGo },
				] = await Promise.all([
					import('@tiptap/core'),
					import('@tiptap/starter-kit'),
					import('@tiptap/extension-placeholder'),
					import('@tiptap/extension-link'),
					import('@tiptap/extension-image'),
					import('@tiptap/extension-underline'),
					import('@tiptap/extension-task-list'),
					import('@tiptap/extension-task-item'),
					import('@tiptap/extension-highlight'),
					import('@tiptap/extension-table'),
					import('@tiptap/extension-table-row'),
					import('@tiptap/extension-table-cell'),
					import('@tiptap/extension-table-header'),
					import('@tiptap/extension-code-block-lowlight'),
					import('@tiptap/suggestion'),
					import('turndown'),
					import('highlight.js/lib/languages/javascript'),
					import('highlight.js/lib/languages/typescript'),
					import('highlight.js/lib/languages/python'),
					import('highlight.js/lib/languages/rust'),
					import('highlight.js/lib/languages/bash'),
					import('highlight.js/lib/languages/json'),
					import('highlight.js/lib/languages/css'),
					import('highlight.js/lib/languages/xml'),
					import('highlight.js/lib/languages/yaml'),
					import('highlight.js/lib/languages/markdown'),
					import('highlight.js/lib/languages/sql'),
					import('highlight.js/lib/languages/go'),
				]);

				const lowlight = createLowlight({
					javascript: hlJavascript,
					typescript: hlTypescript,
					python: hlPython,
					rust: hlRust,
					bash: hlBash,
					json: hlJson,
					css: hlCss,
					xml: hlXml,
					html: hlXml,
					yaml: hlYaml,
					markdown: hlMarkdown,
					sql: hlSql,
					go: hlGo,
				});
				const turndownService = new TurndownServiceCtor({
					headingStyle: 'atx',
					codeBlockStyle: 'fenced',
					emDelimiter: '*',
					bulletListMarker: '-',
				});

				const extensions = [
					StarterKit.configure({
						codeBlock: false,       // using CodeBlockLowlight instead
						heading: { levels: [1, 2, 3] },
						// These are registered below with Notes-specific configuration.
						link: false,
						underline: false,
					}),
					Placeholder.configure({ placeholder: 'Start writing your notes…' }),
					LinkExtension.configure({ openOnClick: true }),
					ImageExtension,
					Underline,
					Highlight,
					TaskList,
					TaskItem.configure({ nested: true }),
					Table.configure({ resizable: true }),
					TableRow,
					TableCell,
					TableHeader,
					CodeBlockLowlight.configure({ lowlight }),
					// Slash command extension
					core.Extension.create({
						name: 'slashCommand',
						addProseMirrorPlugins() {
							return [
								SuggestionPlugin({
									editor: this.editor,
									char: '/',
									allowSpaces: false,
									startOfLine: true,
									items: ({ query }: { query: string }) =>
										slashItems.filter(item =>
											item.title.toLowerCase().includes(query.toLowerCase())
										).slice(0, 10),
									render: () => {
										let popup: HTMLDivElement | null = null;
										let selectedIndex = 0;
										// onKeyDown's props type only carries {view, event, range} — not items/editor
										// (see @tiptap/suggestion's SuggestionKeyDownProps) — so track the most
										// recent onStart/onUpdate props here for keyboard nav to read from.
										let lastProps: SuggestionProps<SlashItem> | null = null;

										function renderItems(props: SuggestionProps<SlashItem>) {
											if (!popup) return;
											popup.innerHTML = '';
											if (props.items.length === 0) {
												popup.style.display = 'none';
												return;
											}
											popup.style.display = '';
							props.items.forEach((item: SlashItem, i: number) => {
								const el = document.createElement('div');
								el.className = `slash-item ${i === selectedIndex ? 'is-selected' : ''}`;
								const icon = document.createElement('img');
								icon.className = 'slash-icon';
								icon.src = item.icon;
								icon.alt = '';
								const label = document.createElement('span');
								label.className = 'slash-label';
								label.textContent = item.title;
								el.append(icon, label);
												el.onclick = () => {
													item.command({ editor: props.editor, range: props.range });
													props.editor.view.focus();
												};
												el.onmouseenter = () => {
													selectedIndex = i;
													renderItems(props);
												};
												popup!.appendChild(el);
											});
										}

										return {
											onStart: (props: SuggestionProps<SlashItem>) => {
												lastProps = props;
												popup = document.createElement('div');
												popup.className = 'slash-menu';
												document.body.appendChild(popup);
												selectedIndex = 0;
												renderItems(props);
												// Position near cursor
												const coords = props.editor.view.coordsAtPos(props.range.from);
												if (coords) {
													popup.style.left = `${Math.min(coords.left, window.innerWidth - 220)}px`;
													popup.style.top = `${coords.bottom + 4}px`;
												}
											},
											onUpdate: (props: SuggestionProps<SlashItem>) => {
												lastProps = props;
												selectedIndex = 0;
												renderItems(props);
											},
											onKeyDown: (keyProps: SuggestionKeyDownProps) => {
												const props = lastProps;
												if (!props) return false;
												if (keyProps.event.key === 'ArrowDown') {
													selectedIndex = Math.min(selectedIndex + 1, props.items.length - 1);
													renderItems(props);
													return true;
												}
												if (keyProps.event.key === 'ArrowUp') {
													selectedIndex = Math.max(selectedIndex - 1, 0);
													renderItems(props);
													return true;
												}
												if (keyProps.event.key === 'Enter' && props.items[selectedIndex]) {
													props.items[selectedIndex].command({ editor: props.editor, range: props.range });
													return true;
												}
												return false;
											},
											onExit: () => {
												if (popup) {
													popup.remove();
													popup = null;
												}
											},
										};
									},
								}),
							];
						},
					}),
				];

				return { Editor: core.Editor, extensions, turndownService };
			})().catch((error: unknown) => {
				tiptapBundlePromise = null;
				throw error;
			});
		}
		return tiptapBundlePromise;
	}

	// ── Reactive state ──
	let viewMode = $state<ViewMode>('split');
	let editorEl = $state<HTMLDivElement | null>(null);
	let rawTextarea = $state<HTMLTextAreaElement | null>(null);
	let editor: TiptapEditor | null = null;
	let editorLoadError = $state('');
	// Tracks the raw markdown most recently pushed into the editor via setContent().
	// Used to suppress redundant setContent calls in the sync effect.
	let lastPushedContent = '';
	// Set to true while we apply external content (file switch, prop change).
	// Suppresses the onUpdate → onContentUpdate echo that would otherwise push
	// the same content back up and trigger an infinite loop.
	let isApplyingExternal = false;

	// ── Parsed frontmatter display state ──
	let fmTitle = $state('');
	let fmDescription = $state('');
	let fmTags = $state<string[]>([]);
	// Non-reactive: read by the onUpdate closure (which captures once at editor creation).
	let latestFmPrefix = '';

	// Toolbar active states
	let isBold = $state(false);
	let isItalic = $state(false);
	let isUnderline = $state(false);
	let isStrike = $state(false);
	let isCode = $state(false);
	let isBlockquote = $state(false);
	let isCodeBlock = $state(false);
	let isBulletList = $state(false);
	let isOrderedList = $state(false);
	let isTaskList = $state(false);
	let activeHeading = $state(0); // 0 = none, 1, 2, 3

	// ── View mode ──
	function setViewMode(mode: ViewMode) {
		viewMode = mode;
	}

	// ── Combined editor lifecycle + content sync ──
	// Single effect handles both editor creation (when editorEl first becomes bound)
	// AND content sync (when content prop changes from outside — e.g. file switch).
	// Parses YAML frontmatter out of `content` so the rich text pane only sees the body,
	// while a formatted frontmatter banner is displayed above the editor.
	$effect(() => {
		if (!editorEl) return;
		const { frontmatter, body, prefix } = parseFrontmatter(content ?? '');
		const html = marked.parse(body, { async: false }) as string;

		// Update frontmatter display
		fmTitle = frontmatter?.title || '';
		fmDescription = frontmatter?.description || '';
		fmTags = frontmatter?.tags ?? [];
		latestFmPrefix = prefix;

		if (!editor) {
			// First-time creation. TipTap's own module + extensions load asynchronously
			// (loadTiptap) — cancelled guards against a second overlapping effect run
			// (e.g. content changing again before the first load resolves) racing to
			// construct a second Editor instance; Svelte runs this closure's cleanup
			// before the next effect run starts, so only the latest run's callback proceeds.
			const mountEl = editorEl;
			let cancelled = false;
			editorLoadError = '';
			loadTiptap().then(({ Editor, extensions, turndownService }) => {
				if (cancelled || editor) return;
				editor = new Editor({
					element: mountEl,
					extensions,
					content: html,
					editorProps: {
						attributes: {
							class: 'ProseMirror',
						},
					},
					onUpdate: ({ editor: ed }) => {
						if (isApplyingExternal) return;
						const bodyMd = turndownService.turndown(ed.getHTML());
						if (bodyMd !== lastPushedContent) {
							lastPushedContent = bodyMd;
							// Reconstruct full markdown with frontmatter
							onContentUpdate(latestFmPrefix + bodyMd);
						}
					},
					onSelectionUpdate: ({ editor: ed }) => {
						isBold = ed.isActive('bold');
						isItalic = ed.isActive('italic');
						isUnderline = ed.isActive('underline');
						isStrike = ed.isActive('strike');
						isCode = ed.isActive('code');
						isBlockquote = ed.isActive('blockquote');
						isCodeBlock = ed.isActive('codeBlock');
						isBulletList = ed.isActive('bulletList');
						isOrderedList = ed.isActive('orderedList');
						isTaskList = ed.isActive('taskList');
						if (ed.isActive('heading')) {
							for (let l = 1; l <= 3; l++) {
								if (ed.isActive('heading', { level: l })) {
									activeHeading = l;
									break;
								}
							}
						} else {
							activeHeading = 0;
						}
					},
				});
				lastPushedContent = body;
			}).catch((error: unknown) => {
				if (cancelled) return;
				editorLoadError = 'The rich editor failed to load. Your Markdown remains available in Raw view.';
				console.error('Failed to load the rich notes editor', error);
			});
			return () => { cancelled = true; };
		}
		// Subsequent runs: editor exists. Sync content if it actually changed.
		if (body === lastPushedContent) return;
		const currentHtml = editor.getHTML();
		if (currentHtml.replace(/\s+/g, '') === html.replace(/\s+/g, '')) {
			lastPushedContent = body;
			return;
		}
		isApplyingExternal = true;
		try {
			editor.commands.setContent(html);
			lastPushedContent = body;
		} finally {
			// Release on the next microtask so TipTap's internal onUpdate sees the flag.
			queueMicrotask(() => { isApplyingExternal = false; });
		}
	});

	// ── Cleanup ──
	onDestroy(() => {
		if (rawSyncTimer) clearTimeout(rawSyncTimer);
		editor?.destroy();
		editor = null;
	});

	// ── Toolbar commands ──
	function cmdBold() { editor?.chain().focus().toggleBold().run(); }
	function cmdItalic() { editor?.chain().focus().toggleItalic().run(); }
	function cmdUnderline() { editor?.chain().focus().toggleUnderline().run(); }
	function cmdStrike() { editor?.chain().focus().toggleStrike().run(); }
	function cmdCode() { editor?.chain().focus().toggleCode().run(); }
	function cmdBlockquote() { editor?.chain().focus().toggleBlockquote().run(); }
	function cmdCodeBlock() { editor?.chain().focus().toggleCodeBlock().run(); }
	function cmdBulletList() { editor?.chain().focus().toggleBulletList().run(); }
	function cmdOrderedList() { editor?.chain().focus().toggleOrderedList().run(); }
	function cmdTaskList() { editor?.chain().focus().toggleTaskList().run(); }
	function cmdHeading(level: 1 | 2 | 3) { editor?.chain().focus().toggleHeading({ level }).run(); }
	function cmdTable() { editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run(); }
	function cmdLink() {
		const url = prompt('Enter URL:');
		if (url) editor?.chain().focus().setLink({ href: url }).run();
	}
	function cmdImage() {
		const url = prompt('Enter image URL:');
		if (url) editor?.chain().focus().setImage({ src: url }).run();
	}
	function cmdUndo() { editor?.chain().focus().undo().run(); }
	function cmdRedo() { editor?.chain().focus().redo().run(); }

	// ── Raw textarea handler ──
	// Reparsing the whole markdown body and replacing the entire rich-editor document is
	// real work (marked.parse + TipTap setContent) — doing it on every single keystroke
	// made typing in the raw pane janky on longer notes. Autosave notification stays
	// immediate (cheap, and Phase 4's save-buffer fix depends on it firing per keystroke);
	// only the rich-editor mirror sync is debounced.
	let rawSyncTimer: ReturnType<typeof setTimeout> | null = null;

	function handleRawInput() {
		if (!rawTextarea || isApplyingExternal) return;
		const fullMd = rawTextarea.value;
		onContentUpdate(fullMd);

		if (rawSyncTimer) clearTimeout(rawSyncTimer);
		rawSyncTimer = setTimeout(() => syncRichFromRaw(fullMd), 200);
	}

	function syncRichFromRaw(fullMd: string) {
		const { frontmatter, body, prefix } = parseFrontmatter(fullMd);
		if (body === lastPushedContent) return;
		const bodyHtml = marked.parse(body, { async: false }) as string;

		// Sync frontmatter display
		fmTitle = frontmatter?.title || '';
		fmDescription = frontmatter?.description || '';
		fmTags = frontmatter?.tags ?? [];
		latestFmPrefix = prefix;

		isApplyingExternal = true;
		try {
			editor?.commands.setContent(bodyHtml);
			lastPushedContent = body;
		} finally {
			queueMicrotask(() => { isApplyingExternal = false; });
		}
	}
</script>

<div class="notes-editor">
	{#if fileName && fileName !== 'untitled.md'}
		<div class="notes-header-strip">
			<span class="file-name-label" title={fileName}>{fileName}</span>
			<div class="view-toggle-group">
				<button
					class="btn-icon-text {viewMode === 'split' ? 'is-active' : ''}"
					onclick={() => setViewMode('split')}
					title="Split view"
				><span class="button-text">Split</span></button>
				<button
					class="btn-icon-text {viewMode === 'raw' ? 'is-active' : ''}"
					onclick={() => setViewMode('raw')}
					title="Raw markdown only"
				><span class="button-text">Raw</span></button>
				<button
					class="btn-icon-text {viewMode === 'rich' ? 'is-active' : ''}"
					onclick={() => setViewMode('rich')}
					title="Rich text only"
				><span class="button-text">Editor</span></button>
			</div>
			{#if viewMode === 'rich' || viewMode === 'split'}
							<div class="tiptap-toolbar">
					<div class="toolbar-group">
						<button class="toolbar-btn {activeHeading === 1 ? 'is-active' : ''}" onclick={() => cmdHeading(1)} title="Heading 1" aria-label="Heading 1"><img src="/iconset/headerLevelUp.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {activeHeading === 2 ? 'is-active' : ''}" onclick={() => cmdHeading(2)} title="Heading 2" aria-label="Heading 2"><img src="/iconset/headerLevelUp.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {activeHeading === 3 ? 'is-active' : ''}" onclick={() => cmdHeading(3)} title="Heading 3" aria-label="Heading 3"><img src="/iconset/headerLevelUp.svg" alt="" class="icon-svg-sm" /></button>
					</div>
					<div class="toolbar-group">
						<button class="toolbar-btn {isBold ? 'is-active' : ''}" onclick={cmdBold} title="Bold" aria-label="Bold"><img src="/iconset/bold.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {isItalic ? 'is-active' : ''}" onclick={cmdItalic} title="Italic" aria-label="Italic"><img src="/iconset/italic.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {isUnderline ? 'is-active' : ''}" onclick={cmdUnderline} title="Underline" aria-label="Underline"><img src="/iconset/text.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {isStrike ? 'is-active' : ''}" onclick={cmdStrike} title="Strikethrough" aria-label="Strikethrough"><img src="/iconset/strikeThrough.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {isCode ? 'is-active' : ''}" onclick={cmdCode} title="Inline Code" aria-label="Inline Code"><img src="/iconset/codeSpan.svg" alt="" class="icon-svg-sm" /></button>
					</div>
					<div class="toolbar-group">
						<button class="toolbar-btn {isBulletList ? 'is-active' : ''}" onclick={cmdBulletList} title="Bullet List" aria-label="Bullet List"><img src="/iconset/bulletList.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {isOrderedList ? 'is-active' : ''}" onclick={cmdOrderedList} title="Ordered List" aria-label="Ordered List"><img src="/iconset/numberedList.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {isTaskList ? 'is-active' : ''}" onclick={cmdTaskList} title="Task List" aria-label="Task List"><img src="/iconset/task.svg" alt="" class="icon-svg-sm" /></button>
					</div>
					<div class="toolbar-group">
						<button class="toolbar-btn {isBlockquote ? 'is-active' : ''}" onclick={cmdBlockquote} title="Blockquote" aria-label="Blockquote"><img src="/iconset/text.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn {isCodeBlock ? 'is-active' : ''}" onclick={cmdCodeBlock} title="Code Block" aria-label="Code Block"><img src="/iconset/codeCell.svg" alt="" class="icon-svg-sm" /></button>
					</div>
					<div class="toolbar-group">
						<button class="toolbar-btn" onclick={cmdTable} title="Insert Table" aria-label="Insert Table"><img src="/iconset/table.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn" onclick={cmdLink} title="Insert Link" aria-label="Insert Link"><img src="/iconset/link.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn" onclick={cmdImage} title="Insert Image" aria-label="Insert Image"><img src="/iconset/image.svg" alt="" class="icon-svg-sm" /></button>
					</div>
					<div class="toolbar-group">
						<button class="toolbar-btn" onclick={cmdUndo} title="Undo" aria-label="Undo"><img src="/iconset/undo.svg" alt="" class="icon-svg-sm" /></button>
						<button class="toolbar-btn" onclick={cmdRedo} title="Redo" aria-label="Redo"><img src="/iconset/redo.svg" alt="" class="icon-svg-sm" /></button>
					</div>
				</div>
			{/if}
		</div>

		<div
			class="notes-editor-inside
				{viewMode === 'raw' ? 'view-raw' : ''}
				{viewMode === 'rich' ? 'view-rich' : ''}"
			style={`--split-ratio: ${viewMode === 'raw' ? '100%' : viewMode === 'rich' ? '0%' : localSplitRatio + '%'}`}
		>
			<!-- Raw markdown pane -->
			<div class="editor-left {viewMode === 'rich' ? 'hidden' : ''}">
				<textarea
					bind:this={rawTextarea}
					class="raw-textarea"
					value={content}
					oninput={handleRawInput}
					onkeydown={(e) => {
						if ((e.metaKey || e.ctrlKey) && e.key === 's') {
							e.preventDefault();
						}
					}}
					spellcheck="false"
					placeholder="Raw markdown..."
				></textarea>
			</div>

			<!-- Drag handle between raw and rich panes.
			     Drag is handled by window-level pointermove listeners attached by
			     the parent (NotesLayout) so the drag continues even when the
			     cursor leaves the handle's narrow hit area. -->
			{#if viewMode === 'split'}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="editor-split-handle"
					role="separator"
					aria-orientation="vertical"
					aria-label="Resize editor panes"
					aria-valuemin="20"
					aria-valuemax="80"
					aria-valuenow={localSplitRatio}
					tabindex="0"
					title="Drag to resize"
					onpointerdown={(e) => onSplitResize(e)}
					onkeydown={(e) => onSplitKeydown(e)}
				></div>
			{/if}

			<!-- Rich text pane -->
			<div class="editor-right {viewMode === 'raw' ? 'hidden' : ''}" style={viewMode === 'split' ? `width: calc(100% - var(--split-ratio) - 6px)` : ''}>
				{#if editorLoadError}
					<div class="notes-editor-load-error" role="alert">{editorLoadError}</div>
				{/if}
				<!-- Frontmatter banner (parsed from YAML frontmatter) -->
				{#if fmTitle || fmDescription || fmTags.length > 0}
					<div class="rich-text-frontmatter">
						{#if fmTitle}
							<h1 class="rich-text-fm-title">{fmTitle}</h1>
						{/if}
						{#if fmDescription}
							<p class="rich-text-fm-desc">{fmDescription}</p>
						{/if}
						{#if fmTags.length > 0}
							<div class="row gap8 wrap">
								{#each fmTags as tag, tagIndex (`${tag}-${tagIndex}`)}
									<span class="doc-tag-pill">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				<!-- Editor mount point -->
				<div bind:this={editorEl} class="rich-editor"></div>
			</div>
		</div>
	{:else}
		<div class="notes-empty-editor">
			<img src="/iconset/markdown.svg" alt="" class="empty-icon" />
			<h2 class="empty-title">
				{!hasVault ? 'Start your knowledge vault' : canCreateNote ? 'Create your first note' : 'Choose a folder'}
			</h2>
			<div class="empty-text">
				{#if !hasVault}
					Open a vault to browse and create Markdown notes.
				{:else if !canCreateNote}
					Select a folder in the vault to create or open a note.
				{:else}
					Select a note from the sidebar or create a new one.
				{/if}
			</div>
			{#if !hasVault}
				<button type="button" class="btn-app" onclick={onOpenVault}>Open Vault</button>
			{:else if canCreateNote}
				<button type="button" class="btn-app" onclick={onCreateNote}>New Note</button>
			{/if}
		</div>
	{/if}
</div>
