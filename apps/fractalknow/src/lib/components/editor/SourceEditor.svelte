<script lang="ts">
	import { onMount } from 'svelte';
	import {
		updateDocumentViewState,
		type WorkspaceDocument,
	} from '$lib/shell';
	import { formatDiagnosticSummary, lintMarkdownSource } from '$lib/editor/diagnostics';
	import type { EditorView as CodeMirrorEditorView } from '@codemirror/view';
	import type { Diagnostic } from '@codemirror/lint';

	let {
		document,
		onUpdate,
	}: {
		document: WorkspaceDocument;
		onUpdate: (content: string) => void;
	} = $props();

	let host: HTMLDivElement;
	let view: CodeMirrorEditorView | null = null;
	let activePath = '';
	let lastContent = '';
	let applyingExternalUpdate = false;
	let restoreFrame = 0;
	let findOpen = $state(false);
	let findQuery = $state('');
	let replaceQuery = $state('');
	let caseSensitive = $state(false);
	let useRegex = $state(false);
	let diagnosticsEnabled = $state(true);
	let diagnosticSummary = $state('No diagnostics');
	let languageLabel = $state('markdown');

	function languageForPath(path: string): 'markdown' | 'javascript' | 'json' {
		const lower = path.toLowerCase();
		if (lower.endsWith('.mdx') || lower.endsWith('.mjs') || lower.endsWith('.js') || lower.endsWith('.ts')) {
			return 'javascript';
		}
		if (lower.endsWith('.json')) return 'json';
		return 'markdown';
	}

	async function createEditor(): Promise<void> {
		const [
			commands,
			markdownLang,
			jsLang,
			jsonLang,
			searching,
			state,
			viewModule,
			lint,
			language,
		] = await Promise.all([
			import('@codemirror/commands'),
			import('@codemirror/lang-markdown'),
			import('@codemirror/lang-javascript'),
			import('@codemirror/lang-json'),
			import('@codemirror/search'),
			import('@codemirror/state'),
			import('@codemirror/view'),
			import('@codemirror/lint'),
			import('@codemirror/language'),
		]);

		if (!host) return;

		const langMode = languageForPath(document.path);
		languageLabel = langMode;
		const languageSupport =
			langMode === 'javascript'
				? jsLang.javascript({ typescript: document.path.endsWith('.ts'), jsx: true })
				: langMode === 'json'
					? jsonLang.json()
					: markdownLang.markdown();

		const linter = lint.linter((editorView) => {
			if (!diagnosticsEnabled) {
				diagnosticSummary = 'Diagnostics off';
				return [];
			}
			const text = editorView.state.doc.toString();
			const issues = lintMarkdownSource(text);
			diagnosticSummary = formatDiagnosticSummary(issues);
			return issues.map(
				(issue): Diagnostic => ({
					from: issue.from,
					to: Math.max(issue.to, issue.from + 1),
					severity: issue.severity,
					message: issue.message,
					source: issue.source,
				}),
			);
		});

		const theme = viewModule.EditorView.theme({
			'&': {
				minHeight: '320px',
				background: 'transparent',
			},
			'.cm-scroller': {
				minHeight: '320px',
				fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
				fontSize: '14px',
				lineHeight: '1.55',
			},
			'.cm-content': {
				padding: '16px',
			},
			'.cm-gutters': {
				background: 'transparent',
				borderRight: '1px solid var(--fk-line)',
			},
			'.cm-diagnostic': {
				padding: '2px 0',
			},
		});

		activePath = document.path;
		lastContent = document.content;
		view = new viewModule.EditorView({
			parent: host,
			state: state.EditorState.create({
				doc: document.content,
				selection: state.EditorSelection.single(
					document.viewState?.sourceSelection?.anchor ?? 0,
					document.viewState?.sourceSelection?.head ??
						document.viewState?.sourceSelection?.anchor ??
						0,
				),
				extensions: [
					viewModule.lineNumbers(),
					viewModule.drawSelection(),
					viewModule.highlightActiveLine(),
					viewModule.highlightActiveLineGutter(),
					commands.history(),
					searching.search({ top: true }),
					searching.highlightSelectionMatches(),
					languageSupport,
					language.foldGutter(),
					linter,
					lint.lintGutter(),
					viewModule.keymap.of([
						commands.indentWithTab,
						...searching.searchKeymap,
						...commands.historyKeymap,
						...commands.defaultKeymap,
						{
							key: 'Mod-s',
							run: () => {
								onUpdate(view?.state.doc.toString() ?? '');
								return true;
							},
						},
						{
							key: 'Mod-f',
							run: () => {
								findOpen = true;
								return searching.openSearchPanel(view!);
							},
						},
						{
							key: 'Mod-h',
							run: () => {
								findOpen = true;
								return searching.openSearchPanel(view!);
							},
						},
						{
							key: 'Mod-/',
							run: commands.toggleComment,
						},
						{
							key: 'Mod-F2',
							run: () => {
								diagnosticsEnabled = !diagnosticsEnabled;
								// Force a doc touch so the linter re-runs.
								view?.dispatch({});
								return true;
							},
						},
					]),
					viewModule.EditorView.lineWrapping,
					viewModule.EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							const next = update.state.doc.toString();
							lastContent = next;
							if (!applyingExternalUpdate) onUpdate(next);
						}
						if (update.selectionSet || update.docChanged) {
							const selection = update.state.selection.main;
							updateDocumentViewState(document.path, {
								sourceSelection: {
									anchor: selection.anchor,
									head: selection.head,
								},
							});
						}
					}),
					theme,
				],
			}),
		});
		view.scrollDOM.addEventListener('scroll', persistScroll);
		restoreScroll();
		diagnosticSummary = formatDiagnosticSummary(lintMarkdownSource(document.content));
	}

	function replaceDocument(content: string): void {
		if (!view) return;
		lastContent = content;
		applyingExternalUpdate = true;
		view.dispatch({
			changes: {
				from: 0,
				to: view.state.doc.length,
				insert: content,
			},
		});
		applyingExternalUpdate = false;
		restoreSelection();
		restoreScroll();
	}

	function persistScroll(): void {
		if (!view) return;
		updateDocumentViewState(document.path, {
			sourceScrollTop: view.scrollDOM.scrollTop,
		});
	}

	function restoreSelection(): void {
		if (!view || !document.viewState?.sourceSelection) return;
		const maxPosition = view.state.doc.length;
		const anchor = Math.min(document.viewState.sourceSelection.anchor, maxPosition);
		const head = Math.min(document.viewState.sourceSelection.head, maxPosition);
		view.dispatch({
			selection: { anchor, head },
		});
	}

	function restoreScroll(): void {
		if (!view) return;
		cancelAnimationFrame(restoreFrame);
		restoreFrame = requestAnimationFrame(() => {
			if (!view) return;
			view.scrollDOM.scrollTop = document.viewState?.sourceScrollTop ?? 0;
		});
	}

	function matchQuery(haystack: string, query: string): { index: number; length: number } | null {
		if (!query) return null;
		if (useRegex) {
			try {
				const flags = caseSensitive ? 'g' : 'gi';
				const match = new RegExp(query, flags).exec(haystack);
				if (!match || match.index === undefined) return null;
				return { index: match.index, length: match[0]?.length ?? query.length };
			} catch {
				return null;
			}
		}
		const source = caseSensitive ? haystack : haystack.toLowerCase();
		const needle = caseSensitive ? query : query.toLowerCase();
		const index = source.indexOf(needle);
		return index >= 0 ? { index, length: query.length } : null;
	}

	async function runFind(direction: 1 | -1 = 1): Promise<void> {
		if (!view || !findQuery) return;
		const text = view.state.doc.toString();
		const from = view.state.selection.main.head;
		if (direction === 1) {
			const slice = text.slice(from + (view.state.selection.main.empty ? 0 : 1));
			const match = matchQuery(slice, findQuery);
			if (!match) {
				const wrap = matchQuery(text, findQuery);
				if (!wrap) return;
				view.dispatch({
					selection: { anchor: wrap.index, head: wrap.index + wrap.length },
					scrollIntoView: true,
				});
				return;
			}
			const index = from + (view.state.selection.main.empty ? 0 : 1) + match.index;
			view.dispatch({
				selection: { anchor: index, head: index + match.length },
				scrollIntoView: true,
			});
			return;
		}
		const slice = text.slice(0, from);
		const source = caseSensitive ? slice : slice.toLowerCase();
		const needle = caseSensitive ? findQuery : findQuery.toLowerCase();
		const index = useRegex
			? (() => {
					try {
						const matches = [...slice.matchAll(new RegExp(findQuery, caseSensitive ? 'g' : 'gi'))];
						const last = matches.at(-1);
						return last?.index ?? -1;
					} catch {
						return -1;
					}
				})()
			: source.lastIndexOf(needle);
		if (index < 0) return;
		const length = useRegex
			? (slice.slice(index).match(new RegExp(findQuery, caseSensitive ? '' : 'i'))?.[0]?.length ??
				findQuery.length)
			: findQuery.length;
		view.dispatch({
			selection: { anchor: index, head: index + length },
			scrollIntoView: true,
		});
	}

	function runReplace(): void {
		if (!view || !findQuery) return;
		const { from, to } = view.state.selection.main;
		const selected = view.state.doc.sliceString(from, to);
		const matches = matchQuery(selected, findQuery);
		if (matches && matches.index === 0 && matches.length === selected.length) {
			view.dispatch({
				changes: { from, to, insert: replaceQuery },
			});
		} else {
			void runFind(1);
		}
	}

	function runReplaceAll(): void {
		if (!view || !findQuery) return;
		const text = view.state.doc.toString();
		let next = text;
		if (useRegex) {
			try {
				next = text.replace(new RegExp(findQuery, caseSensitive ? 'g' : 'gi'), replaceQuery);
			} catch {
				return;
			}
		} else if (caseSensitive) {
			next = text.split(findQuery).join(replaceQuery);
		} else {
			const re = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
			next = text.replace(re, replaceQuery);
		}
		if (next === text) return;
		view.dispatch({
			changes: { from: 0, to: text.length, insert: next },
		});
	}

	onMount(() => {
		let disposed = false;
		void createEditor().then(() => {
			if (!disposed) return;
			view?.destroy();
			view = null;
		});
		return () => {
			disposed = true;
			cancelAnimationFrame(restoreFrame);
			view?.scrollDOM.removeEventListener('scroll', persistScroll);
			view?.destroy();
			view = null;
		};
	});

	$effect(() => {
		if (!view) return;
		if (document.path !== activePath) {
			activePath = document.path;
			languageLabel = languageForPath(document.path);
			// Recreate language-aware editor on path change.
			view.destroy();
			view = null;
			void createEditor();
			return;
		}
		if (document.content !== lastContent) {
			replaceDocument(document.content);
		}
	});
</script>

<div class="source-shell">
	<div class="source-shell__meta">
		<span>{languageLabel}</span>
		<span aria-live="polite">{diagnosticSummary}</span>
		<button type="button" onclick={() => (findOpen = !findOpen)}>Find / Replace</button>
	</div>
	{#if findOpen}
		<div class="source-shell__find" aria-label="Find and replace">
			<input bind:value={findQuery} type="search" placeholder="Find" aria-label="Find" />
			<input bind:value={replaceQuery} type="text" placeholder="Replace" aria-label="Replace" />
			<label class="source-shell__toggle">
				<input type="checkbox" bind:checked={caseSensitive} />
				<span>Aa</span>
			</label>
			<label class="source-shell__toggle">
				<input type="checkbox" bind:checked={useRegex} />
				<span>.*</span>
			</label>
			<button type="button" onclick={() => void runFind(-1)}>Prev</button>
			<button type="button" onclick={() => void runFind(1)}>Next</button>
			<button type="button" onclick={runReplace}>Replace</button>
			<button type="button" onclick={runReplaceAll}>Replace all</button>
			<button
				type="button"
				aria-pressed={diagnosticsEnabled}
				onclick={() => {
					diagnosticsEnabled = !diagnosticsEnabled;
					view?.dispatch({});
				}}
			>Diagnostics</button>
		</div>
	{/if}
	<div class="source-editor" bind:this={host} aria-label="Source document content"></div>
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.source-shell
		display: grid
		gap: 0
		width: 100%

		&__meta
			display: flex
			align-items: center
			gap: 12px
			padding: 8px 10px
			border: 1px solid var(--ok-line)
			border-bottom: none
			border-radius: 8px 8px 0 0
			background: var(--ok-panel)
			color: var(--ok-muted)
			font-size: 12px
			font-weight: 700

			button
				margin-left: auto
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 4px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer

		&__find
			display: flex
			flex-wrap: wrap
			gap: 8px
			padding: 8px 10px
			border: 1px solid var(--ok-line)
			border-bottom: none
			background: var(--ok-panel)

			input
				flex: 1
				min-width: 120px
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer

	.source-editor
		width: 100%
		min-height: 320px
		border: 1px solid var(--ok-line)
		border-radius: 0 0 8px 8px
		background: var(--ok-surface)
		color: var(--ok-ink)
		overflow: hidden

		&:focus-within
			border-color: var(--ok-accent)
</style>
