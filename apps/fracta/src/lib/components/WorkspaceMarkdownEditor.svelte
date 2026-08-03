<script lang="ts">
	import { onMount } from 'svelte';
	import { Editor, Mark, Node } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
	import TableCell from '@tiptap/extension-table-cell';
	import TableHeader from '@tiptap/extension-table-header';
	import TableRow from '@tiptap/extension-table-row';
	import TaskItem from '@tiptap/extension-task-item';
	import TaskList from '@tiptap/extension-task-list';
	import Underline from '@tiptap/extension-underline';
	import { htmlToMarkdown, markdownToEditorHtml, splitMarkdownDocument } from '$lib/markdown';

	let { content, onChange }: { content: string; onChange: (content: string) => void } = $props();
	let element = $state<HTMLDivElement>();
	let editor = $state<Editor>();
	let slashOpen = $state(false);
	let slashInserted = $state(false);
	let slashIndex = $state(0);
	let slashPosition = $state({ top: 0, left: 0 });
	let lastContent = '';
	let lastBody = '';
	let frontmatter = '';
	const slashCommands = [
		{ label: 'Heading 1', hint: 'Document title', action: 'heading1' },
		{ label: 'Heading 2', hint: 'Section heading', action: 'heading2' },
		{ label: 'Bullet list', hint: 'Unordered points', action: 'bullet' },
		{ label: 'Task list', hint: 'Checkboxes', action: 'task' },
		{ label: 'Table', hint: '3 × 3 table', action: 'table' },
		{ label: 'Code block', hint: 'Fenced code', action: 'code' },
		{ label: 'Quote', hint: 'Call out a passage', action: 'quote' },
		{ label: 'Callout', hint: 'Portable note block', action: 'callout' },
		{ label: 'Footnote', hint: 'Reference and definition', action: 'footnote' },
		{ label: 'Math', hint: 'Display math block', action: 'math' },
		{ label: 'Mermaid', hint: 'Diagram source block', action: 'mermaid' },
		{ label: 'Image / media', hint: 'Relative asset link', action: 'media' },
		{ label: 'File block', hint: 'PDF or attachment', action: 'attachment' },
		{ label: 'Transclusion', hint: 'Embed a local note', action: 'transclusion' },
		{ label: 'Tabs', hint: 'Portable tab group', action: 'tabs' },
		{ label: 'Accordion', hint: 'Collapsible section', action: 'accordion' }
	] as const;

	const FractaSourceMark = Mark.create({
		name: 'fractaSourceMark',
		parseHTML: () => [{ tag: 'span[data-fracta-source]' }],
		addAttributes: () => ({
			source: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute('data-fracta-source'), renderHTML: (attributes: { source?: string }) => attributes.source ? { 'data-fracta-source': attributes.source } : {} }
		}),
		renderHTML: ({ HTMLAttributes }) => ['span', HTMLAttributes, 0]
	});

	const FractaSourceBlock = Node.create({
		name: 'fractaSourceBlock',
		group: 'block',
		content: 'text*',
		code: true,
		defining: true,
		parseHTML: () => [{ tag: 'pre[data-fracta-source]' }],
		addAttributes: () => ({
			source: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute('data-fracta-source'), renderHTML: (attributes: { source?: string }) => attributes.source ? { 'data-fracta-source': attributes.source } : {} }
		}),
		renderHTML: ({ HTMLAttributes }) => ['pre', HTMLAttributes, ['code', 0]]
	});

	onMount(() => {
		const document = splitMarkdownDocument(content);
		frontmatter = document.prefix;
		lastBody = document.body;
		lastContent = content;
		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				FractaSourceMark,
				FractaSourceBlock,
				Underline,
				Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
				TaskList,
				TaskItem.configure({ nested: true }),
				Table.configure({ resizable: true }),
				TableRow,
				TableHeader,
				TableCell
			],
			content: markdownToEditorHtml(lastBody),
			onUpdate: ({ editor }) => {
				lastBody = htmlToMarkdown(editor.getHTML());
				lastContent = `${frontmatter}${lastBody}`;
				onChange(lastContent);
			},
			editorProps: {
				handleKeyDown: (_view, event) => {
					if (event.key === '/' && !slashOpen) {
						requestAnimationFrame(() => openSlash(true));
						return false;
					}
					if (!slashOpen) return false;
					if (event.key === 'ArrowDown') { event.preventDefault(); slashIndex = (slashIndex + 1) % slashCommands.length; return true; }
					if (event.key === 'ArrowUp') { event.preventDefault(); slashIndex = (slashIndex - 1 + slashCommands.length) % slashCommands.length; return true; }
					if (event.key === 'Escape') { event.preventDefault(); closeSlash(); return true; }
					if (event.key === 'Enter') { event.preventDefault(); applySlash(slashCommands[slashIndex].action); return true; }
					return false;
				}
			}
		});
		return () => editor?.destroy();
	});

	$effect(() => {
		if (editor && content !== lastContent) {
			const document = splitMarkdownDocument(content);
			frontmatter = document.prefix;
			lastBody = document.body;
			lastContent = content;
			editor.commands.setContent(markdownToEditorHtml(lastBody), { emitUpdate: false });
		}
	});

	function editLink() {
		if (!editor) return;
		const previous = editor.getAttributes('link').href as string | undefined;
		const href = window.prompt('Link URL', previous ?? 'https://');
		if (href === null) return;
		if (!href.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run();
		else editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
	}

	function openSlash(inserted = false) {
		if (!editor) return;
		const position = editor.state.selection.from;
		const coords = editor.view.coordsAtPos(position);
		slashPosition = { top: coords.bottom + 6, left: coords.left };
		slashIndex = 0;
		slashInserted = inserted;
		slashOpen = true;
	}

	function closeSlash() { slashOpen = false; slashInserted = false; editor?.commands.focus(); }

	function insertPortableBlock(template: string) {
		if (!editor) return;
		const source = slashInserted ? lastBody.replace(/\/\s*$/, '') : lastBody;
		const next = `${source.trimEnd()}${source.trim() ? '\n\n' : ''}${template}\n`;
		lastBody = next;
		lastContent = `${frontmatter}${next}`;
		editor.commands.setContent(markdownToEditorHtml(next), { emitUpdate: false });
		onChange(lastContent);
	}

	function applySlash(action: (typeof slashCommands)[number]['action']) {
		if (!editor) return;
		let chain = editor.chain().focus();
		if (slashInserted) {
			const from = editor.state.selection.from;
			chain = chain.deleteRange({ from: Math.max(1, from - 1), to: from });
		}
		if (action === 'callout') insertPortableBlock('> [!NOTE]\n> Add a concise note.');
		else if (action === 'footnote') insertPortableBlock('A reference[^1].\n\n[^1]: Add the supporting note.');
		else if (action === 'math') insertPortableBlock('```math\nE = mc^2\n```');
		else if (action === 'mermaid') insertPortableBlock('```mermaid\nflowchart LR\n  A[Idea] --> B[Connection]\n```');
		else if (action === 'media') insertPortableBlock('![Describe the media](assets/image.png)');
		else if (action === 'attachment') insertPortableBlock('![[document.pdf]]');
		else if (action === 'transclusion') insertPortableBlock('![[related-note]]');
		else if (action === 'tabs') insertPortableBlock(':::tabs\n::tab First\nFirst tab content.\n::tab Second\nSecond tab content.\n:::');
		else if (action === 'accordion') insertPortableBlock(':::accordion Details\nCollapsed supporting content.\n:::');
		else if (action === 'heading1') chain.toggleHeading({ level: 1 }).run();
		else if (action === 'heading2') chain.toggleHeading({ level: 2 }).run();
		else if (action === 'bullet') chain.toggleBulletList().run();
		else if (action === 'task') chain.toggleTaskList().run();
		else if (action === 'table') chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
		else if (action === 'code') chain.toggleCodeBlock().run();
		else chain.toggleBlockquote().run();
		slashOpen = false;
		slashInserted = false;
	}
</script>

<div class="workspace-richtext">
	<div class="workspace-richtext__toolbar" aria-label="Formatting toolbar">
		<button class:active={editor?.isActive('bold')} onclick={() => editor?.chain().focus().toggleBold().run()} aria-label="Bold"><strong>B</strong></button>
		<button class:active={editor?.isActive('italic')} onclick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Italic"><em>I</em></button>
		<button class:active={editor?.isActive('underline')} onclick={() => editor?.chain().focus().toggleUnderline().run()} aria-label="Underline"><u>U</u></button>
		<button class:active={editor?.isActive('heading', { level: 2 })} onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
		<button class:active={editor?.isActive('bulletList')} onclick={() => editor?.chain().focus().toggleBulletList().run()} aria-label="Bullet list">List</button>
		<button class:active={editor?.isActive('orderedList')} onclick={() => editor?.chain().focus().toggleOrderedList().run()} aria-label="Numbered list">1.</button>
		<button class:active={editor?.isActive('taskList')} onclick={() => editor?.chain().focus().toggleTaskList().run()} aria-label="Task list">Task</button>
		<button class:active={editor?.isActive('link')} onclick={editLink} aria-label="Add or edit link">Link</button>
		<button onclick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} aria-label="Insert table">Table</button>
		<button class:active={editor?.isActive('codeBlock')} onclick={() => editor?.chain().focus().toggleCodeBlock().run()} aria-label="Code block">Code</button>
		<button onclick={() => openSlash(false)} aria-label="Insert block">Insert</button>
	</div>
	<div class="workspace-richtext__canvas" bind:this={element}></div>
	{#if slashOpen}
		<div class="workspace-richtext__slash" style:top={`${slashPosition.top}px`} style:left={`${slashPosition.left}px`} role="listbox" aria-label="Insert block">
			{#each slashCommands as command, index}
				<button class:active={slashIndex === index} role="option" aria-selected={slashIndex === index} onmouseenter={() => slashIndex = index} onclick={() => applySlash(command.action)}><span>{command.label}</span><small>{command.hint}</small></button>
			{/each}
		</div>
	{/if}
</div>
