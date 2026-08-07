<script lang="ts">
	// ai-elements/Code
	// Read-only CodeMirror with the app's custom theme and dynamic syntax highlighting.
	// Includes a copy button and a height/overflow cap.

	import { onDestroy, untrack } from 'svelte';
	import type { EditorView as EditorViewType } from 'codemirror';
	import CopyButton from './CopyButton.svelte';

	let {
		code = '',
		lang,
		maxHeight = 480,
		showCopy = true,
	} = $props<{
		code?: string;
		lang?: string;
		maxHeight?: number;
		showCopy?: boolean;
	}>();

	let mount = $state<HTMLDivElement | null>(null);
	let loadError = $state(false);
	let view: EditorViewType | null = null;

	// Creates the view once per mount/lang (extensions depend on lang) — deliberately reads
	// `code` via untrack() so this effect does NOT depend on it. A streaming message's code
	// fence grows on every chunk; depending on `code` here used to tear down and rebuild the
	// whole CodeMirror instance (full re-tokenization) on every single chunk. The separate
	// effect below dispatches content changes into the existing view instead.
	$effect(() => {
		if (!mount) return;
		const target = mount;
		const currentLang = lang;
		let cancelled = false;
		loadError = false;

		// CodeMirror is loaded on demand — this is the only place in the AI chat
		// tree that needs it, and most messages never render a code fence.
		Promise.all([
			import('codemirror'),
			import('@codemirror/state'),
			import('../../editorTheme'),
		]).then(([{ EditorView, basicSetup }, { EditorState }, { customEditorTheme, dynamicSyntaxHighlighting, langExtensionFor }]) => {
			if (cancelled) return;

			view?.destroy();

			const extensions = [
				basicSetup,
				customEditorTheme,
				dynamicSyntaxHighlighting,
				EditorView.editable.of(false),
				EditorState.readOnly.of(true),
				...langExtensionFor(currentLang),
			];

			view = new EditorView({
				doc: untrack(() => code),
				extensions,
				parent: target,
			});
		}).catch((error: unknown) => {
			if (cancelled) return;
			loadError = true;
			console.error('Failed to load the code preview', error);
		});

		return () => {
			cancelled = true;
			view?.destroy();
			view = null;
		};
	});

	$effect(() => {
		const newCode = code;
		if (!view) return;
		const currentDoc = view.state.doc.toString();
		if (currentDoc === newCode) return;
		view.dispatch({
			changes: { from: 0, to: currentDoc.length, insert: newCode }
		});
	});

	onDestroy(() => {
		view?.destroy();
		view = null;
	});
</script>

<div class="ai-code" style="--ai-code-max-h: {maxHeight}px">
	{#if showCopy}
		<div class="ai-code-toolbar">
			{#if lang}
				<span class="ai-code-lang">{lang}</span>
			{/if}
			<CopyButton text={code} label="Copy code" />
		</div>
	{/if}
	{#if loadError}
		<div class="ai-code-load-error" role="alert">Enhanced code preview unavailable. Showing plain text.</div>
		<pre class="ai-code-fallback"><code>{code}</code></pre>
	{:else}
		<div bind:this={mount} class="ai-code-mount"></div>
	{/if}
</div>
