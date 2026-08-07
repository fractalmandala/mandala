<script lang="ts">
	// designcanvas/ExportPanel
	//
	// Figma-style export panel: choose "Entire canvas" or "Selected elements",
	// then see HTML / Svelte / pure-indented-SASS output. Two action buttons:
	//
	//   • Copy      — copy the active tab's code to the clipboard
	//   • Download  — save a single `.md` file with all three sections so the
	//                  user can hand the whole snippet to an LLM or paste it
	//                  into a project
	//
	// The actual code generation lives in `$lib/modules/designer/engine/codegen.ts` so
	// other surfaces (codegen AI command, share-link panel) can reuse the
	// exact same exporter — no drift between export and round-trip import.

	import type { DesignBlock } from '$lib/modules/designer/engine/designtypes';
	import { designcanvas } from '$lib/modules/designer/state/designcanvas.svelte';
	import { exportHtmlSass, exportHtmlCss, exportSvelte } from '$lib/modules/designer/engine/codegen';

	type Scope = 'canvas' | 'selection';
	type Tab = 'html' | 'svelte' | 'sass';

	// ── State ──────────────────────────────────────────────────────────────
	let scope = $state<Scope>('canvas');
	let activeTab = $state<Tab>('html');
	let copied = $state(false);
	let downloaded = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

	// ── Subtree expansion ──────────────────────────────────────────────────
	// Walk both DOWN (parent → every descendant) AND UP (child → every
	// ancestor) from each selected id. The DOWN pass lets a selected frame
	// pull in its grandchildren; the UP pass is required because
	// `codegen.serialize()` only emits roots (`parentId === null`) and then
	// recurses — without the UP pass, selecting a nested leaf would yield
	// an empty export because none of the items in idSet is a root.
	function expandSelection(ids: string[]): DesignBlock[] {
		const byId = new Map(designcanvas.items.map((b) => [b.id, b]));
		const idSet = new Set<string>();

		for (const id of ids) {
			if (!byId.has(id)) continue;
			idSet.add(id);

			// Walk DOWN through children (transitive).
			const queue: string[] = [id];
			while (queue.length > 0) {
				const current = queue.shift()!;
				const block = byId.get(current);
				if (!block) continue;
				for (const childId of block.children) {
					if (!idSet.has(childId) && byId.has(childId)) {
						idSet.add(childId);
						queue.push(childId);
					}
				}
			}

			// Walk UP through ancestors so the codegen still has a root.
			let cursor: string | null = byId.get(id)?.parentId ?? null;
			while (cursor && byId.has(cursor)) {
				if (idSet.has(cursor)) break;
				idSet.add(cursor);
				cursor = byId.get(cursor)!.parentId;
			}
		}

		return designcanvas.items.filter((b) => idSet.has(b.id));
	}

	// Resolve the active export set. Pure derived — re-runs whenever the
	// selection or the scene graph mutates.
	const sourceItems = $derived.by<DesignBlock[]>(() => {
		if (scope === 'selection') {
			const ids = designcanvas.selectedIds.filter((id) =>
				designcanvas.items.some((b) => b.id === id)
			);
			if (ids.length === 0) return [];
			return expandSelection(ids);
		}
		return designcanvas.items;
	});

	const selectionCount = $derived(designcanvas.selectedIds.length);
	const scopeLabel = $derived.by(() => {
		if (scope === 'selection') {
			if (selectionCount === 0) return 'Select at least one layer to export the selection.';
			if (sourceItems.length === 0) return 'No exportable layers in the current selection.';
			return `${sourceItems.length} layer${sourceItems.length === 1 ? '' : 's'} (selection + ancestors)`;
		}
		return `${sourceItems.length} layer${sourceItems.length === 1 ? '' : 's'} on canvas`;
	});
	const exportDisabled = $derived(sourceItems.length === 0);

	// ── Codegen results ────────────────────────────────────────────────────
	// `serialize()` returns rules keyed by class. For SASS export we want the
	// pure-indented SASS form (no CSS rules); for HTML we keep a parallel
	// `.sass` block in the Svelte file. We hold the bare HTML/SASS so each
	// tab is independent and the markdown download concatenates all three.
	const htmlOnly = $derived(exportHtmlCss(sourceItems).html.trim());
	const sassOnly = $derived(exportHtmlSass(sourceItems).sass.trim());
	const svelteOutput = $derived(exportSvelte(sourceItems).trim());

	const tabContent = $derived.by(() => {
		switch (activeTab) {
			case 'html': return htmlOnly;
			case 'svelte': return svelteOutput;
			case 'sass': return sassOnly;
		}
	});

	const tabFileExt = $derived.by(() => {
		switch (activeTab) {
			case 'html': return 'html';
			case 'svelte': return 'svelte';
			case 'sass': return 'sass';
		}
	});

	// Markdown bundle: each section gets a fenced block with the right
	// language tag so syntax highlighters and AI copilots render it well.
	const markdownBundle = $derived(`# Design Export

Scope: ${scope === 'canvas' ? 'entire canvas' : 'selected elements'} (${sourceItems.length} block${sourceItems.length === 1 ? '' : 's'})

## HTML

\`\`\`html
${htmlOnly}
\`\`\`

## Svelte

\`\`\`svelte
${svelteOutput}
\`\`\`

## SASS

\`\`\`sass
${sassOnly}
\`\`\`
`);

	function flashState(target: 'copied' | 'downloaded') {
		if (target === 'copied') copied = true;
		else downloaded = true;
		if (resetTimer) clearTimeout(resetTimer);
		resetTimer = setTimeout(() => {
			copied = false;
			downloaded = false;
		}, 1500);
	}

	async function copyCurrent() {
		try {
			await navigator.clipboard.writeText(tabContent);
			flashState('copied');
		} catch (e) {
			console.error('Clipboard copy failed:', e);
		}
	}

	function downloadBundle() {
		// Use a Blob + anchor download. Works in both Tauri (sandboxed) and
		// the browser dev server without needing the IPC layer.
		try {
			const blob = new Blob([markdownBundle], { type: 'text/markdown;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `design-export-${Date.now()}.md`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			flashState('downloaded');
		} catch (e) {
			console.error('Download failed:', e);
		}
	}

	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (resetTimer) clearTimeout(resetTimer);
	});
</script>

<div class="export-root">
	<!-- ── Scope ─────────────────────────────────────────────────────── -->
	<div class="export-section">
		<div class="export-section-title">SCOPE</div>
		<div class="export-scope-row" role="radiogroup" aria-label="Export scope">
			<button
				type="button"
				role="radio"
				aria-checked={scope === 'canvas'}
				class="export-scope-btn"
				class:active={scope === 'canvas'}
				onclick={() => (scope = 'canvas')}
			>
				<span class="export-scope-dot" aria-hidden="true"></span>
				<span>Entire canvas</span>
			</button>
			<button
				type="button"
				role="radio"
				aria-checked={scope === 'selection'}
				class="export-scope-btn"
				class:active={scope === 'selection'}
				onclick={() => (scope = 'selection')}
			>
				<span class="export-scope-dot" aria-hidden="true"></span>
				<span>Selected elements</span>
			</button>
		</div>
		<div class="export-scope-summary">{scopeLabel}</div>
	</div>

	<!-- ── Tabs + preview ───────────────────────────────────────────── -->
	<div class="export-section export-preview-section">
		<div class="export-tabs" role="tablist" aria-label="Export format">
			<button
				type="button"
				role="tab"
				id="export-tab-html"
				aria-selected={activeTab === 'html'}
				aria-controls="export-tabpanel"
				class="export-tab"
				class:active={activeTab === 'html'}
				onclick={() => (activeTab = 'html')}
			>
				HTML
			</button>
			<button
				type="button"
				role="tab"
				id="export-tab-svelte"
				aria-selected={activeTab === 'svelte'}
				aria-controls="export-tabpanel"
				class="export-tab"
				class:active={activeTab === 'svelte'}
				onclick={() => (activeTab = 'svelte')}
			>
				Svelte
			</button>
			<button
				type="button"
				role="tab"
				id="export-tab-sass"
				aria-selected={activeTab === 'sass'}
				aria-controls="export-tabpanel"
				class="export-tab"
				class:active={activeTab === 'sass'}
				onclick={() => (activeTab = 'sass')}
			>
				SASS
			</button>
		</div>
		<div
			class="export-preview"
			role="tabpanel"
			id="export-tabpanel"
			aria-labelledby={`export-tab-${activeTab}`}
		>
			{#if sourceItems.length === 0}
				<div class="export-empty">
					{#if scope === 'selection' && selectionCount === 0}
						Select a layer first to export its code.
					{:else}
						No exportable layers in the current selection.
					{/if}
				</div>
			{:else}
				<pre class="export-code"><code>{tabContent}</code></pre>
			{/if}
		</div>
	</div>

	<!-- ── Actions ──────────────────────────────────────────────────── -->
	<div class="export-actions">
		<button
			type="button"
			class="export-action-btn"
			class:is-flashed={copied}
			onclick={copyCurrent}
			disabled={exportDisabled}
			title="Copy {tabFileExt} to clipboard"
		>
			<img src={copied ? '/iconset/checked.svg' : '/iconset/copy.svg'} alt="" class="icon-svg-sm" />
			<span>{copied ? 'Copied!' : `Copy ${tabFileExt.toUpperCase()}`}</span>
		</button>
		<button
			type="button"
			class="export-action-btn export-action-primary"
			class:is-flashed={downloaded}
			onclick={downloadBundle}
			disabled={sourceItems.length === 0}
			title="Download all three as a Markdown bundle"
		>
			<img src={downloaded ? '/iconset/checked.svg' : '/iconset/download.svg'} alt="" class="icon-svg-sm" />
			<span>{downloaded ? 'Saved!' : 'Download .md'}</span>
		</button>
	</div>
</div>
