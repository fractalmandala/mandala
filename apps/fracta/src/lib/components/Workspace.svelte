<script lang="ts">
	import { onMount } from 'svelte';
	import { listen } from '@tauri-apps/api/event';
	import { workspace } from '$lib/state/workspace.svelte';
	import type { DocumentBlock, WorkspaceFileKind, WorkspaceItem } from '$lib/ipc';
	import WorkspaceMarkdownEditor from './WorkspaceMarkdownEditor.svelte';
	import JsonTreeEditor from './JsonTreeEditor.svelte';
	import JsonSourceEditor from './JsonSourceEditor.svelte';
	import PdfViewer from './PdfViewer.svelte';
	import DocxImage from './DocxImage.svelte';
	import WorkspaceTerminal from './WorkspaceTerminal.svelte';
	import AskPanel from './AskPanel.svelte';
	import KnowledgeGraph from './KnowledgeGraph.svelte';
	import RenderedMarkdown from './RenderedMarkdown.svelte';
	import { splitFrontmatter } from '$lib/markdown';
	import { insertCsvColumn, insertCsvRow, removeCsvColumn, removeCsvRow } from '$lib/utils/csv-grid';
	import { ask } from '$lib/state/ask.svelte';
	import { entries } from '$lib/state/entries.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { isTauri, previewWorkspaceDocument, printWorkspace, readWorkspaceFile, watchWorkspace } from '$lib/ipc';

	let view = $state<'source' | 'richtext' | 'grid' | 'tree' | 'preview'>('source');
	let documentQuery = $state('');
	let sourceQuery = $state('');
	let sourceWrap = $state(true);
	let sourceEditor = $state<HTMLTextAreaElement>();
	let pdfPage = $state(0);
	let gridFilter = $state('');
	let gridSelectedRow = $state(-1);
	let gridSelectedColumn = $state(-1);
	let gridScrollTop = $state(0);
	let navWidth = $state(264);
	let inspectorWidth = $state(288);
	let inspectorOpen = $state(false);
	let terminalOpen = $state(false);
	let terminalTrigger = $state<HTMLButtonElement>();
	let askTrigger = $state<HTMLButtonElement>();
	let askReturnFocus = $state<HTMLElement>();
	let workspaceAskWasOpen = false;
	let includeFrontmatter = $state(false);
	let inspectorTrigger = $state<HTMLButtonElement>();

	type DocxSection = { type: 'block'; block: DocumentBlock } | { type: 'list'; items: DocumentBlock[] };
	function docxSections(blocks: DocumentBlock[]): DocxSection[] {
		const sections: DocxSection[] = [];
		for (const block of blocks) {
			const previous = sections.at(-1);
			if (block.kind === 'list_item' && previous?.type === 'list') previous.items.push(block);
			else if (block.kind === 'list_item') sections.push({ type: 'list', items: [block] });
			else sections.push({ type: 'block', block });
		}
		return sections;
	}

	onMount(() => {
		void workspace.init();
		navWidth = Number(localStorage.getItem('fracta:workspace-nav')) || 264;
		inspectorWidth = Number(localStorage.getItem('fracta:workspace-inspector')) || 288;
		let disposed = false;
		let unlisten = () => {};
		if (isTauri()) {
			void watchWorkspace();
			void listen('workspace://changed', () => void workspace.refreshFromDisk()).then((stop) => {
				if (disposed) stop(); else unlisten = stop;
			});
		}
		const watcher = window.setInterval(() => void workspace.refreshFromDisk(), isTauri() ? 20_000 : 2_500);
		const keyboard = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && terminalOpen) { closeTerminal(); return; }
			if (event.key === 'Escape' && inspectorOpen) { closeInspector(); return; }
			if (event.key !== 'Tab' || (!inspectorOpen && !terminalOpen)) return;
			const sheet = document.querySelector<HTMLElement>(terminalOpen ? '.workspace-terminal' : '.workspace__inspector--open');
			const focusable = Array.from(sheet?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter((item) => !item.hasAttribute('disabled'));
			if (!focusable.length) return;
			const first = focusable[0], last = focusable.at(-1)!;
			if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
			else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
		};
		window.addEventListener('keydown', keyboard);
		return () => { disposed = true; unlisten(); window.clearInterval(watcher); window.removeEventListener('keydown', keyboard); };
	});

	function startResize(side: 'nav' | 'inspector', event: PointerEvent) {
		const start = event.clientX;
		const initial = side === 'nav' ? navWidth : inspectorWidth;
		const move = (moveEvent: PointerEvent) => {
			const delta = moveEvent.clientX - start;
			const value = Math.round(Math.max(200, Math.min(420, initial + (side === 'nav' ? delta : -delta))));
			if (side === 'nav') navWidth = value; else inspectorWidth = value;
		};
		const end = () => {
			localStorage.setItem(side === 'nav' ? 'fracta:workspace-nav' : 'fracta:workspace-inspector', String(side === 'nav' ? navWidth : inspectorWidth));
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', end);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', end, { once: true });
	}

	function closeInspector() {
		inspectorOpen = false;
		requestAnimationFrame(() => inspectorTrigger?.focus());
	}

	function openInspector() {
		inspectorOpen = true;
		requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.workspace__inspector--open .workspace__sheet-close')?.focus());
	}

	function closeTerminal() {
		terminalOpen = false;
		requestAnimationFrame(() => terminalTrigger?.focus());
	}

	function closeWorkspaceAsk() {
		ui.closeAsk();
	}

	function openTerminal() {
		terminalOpen = true;
		requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.workspace-terminal header button')?.focus());
	}

	$effect(() => {
		workspace.active?.path;
		pdfPage = 0;
		documentQuery = '';
		sourceQuery = '';
		gridScrollTop = 0;
	});

	$effect(() => {
		if (ui.askOpen && !workspaceAskWasOpen) {
			askReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : askTrigger;
		}
		if (!ui.askOpen && workspaceAskWasOpen) {
			requestAnimationFrame(() => askReturnFocus?.focus());
		}
		workspaceAskWasOpen = ui.askOpen;
	});

	function indent(path: string) {
		return `${path.split('/').length - 1}rem`;
	}

	function icon(kind: WorkspaceFileKind) {
		return { folder: '⌁', markdown: 'M', text: 'T', csv: '▦', json: '{}', pdf: 'PDF', docx: 'DOC', asset: '•' }[kind];
	}

	function delimiter(content = workspace.active?.content ?? '') {
		const fallback = workspace.active?.path.toLowerCase().endsWith('.tsv') ? '\t' : ',';
		const counts = new Map([[';', 0], [',', 0], ['\t', 0], ['|', 0]]);
		let quoted = false;
		for (let index = 0; index < content.length; index++) {
			const character = content[index];
			if (character === '"') { if (quoted && content[index + 1] === '"') index++; else quoted = !quoted; }
			else if (!quoted && (character === '\n' || character === '\r')) break;
			else if (!quoted && counts.has(character)) counts.set(character, (counts.get(character) ?? 0) + 1);
		}
		const detected = [...counts].sort((left, right) => right[1] - left[1])[0];
		return detected?.[1] ? detected[0] : fallback;
	}

	function parseRows(content: string, separator = delimiter()) {
		const rows: string[][] = [[]];
		let cell = '', quoted = false;
		for (let index = 0; index < content.length; index++) {
			const char = content[index];
			if (char === '"') {
				if (quoted && content[index + 1] === '"') { cell += '"'; index++; } else quoted = !quoted;
			} else if (char === separator && !quoted) { rows.at(-1)?.push(cell); cell = ''; }
			else if ((char === '\n' || char === '\r') && !quoted) {
				if (char === '\r' && content[index + 1] === '\n') index++;
				rows.at(-1)?.push(cell); rows.push([]); cell = '';
			} else cell += char;
		}
		if (cell || rows.at(-1)?.length) rows.at(-1)?.push(cell);
		return rows.filter((row) => row.length > 0);
	}

	function hasMalformedCsvQuotes(content: string) {
		let quoted = false;
		for (let index = 0; index < content.length; index++) {
			if (content[index] !== '"') continue;
			if (quoted && content[index + 1] === '"') { index++; continue; }
			quoted = !quoted;
		}
		return quoted;
	}


	function csvContent(rows: string[][], separator = delimiter()) {
		const needsQuote = new RegExp(`["${separator}\\r\\n]`);
		const original = workspace.active?.content ?? '';
		const newline = workspace.active?.newline === 'crlf' ? '\r\n' : workspace.active?.newline === 'cr' ? '\r' : original.includes('\r\n') ? '\r\n' : '\n';
		// The Rust writer preserves a pre-existing BOM and encoding. Keep the final
		// record terminator independently too: a missing terminal newline is a real
		// part of many generated CSV dialects and should not appear after a grid edit.
		const ending = /(?:\r\n|\r|\n)$/.test(original) ? newline : '';
		return `${rows.map((row) => row.map((cell) => needsQuote.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell).join(separator)).join(newline)}${ending}`;
	}

	function updateGridCell(row: number, column: number, value: string) {
		if (hasMalformedCsvQuotes(workspace.active?.content ?? '')) { workspace.error = 'This CSV has an unterminated quoted field. Correct it in Raw CSV before editing the grid.'; return; }
		const rows = parseRows(workspace.active?.content ?? '');
		if (!rows[row]) return;
		rows[row][column] = value;
		workspace.setContent(csvContent(rows));
	}

	function pasteGrid(event: ClipboardEvent, startRow: number, startColumn: number) {
		const text = event.clipboardData?.getData('text/plain') ?? '';
		if (!text.includes('\t') && !text.includes('\n')) return;
		event.preventDefault();
		const pasted = parseRows(text.replace(/\r?\n$/, ''), '\t');
		mutateGrid((rows) => {
			for (const [rowOffset, pastedRow] of pasted.entries()) {
				const row = rows[startRow + rowOffset];
				if (!row) break;
				for (const [columnOffset, value] of pastedRow.entries()) {
					if (startColumn + columnOffset < row.length) row[startColumn + columnOffset] = value;
				}
			}
		});
	}

	async function copyGridSelection() {
		const rows = parseRows(workspace.active?.content?.replace(/^\uFEFF/, '') ?? '');
		if (!rows.length) return;
		const row = gridSelectedRow >= 0 ? rows[gridSelectedRow] : undefined;
		if (!row) { workspace.error = 'Select a grid row or cell to copy.'; return; }
		const content = gridSelectedColumn >= 0 ? (row[gridSelectedColumn] ?? '') : row.join('\t');
		try { await navigator.clipboard.writeText(content); workspace.notice = gridSelectedColumn >= 0 ? 'Copied the selected cell.' : 'Copied the selected row.'; }
		catch { workspace.error = 'Could not copy the grid selection.'; }
	}

	function navigateGrid(event: KeyboardEvent, row: number, column: number) {
		const direction = event.key === 'ArrowUp' ? [-1, 0] : event.key === 'ArrowDown' ? [1, 0] : event.key === 'ArrowLeft' ? [0, -1] : event.key === 'ArrowRight' ? [0, 1] : null;
		if (!direction) return;
		const nextRow = row + direction[0];
		const nextColumn = column + direction[1];
		const selector = `[data-grid-row="${nextRow}"][data-grid-column="${nextColumn}"]`;
		const next = document.querySelector<HTMLInputElement>(selector);
		if (!next) return;
		event.preventDefault();
		gridSelectedRow = nextRow;
		next.focus();
	}

	function mutateGrid(mutator: (rows: string[][]) => void) {
		if (hasMalformedCsvQuotes(workspace.active?.content ?? '')) { workspace.error = 'This CSV has an unterminated quoted field. Correct it in Raw CSV before editing the grid.'; return; }
		const rows = parseRows(workspace.active?.content?.replace(/^\uFEFF/, '') ?? '');
		mutator(rows);
		workspace.setContent(csvContent(rows));
	}

	function addRow() {
		mutateGrid((rows) => {
			gridSelectedRow = insertCsvRow(rows, gridSelectedRow);
			gridSelectedColumn = 0;
		});
	}
	function removeRow() {
		if (gridSelectedRow <= 0) { workspace.error = 'Select a data row to remove.'; return; }
		mutateGrid((rows) => {
			const next = removeCsvRow(rows, gridSelectedRow);
			if (next !== null) gridSelectedRow = next;
		});
	}
	function addColumn() {
		mutateGrid((rows) => {
			gridSelectedColumn = insertCsvColumn(rows, gridSelectedColumn);
		});
	}
	function removeColumn() {
		if (gridSelectedColumn < 0) { workspace.error = 'Select a column to remove.'; return; }
		mutateGrid((rows) => {
			const next = removeCsvColumn(rows, gridSelectedColumn);
			if (next !== null) gridSelectedColumn = next;
		});
	}
	function moveRow(direction: -1 | 1) {
		if (gridSelectedRow <= 0) return;
		mutateGrid((rows) => {
			const next = gridSelectedRow + direction;
			if (next <= 0 || next >= rows.length) return;
			[rows[gridSelectedRow], rows[next]] = [rows[next], rows[gridSelectedRow]];
			gridSelectedRow = next;
		});
	}
	function moveColumn(direction: -1 | 1) {
		if (gridSelectedColumn < 0) return;
		mutateGrid((rows) => {
			const next = gridSelectedColumn + direction;
			if (next < 0 || next >= (rows[0]?.length ?? 0)) return;
			for (const row of rows) [row[gridSelectedColumn], row[next]] = [row[next], row[gridSelectedColumn]];
			gridSelectedColumn = next;
		});
	}

	function mutateJson(mutator: (value: Record<string, unknown> | unknown[]) => void) {
		try {
			const value = JSON.parse(workspace.active?.content ?? '{}');
			if (!Array.isArray(value) && (value === null || typeof value !== 'object')) throw new Error('Root must be an object or array.');
			mutator(value);
			workspace.setContent(JSON.stringify(value, null, 2));
		} catch (error) { workspace.error = error instanceof Error ? error.message : 'Cannot edit invalid JSON.'; }
	}

	function addJsonValue() {
		mutateJson((value) => {
			if (Array.isArray(value)) value.push(null);
			else {
				const key = window.prompt('Property name');
				if (key?.trim()) value[key.trim()] = null;
			}
		});
	}

	function renameJsonKey() {
		mutateJson((value) => {
			if (Array.isArray(value)) { workspace.error = 'Array items do not have property names to rename.'; return; }
			const from = window.prompt('Existing root property name');
			if (!from || !(from in value)) return;
			const to = window.prompt('New property name', from);
			if (!to?.trim() || to === from) return;
			value[to.trim()] = value[from];
			delete value[from];
		});
	}

	function deleteJsonValue() {
		mutateJson((value) => {
			if (Array.isArray(value)) {
				const index = Number(window.prompt('Array index to remove'));
				if (Number.isInteger(index) && index >= 0 && index < value.length) value.splice(index, 1);
			} else {
				const key = window.prompt('Root property name to remove');
				if (key && key in value) delete value[key];
			}
		});
	}

	function moveJsonArrayValue(direction: -1 | 1) {
		mutateJson((value) => {
			if (!Array.isArray(value)) { workspace.error = 'Root object properties preserve their source order; array items can be reordered.'; return; }
			const index = Number(window.prompt('Array index to move'));
			const next = index + direction;
			if (Number.isInteger(index) && index >= 0 && next >= 0 && index < value.length && next < value.length) [value[index], value[next]] = [value[next], value[index]];
		});
	}

	async function copyJsonPath() {
		try {
			const value = JSON.parse(workspace.active?.content ?? '{}');
			const segment = Array.isArray(value) ? Number(window.prompt('Array index')) : window.prompt('Root property name');
			if (segment === null || segment === '' || Number.isNaN(segment)) return;
			const path = Array.isArray(value) ? `$[${segment}]` : `$[${JSON.stringify(segment)}]`;
			await navigator.clipboard.writeText(path);
			workspace.notice = `Copied JSON path ${path}`;
		} catch { workspace.error = 'Correct the JSON source before copying a JSON path.'; }
	}

	function changeJsonType() {
		mutateJson((value) => {
			if (Array.isArray(value)) { workspace.error = 'Choose a root object property to change its type.'; return; }
			const key = window.prompt('Root property name');
			if (!key || !(key in value)) return;
			const kind = window.prompt('New type: string, number, boolean, null, object, array', 'string')?.toLowerCase();
			if (kind === 'string') value[key] = '';
			else if (kind === 'number') value[key] = 0;
			else if (kind === 'boolean') value[key] = false;
			else if (kind === 'null') value[key] = null;
			else if (kind === 'object') value[key] = {};
			else if (kind === 'array') value[key] = [];
			else if (kind) workspace.error = 'Type must be string, number, boolean, null, object, or array.';
		});
	}

	function formatJson(compact = false) {
		try { workspace.setContent(JSON.stringify(JSON.parse(workspace.active?.content ?? '{}'), null, compact ? undefined : 2)); }
		catch { workspace.error = 'Correct the JSON source before formatting it.'; }
	}

	function findInSource() {
		const editor = sourceEditor;
		const query = sourceQuery.trim().toLowerCase();
		if (!editor || !query) return;
		const text = editor.value.toLowerCase();
		const start = editor.selectionEnd;
		const match = text.indexOf(query, start);
		const index = match >= 0 ? match : text.indexOf(query);
		if (index < 0) { workspace.notice = `No matches for “${sourceQuery.trim()}”.`; return; }
		editor.focus();
		editor.setSelectionRange(index, index + query.length);
		workspace.notice = `Selected a match for “${sourceQuery.trim()}”.`;
	}

	function filteredGridRows() {
		const rows = parseRows(workspace.active?.content?.replace(/^\uFEFF/, '') ?? '');
		const query = gridFilter.trim().toLowerCase();
		return rows.map((row, index) => ({ row, index })).filter(({ row, index }) => index === 0 || !query || row.some((cell) => cell.toLowerCase().includes(query)));
	}

	function virtualGridRows() {
		const rows = filteredGridRows();
		const header = rows[0];
		const data = rows.slice(1);
		if (data.length <= 120) return { header, rows: data, before: 0, after: 0 };
		const rowHeight = 39;
		const start = Math.max(0, Math.floor(gridScrollTop / rowHeight) - 10);
		const count = 64;
		const end = Math.min(data.length, start + count);
		return { header, rows: data.slice(start, end), before: start * rowHeight, after: (data.length - end) * rowHeight };
	}

	function formattedJson(content: string | null | undefined) {
		try {
			return JSON.stringify(JSON.parse(content ?? '{}'), null, 2);
		} catch {
			return 'This JSON has source errors. Switch to Source to correct them.';
		}
	}

	function jsonParseError(content: string | null | undefined) {
		try { JSON.parse(content ?? ''); return null; }
		catch (error) { return error instanceof Error ? error.message : 'Invalid JSON source.'; }
	}

	function exportPdf() {
		view = 'preview';
		workspace.notice = 'Review the print preview, then choose Print / Save as PDF.';
	}

	async function printPdf() {
		// Two frames let the dedicated preview finish painting before the platform
		// print surface snapshots it. The destination remains user-controlled.
		if (isTauri()) {
			try { await printWorkspace(); return; }
			catch { /* Platforms without a native runtime print surface use WebView print. */ }
		}
		requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
	}

	function renameActive() {
		if (!workspace.active) return;
		const path = window.prompt('Project-relative name or path', workspace.active.path);
		if (path) void workspace.renameActive(path);
	}

	function deleteActive() {
		if (workspace.active && window.confirm(`Move “${workspace.active.path}” to the system Trash?`)) void workspace.deleteActive();
	}

	function createFromTemplate() {
		if (!workspace.templates.length) { workspace.error = 'Add Markdown templates under templates/ to use this action.'; return; }
		const choices = workspace.templates.map((template, index) => `${index + 1}. ${template.path}`).join('\n');
		const picked = window.prompt(`Choose a template:\n${choices}`, '1');
		const template = workspace.templates[Number(picked) - 1];
		if (!template) return;
		const destination = window.prompt('New project-relative Markdown path', 'untitled.md');
		if (destination) void workspace.createFromTemplate(template.path, destination);
	}

	function createFolder() {
		const path = window.prompt('New project-relative folder path', 'folder');
		if (path) void workspace.createFolder(path);
	}

	function manageFolder(path: string) {
		const action = window.prompt(`Manage “${path}”: type rename or trash`, 'rename')?.trim().toLowerCase();
		if (action === 'rename') {
			const destination = window.prompt('New project-relative folder path', path);
			if (destination?.trim()) void workspace.movePath(path, destination.trim());
		} else if (action === 'trash' && window.confirm(`Move folder “${path}” and its contents to the system Trash?`)) {
			void workspace.deletePath(path);
		}
	}

	async function switchProject() {
		if (workspace.dirty && !window.confirm('Save or discard the current unsaved workspace changes before switching projects. Continue?')) return;
		await entries.chooseVault();
		await workspace.init();
		if (isTauri()) void watchWorkspace();
	}

	function saveAsTemplate() {
		const path = window.prompt('Template name or templates/ path', 'new-template.md');
		if (path) void workspace.saveActiveAsTemplate(path);
	}

	function askAboutActive() {
		const content = workspace.active?.content ?? workspace.preview?.text;
		if (!workspace.active || !content) { workspace.error = 'This attachment has no extractable workspace context yet.'; return; }
		ask.setWorkspaceContext(workspace.active.path, content);
		ui.openAsk();
	}

	async function askSourceFor(item: WorkspaceItem) {
		if (item.kind === 'pdf' || item.kind === 'docx') {
			const preview = await previewWorkspaceDocument(item.path);
			return { path: item.path, content: preview.text };
		}
		const file = await readWorkspaceFile(item.path);
		return file.content === null ? null : { path: file.path, content: file.content };
	}

	async function askAboutFolder() {
		if (!workspace.active || !isTauri()) return;
		const folder = workspace.active.path.includes('/') ? workspace.active.path.slice(0, workspace.active.path.lastIndexOf('/')) : '';
		const readable = workspace.items.filter((item) => ['markdown', 'text', 'csv', 'json', 'pdf', 'docx'].includes(item.kind)).filter((item) => !folder || item.path.startsWith(`${folder}/`)).slice(0, 16);
		try {
			const files = await Promise.all(readable.map(askSourceFor));
			ask.setWorkspaceSources(folder || 'Workspace root', files.filter((file): file is { path: string; content: string } => file !== null && Boolean(file.content)));
			ui.openAsk();
		} catch (error) { workspace.error = error instanceof Error ? error.message : 'Could not gather this folder for Ask.'; }
	}

	async function askAboutSearchResults() {
		if (!isTauri() || !workspace.query.trim() || !workspace.searchHits.length) return;
		try {
			const items = workspace.searchHits.slice(0, 8).map((hit) => ({ path: hit.path, name: hit.path.split('/').at(-1) ?? hit.path, kind: hit.kind, size: 0, modified_at: 0 }));
			const files = await Promise.all(items.map(askSourceFor));
			ask.setWorkspaceSources(`Search: ${workspace.query.trim()}`, files.filter((file): file is { path: string; content: string } => file !== null && Boolean(file.content)));
			ui.openAsk();
		} catch (error) { workspace.error = error instanceof Error ? error.message : 'Could not gather search results for Ask.'; }
	}

	function askAboutSelection() {
		const selection = window.getSelection()?.toString().trim();
		if (!workspace.active || !selection) { workspace.error = 'Select text in the active document before asking about a selection.'; return; }
		ask.setWorkspaceContext(`${workspace.active.path} (selected text)`, selection);
		ui.openAsk();
	}

	async function copyAgentHandoff() {
		if (!workspace.active || !entries.status.path) { workspace.error = 'Open a workspace document before creating an agent handoff.'; return; }
		const selected = window.getSelection()?.toString().trim();
		const vault = entries.status.path;
		const context = selected ? `\nSelected text:\n${selected}` : '';
		const handoff = `Fracta local workspace handoff\nVault: ${vault}\nActive file: ${workspace.active.path}${context}\n\nMCP server configuration:\n${JSON.stringify({ mcpServers: { fracta: { command: 'fracta-mcp', args: ['--vault', vault] } } }, null, 2)}\n\nUse the Fracta MCP tools for contained workspace reads, search, links, structured files, and edits. Cite local paths in your response.`;
		try { await navigator.clipboard.writeText(handoff); workspace.notice = 'Copied an installed-agent handoff with local MCP configuration.'; }
		catch { workspace.error = 'Could not copy the agent handoff to the clipboard.'; }
	}

	function resolvedCsvHeaders() {
		const source = workspace.active?.content ?? '';
		if (hasMalformedCsvQuotes(source)) {
			workspace.error = 'Correct the malformed quoted field in Raw CSV before converting.';
			return null;
		}
		const separator = delimiter(source);
		const rows = parseRows(source, separator);
		if (!rows[0]?.length) {
			workspace.error = 'CSV conversion needs a header row.';
			return null;
		}
		const used = new Set<string>();
		let resolved = false;
		for (const [index, original] of rows[0].entries()) {
			const header = original.trim();
			if (header && !used.has(header)) { used.add(header); continue; }
			resolved = true;
			const reason = header ? `duplicates “${header}”` : 'is empty';
			let suggestion = header ? `${header}_${index + 1}` : `column_${index + 1}`;
			while (used.has(suggestion)) suggestion = `${suggestion}_2`;
			while (true) {
				const answer = window.prompt(`Header ${index + 1} ${reason}. Enter a unique column name for this conversion.`, suggestion);
				if (answer === null) return null;
				const candidate = answer.trim();
				if (!candidate) { window.alert('A column name cannot be empty.'); continue; }
				if (used.has(candidate)) { window.alert(`“${candidate}” is already used. Choose a unique name.`); continue; }
				rows[0][index] = candidate;
				used.add(candidate);
				break;
			}
		}
		return resolved ? csvContent(rows, separator) : source;
	}

	function convertCsv() {
		const inferTypes = window.confirm('Infer numbers and booleans?\n\nChoose Cancel to preserve every CSV cell as a string (recommended for identifiers and leading zeroes).');
		const source = resolvedCsvHeaders();
		if (source !== null) void workspace.convertActive('json', inferTypes, delimiter(source), source);
	}

	function visibleDocumentText() {
		const pages = workspace.preview?.page_texts;
		return pages ? pages[pdfPage] ?? '' : workspace.preview?.text ?? '';
	}

	function matchingPages() {
		const pages = workspace.preview?.page_texts ?? [];
		const query = documentQuery.trim().toLowerCase();
		return query ? pages.map((page, index) => page.toLowerCase().includes(query) ? index : -1).filter((index) => index >= 0) : [];
	}

	function documentMatchCount() {
		const query = documentQuery.trim().toLowerCase();
		if (!query || workspace.preview?.page_texts) return 0;
		return workspace.preview?.text.toLowerCase().split(query).length ? workspace.preview.text.toLowerCase().split(query).length - 1 : 0;
	}

	function escapeHtml(value: string) {
		return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
	}

	function highlightedDocumentText(value: string) {
		const query = documentQuery.trim();
		if (!query) return escapeHtml(value);
		const expression = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		return value.split(expression).map((part, index) => index % 2 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)).join('');
	}
</script>

<section class="workspace" style={`--workspace-nav: ${navWidth}px; --workspace-inspector: ${inspectorWidth}px`} aria-label="Workspace">
	<aside class="workspace__nav">
		<div class="workspace__navhead">
			<label class="workspace__search">
				<span>⌕</span>
				<input bind:value={workspace.query} onkeydown={(event) => event.key === 'Enter' && workspace.searchContent()} placeholder="Search files and content" aria-label="Search workspace files and content" />
			</label>
			<button class="workspace__search-action" onclick={() => workspace.searchContent()} aria-label="Search document content">⌕</button>
			<button class="workspace__new" onclick={() => workspace.createMarkdown()} title="New Markdown document">New</button>
			<button class="workspace__new" onclick={createFolder} title="New folder">Folder</button>
			<button class="workspace__new" onclick={createFromTemplate} title="New document from template">Template</button>
			<button class="workspace__new" onclick={() => workspace.rebuildIndex()} title="Rebuild local search index">Reindex</button>
			<button class="workspace__new" onclick={() => void switchProject()} title="Choose another workspace folder">Project</button>
		</div>
		{#if workspace.searchHits.length}
			<div class="workspace__results" aria-label="Content search results">
				<button class="workspace__results-ask" onclick={() => void askAboutSearchResults()}>Ask these {Math.min(workspace.searchHits.length, 8)} results</button>
				{#each workspace.searchHits as hit (hit.path)}
					<button onclick={() => workspace.open(hit.path)}><strong>{hit.title}</strong><span>{hit.path}</span><small>{@html hit.excerpt}</small></button>
				{/each}
			</div>
		{/if}
		<div class="workspace__tree" aria-busy={workspace.loading}>
			{#each workspace.visibleItems as item (item.path)}
				<button
					class="workspace__file"
					class:workspace__file--active={workspace.active?.path === item.path}
					class:workspace__file--folder={item.kind === 'folder'}
					style:padding-left={`calc(12px + ${indent(item.path)})`}
					aria-label={`${item.kind} ${item.name}`}
					aria-current={workspace.active?.path === item.path ? 'page' : undefined}
					onclick={() => item.kind !== 'folder' ? workspace.open(item.path) : workspace.notice = `Folder “${item.path}”. Use its context menu to rename or move it to Trash.`}
					oncontextmenu={(event) => { if (item.kind === 'folder') { event.preventDefault(); manageFolder(item.path); } }}
					title={item.kind === 'folder' ? 'Context-click to manage this folder' : undefined}
				>
					<span class="workspace__kind">{icon(item.kind)}</span><span>{item.name}</span>
				</button>
			{:else}
				<p class="workspace__empty">{workspace.loading ? 'Loading files…' : 'No files yet.'}</p>
			{/each}
		</div>
	</aside>
	<button class="workspace__resize workspace__resize--nav" style:left={`${navWidth - 3}px`} onpointerdown={(event) => startResize('nav', event)} aria-label="Resize navigator"></button>

	<main class="workspace__canvas">
		{#if workspace.error}
			<p class="workspace__error" role="alert">{workspace.error}</p>
		{/if}
		{#if workspace.notice}
			<p class="workspace__notice" role="status">{workspace.notice}</p>
		{/if}
		{#if workspace.active}
			<header class="workspace__header">
				<div><p class="workspace__eyebrow">{workspace.active.kind}{workspace.active.encoding ? ` · ${workspace.active.encoding.toUpperCase()}` : ''}{workspace.active.newline ? ` · ${workspace.active.newline.toUpperCase()}` : ''}</p><h1>{workspace.active.path}</h1></div>
				<div class="workspace__actions">
					<button bind:this={terminalTrigger} onclick={openTerminal}>Terminal</button>
					<button class="workspace__inspector-toggle" bind:this={inspectorTrigger} onclick={openInspector}>Inspector</button>
					<button bind:this={askTrigger} onclick={askAboutActive} disabled={!workspace.active.content && !workspace.preview?.text}>Ask document</button><button onclick={() => void askAboutFolder()}>Ask folder</button><button onclick={() => void copyAgentHandoff()}>Agent handoff</button>
					<button onclick={askAboutSelection}>Ask selection</button>
					<button onclick={() => workspace.revealActive()}>Reveal</button>
					<button onclick={() => workspace.openActiveExternally()}>Open external</button>
					<button onclick={renameActive}>Rename</button>
					<button onclick={() => workspace.duplicateActive()}>Duplicate</button>
					<button class="workspace__danger" onclick={deleteActive}>Trash</button>
					{#if workspace.active.kind === 'markdown'}
						<button onclick={saveAsTemplate}>Save as template</button>
						<button class:active={view === 'richtext'} onclick={() => view = 'richtext'}>Write</button>
						<button class:active={view === 'source'} onclick={() => view = 'source'}>Source</button>
						<button class:active={view === 'preview'} onclick={() => view = 'preview'}>Preview</button>
						<button class:active={includeFrontmatter} onclick={() => includeFrontmatter = !includeFrontmatter}>Frontmatter</button>
						<button onclick={exportPdf}>Preview PDF</button>
						{#if view === 'preview'}<button class="workspace__new" onclick={() => void printPdf()}>Print / Save as PDF</button>{/if}
					{/if}
					{#if workspace.active.kind === 'csv'}
						<button class:active={view === 'grid'} onclick={() => view = 'grid'}>Grid</button>
						<button class:active={view === 'source'} onclick={() => view = 'source'}>Raw CSV</button>
						{#if view === 'grid'}<button onclick={() => void copyGridSelection()}>Copy selection</button><button onclick={addRow}>+ Row</button><button onclick={removeRow} disabled={gridSelectedRow <= 0}>− Row</button><button onclick={() => moveRow(-1)} disabled={gridSelectedRow <= 1}>↑ Row</button><button onclick={() => moveRow(1)} disabled={gridSelectedRow <= 0}>↓ Row</button><button onclick={addColumn}>+ Column</button><button onclick={removeColumn} disabled={gridSelectedColumn < 0}>− Column</button><button onclick={() => moveColumn(-1)} disabled={gridSelectedColumn <= 0}>← Column</button><button onclick={() => moveColumn(1)} disabled={gridSelectedColumn < 0}>→ Column</button>{/if}
						<button onclick={convertCsv}>CSV → JSON</button>
					{/if}
					{#if workspace.active.kind === 'json'}
						<button class:active={view === 'tree'} onclick={() => view = 'tree'}>Tree</button>
						<button class:active={view === 'source'} onclick={() => view = 'source'}>Source</button>
						<button onclick={() => formatJson(false)}>Format</button><button onclick={() => formatJson(true)}>Minify</button>
						<button onclick={() => workspace.convertActive('csv')}>JSON → CSV</button>
					{/if}
					{#if !workspace.active.read_only}<button onclick={() => workspace.save()} disabled={workspace.saving}>{workspace.saving ? 'Saving…' : 'Save'}</button>{/if}
				</div>
			</header>
			{#if workspace.links}
				<aside class="workspace__links" aria-label="Document links">
					<span>{workspace.links.orphan ? 'Orphan document' : `${workspace.links.backlinks.length} backlinks`}</span>
					{#if workspace.links.dead.length}<span class="workspace__links--dead">{workspace.links.dead.length} dead link{workspace.links.dead.length === 1 ? '' : 's'}</span>{/if}
					{#each workspace.links.backlinks.slice(0, 3) as link}<button onclick={() => workspace.open(link)}>← {link}</button>{/each}
				</aside>
			{/if}
			{#if workspace.active.read_only}
				{#if workspace.preview}
					<section class="workspace__document" aria-label={`${workspace.active.kind} document preview`}>
						<header><strong>{workspace.active.kind.toUpperCase()} preview</strong>{#if workspace.preview.pages}<span>{workspace.preview.pages} pages</span>{/if}</header>
						{#if workspace.preview.warning}<p class="workspace__document-warning">{workspace.preview.warning}</p>{/if}
						{#if workspace.preview.docx_blocks}
							<div class="workspace__document-controls"><input bind:value={documentQuery} placeholder="Find in document" aria-label="Find in document" />{#if documentMatchCount()}<span>{documentMatchCount()} matches</span>{/if}</div>
							<article class="workspace__docx-body">
								{#each docxSections(workspace.preview.docx_blocks) as section}
									{#if section.type === 'list'}
										<ul>{#each section.items as item}<li>{@html highlightedDocumentText(item.text)}</li>{#if item.images}{#each item.images as archivePath (archivePath)}<DocxImage path={workspace.active.path} {archivePath} />{/each}{/if}{/each}</ul>
									{:else}
										{@const block = section.block}
									{#if block.kind === 'heading' && block.level === 1}<h1>{@html highlightedDocumentText(block.text)}</h1>
									{:else if block.kind === 'heading' && block.level === 2}<h2>{@html highlightedDocumentText(block.text)}</h2>
									{:else if block.kind === 'heading'}<h3>{@html highlightedDocumentText(block.text)}</h3>
									{:else if block.kind === 'table' && block.rows}<div class="workspace__docx-table-wrap"><table><tbody>{#each block.rows as row, rowIndex}<tr>{#each row as cell}{#if rowIndex === 0}<th scope="col">{@html highlightedDocumentText(cell)}</th>{:else}<td>{@html highlightedDocumentText(cell)}</td>{/if}{/each}</tr>{/each}</tbody></table></div>
									{:else if block.href}<p><a href={block.href} target="_blank" rel="noreferrer">{@html highlightedDocumentText(block.text)}</a></p>
									{:else if block.text}<p>{@html highlightedDocumentText(block.text)}</p>{/if}
									{#if block.images}{#each block.images as archivePath (archivePath)}<DocxImage path={workspace.active.path} {archivePath} />{/each}{/if}
									{/if}
								{/each}
							</article>
						{:else if workspace.preview.page_texts}
							<div class="workspace__document-controls"><input bind:value={documentQuery} placeholder="Find in PDF" aria-label="Find in PDF" />{#if matchingPages().length}<span>{matchingPages().length} matching pages</span>{/if}</div>
							<PdfViewer path={workspace.active.path} pageTexts={workspace.preview.page_texts} query={documentQuery} />
						{:else}
							<div class="workspace__document-controls"><input bind:value={documentQuery} placeholder="Find in document" aria-label="Find in document" />{#if documentMatchCount()}<span>{documentMatchCount()} matches</span>{/if}</div>
						{/if}
						{#if !workspace.preview.page_texts && !workspace.preview.docx_blocks}<pre>{visibleDocumentText() || 'No extractable text was found in this document.'}</pre>{/if}
					</section>
				{:else}
					<div class="workspace__readonly"><strong>{workspace.active.kind.toUpperCase()} preview</strong><p>This file is safely indexed as a read-only attachment.</p></div>
				{/if}
			{:else if (workspace.active.kind === 'csv' || workspace.active.path.toLowerCase().endsWith('.tsv')) && view === 'grid'}
				{#if hasMalformedCsvQuotes(workspace.active.content ?? '')}<section class="workspace__readonly"><strong>Malformed CSV source</strong><p>An unterminated quoted field was detected. Fracta will not rewrite this file from the grid; correct it in Raw CSV first.</p><button onclick={() => view = 'source'}>Open Raw CSV</button></section>
				{:else}{@const virtualRows = virtualGridRows()}
					<div class="workspace__gridwrap" onscroll={(event) => gridScrollTop = event.currentTarget.scrollTop}><label class="workspace__grid-filter">Filter rows <input bind:value={gridFilter} placeholder="Match any cell" /></label><table class="workspace__grid"><tbody>{#if virtualRows.header}<tr class="workspace__grid-header">{#each virtualRows.header.row as value, columnIndex (columnIndex)}<td class:workspace__grid-column-selected={gridSelectedColumn === columnIndex}><input data-grid-row={virtualRows.header.index} data-grid-column={columnIndex} value={value} onfocus={() => { gridSelectedRow = virtualRows.header.index; gridSelectedColumn = columnIndex; }} oninput={(event) => updateGridCell(virtualRows.header.index, columnIndex, event.currentTarget.value)} onpaste={(event) => pasteGrid(event, virtualRows.header.index, columnIndex)} onkeydown={(event) => navigateGrid(event, virtualRows.header.index, columnIndex)} aria-label={`Header, column ${columnIndex + 1}`} /></td>{/each}</tr>{/if}{#if virtualRows.before}<tr class="workspace__grid-spacer"><td colspan={virtualRows.header?.row.length ?? 1} style:height={`${virtualRows.before}px`}></td></tr>{/if}{#each virtualRows.rows as { row, index: rowIndex } (rowIndex)}<tr class:workspace__grid-selected={rowIndex === gridSelectedRow} onclick={() => gridSelectedRow = rowIndex}>{#each row as value, columnIndex (columnIndex)}<td class:workspace__grid-column-selected={gridSelectedColumn === columnIndex}><input data-grid-row={rowIndex} data-grid-column={columnIndex} value={value} onfocus={() => { gridSelectedRow = rowIndex; gridSelectedColumn = columnIndex; }} oninput={(event) => updateGridCell(rowIndex, columnIndex, event.currentTarget.value)} onpaste={(event) => pasteGrid(event, rowIndex, columnIndex)} onkeydown={(event) => navigateGrid(event, rowIndex, columnIndex)} aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`} /></td>{/each}</tr>{/each}{#if virtualRows.after}<tr class="workspace__grid-spacer"><td colspan={virtualRows.header?.row.length ?? 1} style:height={`${virtualRows.after}px`}></td></tr>{/if}</tbody></table></div>
				{/if}
			{:else if workspace.active.kind === 'json' && view === 'tree'}
				<JsonTreeEditor content={workspace.active.content ?? ''} onChange={(content) => workspace.setContent(content)} />
			{:else if workspace.active.kind === 'markdown' && view === 'preview'}
				{@const frontmatter = splitFrontmatter(workspace.active.content ?? '')}
				<div class="workspace__print-preview"><p class="workspace__print-kicker">{workspace.active.path}</p>{#if includeFrontmatter && Object.keys(frontmatter.fields).length}<dl class="workspace__print-frontmatter">{#each Object.entries(frontmatter.fields) as [key, value]}<div><dt>{key}</dt><dd>{value}</dd></div>{/each}</dl>{/if}{#if /:::tabs|:::accordion/.test(frontmatter.body)}<p class="workspace__print-fallback">Interactive tabs and accordions print as static content.</p>{/if}<RenderedMarkdown content={frontmatter.body} assetBasePath={workspace.active.path} onOpenWorkspacePath={(path) => void workspace.openLinked(path)} /><footer>Fracta · {workspace.active.path} · {new Date().toLocaleDateString()}</footer></div>
			{:else if workspace.active.kind === 'markdown' && view === 'richtext'}
				<WorkspaceMarkdownEditor content={workspace.active.content ?? ''} onChange={(content) => workspace.setContent(content)} />
			{:else}
				{#if workspace.active.kind === 'text'}
					<div class="workspace__source-controls"><label>Find <input bind:value={sourceQuery} onkeydown={(event) => event.key === 'Enter' && findInSource()} aria-label="Find in text source" /></label><button onclick={findInSource} disabled={!sourceQuery.trim()}>Next match</button><button class:active={sourceWrap} onclick={() => sourceWrap = !sourceWrap}>{sourceWrap ? 'Wrap on' : 'Wrap off'}</button></div>
				{/if}
				{#if workspace.active.kind === 'json' && jsonParseError(workspace.active.content)}<p class="workspace__source-error" role="alert">{jsonParseError(workspace.active.content)}</p>{/if}
				{#if workspace.active.kind === 'json'}
					<JsonSourceEditor content={workspace.active.content ?? ''} onChange={(content) => workspace.setContent(content)} />
				{:else}
					<textarea bind:this={sourceEditor} class="workspace__source" class:workspace__source--nowrap={workspace.active.kind === 'text' && !sourceWrap} value={workspace.active.content ?? ''} oninput={(event) => workspace.setContent(event.currentTarget.value)} spellcheck={true} aria-label={`${workspace.active.kind} source`}></textarea>
				{/if}
			{/if}
		{:else}
			<div class="workspace__blank"><p>Open a file to begin.</p><span>Markdown, CSV, JSON, TXT, DOCX and PDF all live together here.</span></div>
		{/if}
	</main>
	{#if ui.askOpen}<button class="workspace__ask-backdrop" aria-label="Close Ask panel" onclick={closeWorkspaceAsk}></button><div class="workspace__ask"><AskPanel onclose={closeWorkspaceAsk} /></div>{/if}
	{#if terminalOpen}<button class="workspace__terminal-backdrop" aria-label="Close terminal" onclick={closeTerminal}></button><WorkspaceTerminal onclose={closeTerminal} />{/if}
	<button class="workspace__resize workspace__resize--inspector" style:right={`${inspectorWidth - 3}px`} onpointerdown={(event) => startResize('inspector', event)} aria-label="Resize inspector"></button>
	{#if inspectorOpen}<button class="workspace__sheet-backdrop" aria-label="Close inspector" onclick={closeInspector}></button>{/if}
	<aside class="workspace__inspector" class:workspace__inspector--open={inspectorOpen} aria-label="Inspector">
		<header><span>Inspector</span><button class="workspace__sheet-close" onclick={closeInspector}>Close</button></header>
		{#if workspace.active}
			<section><h2>File</h2><dl><div><dt>Path</dt><dd>{workspace.active.path}</dd></div><div><dt>Type</dt><dd>{workspace.active.kind.toUpperCase()}</dd></div><div><dt>Size</dt><dd>{Math.ceil(workspace.active.size / 1024) || 1} KB</dd></div><div><dt>Modified</dt><dd>{new Date(workspace.active.modified_at).toLocaleString()}</dd></div></dl></section>
			{#if workspace.links}<section><h2>Connections</h2><p>{workspace.links.forward.length} forward · {workspace.links.backlinks.length} backlinks</p>{#if workspace.links.dead.length}<p class="workspace__inspector-warning">{workspace.links.dead.length} dead link{workspace.links.dead.length === 1 ? '' : 's'}</p>{/if}{#each workspace.links.forward.slice(0, 8) as link}<button onclick={() => workspace.open(link)}>→ {link}</button>{/each}{#if workspace.links.suggestions.length}<h3>Related</h3>{#each workspace.links.suggestions as link}<button onclick={() => workspace.open(link)}>≈ {link}</button>{/each}{/if}</section>{/if}
			{#if workspace.preview}<section><h2>Read-only</h2><p>{workspace.preview.pages ? `${workspace.preview.pages} extracted pages` : 'Extracted local document text'}</p><p>{workspace.preview.warning}</p></section>{/if}
		{:else}
			<p class="workspace__inspector-empty">Select a file to see local metadata and connections.</p>
		{/if}
		{#if workspace.graph}<section><h2>Vault graph</h2><p>{workspace.graph.nodes.length} documents · {workspace.graph.edges.length} connections</p><KnowledgeGraph graph={workspace.graph} activePath={workspace.active?.path} onOpen={(path) => workspace.open(path)} />{#if workspace.graph.hubs.length}<h3>Hubs</h3>{#each workspace.graph.hubs.slice(0, 4) as path}<button onclick={() => workspace.open(path)}>↗ {path}</button>{/each}{/if}{#if workspace.graph.orphans.length}<h3>Orphans ({workspace.graph.orphans.length})</h3>{#each workspace.graph.orphans.slice(0, 4) as path}<button onclick={() => workspace.open(path)}>○ {path}</button>{/each}{/if}</section>{/if}
	</aside>
</section>
