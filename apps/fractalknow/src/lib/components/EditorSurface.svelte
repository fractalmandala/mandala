<script lang="ts">
	import { fade } from 'svelte/transition';
	import MigrationBoard from '$lib/migration/MigrationBoard.svelte';
	import { migrationGroups } from '$lib/migration/tasks';
	import {
		activeTerminalTab,
		activeDocument,
		clearPendingTarget,
		closeTerminalTab,
		closeActiveDocument,
		confirmPendingTarget,
		createTerminalTab,
		discardActiveChanges,
		documentWorkspace,
		openDocuments,
		openTarget,
		reloadActiveDocument,
		saveActiveDocumentContent,
		saveActiveVersion,
		setActiveTerminalTab,
		setPreferredDocumentPanelWidth,
		setPreferredTerminalHeight,
		setTerminalOpen,
		shellPreferences,
		shellState,
		showVersionHistory,
		updateActiveContent,
	} from '$lib/shell';
	import AssetViewer from './editor/AssetViewer.svelte';
	import CollabStatus from './editor/CollabStatus.svelte';
	import DiffViewer from './editor/DiffViewer.svelte';
	import DocumentHeader from './editor/DocumentHeader.svelte';
	import FrontmatterEditor from './editor/FrontmatterEditor.svelte';
	import MarkdownViewer from './editor/MarkdownViewer.svelte';
	import RichEditor from './editor/RichEditor.svelte';
	import SkillViewer from './editor/SkillViewer.svelte';
	import SourceEditor from './editor/SourceEditor.svelte';
	import VersionList from './editor/VersionList.svelte';
	import { desktopBridge } from '$lib/desktop';
	import { isSkillDocument } from '$lib/shell/documents';
	import type { EditorMode } from '$lib/shell';
	import { setEditorMode } from '$lib/shell';
	import {
		startTerminalSession,
		stopTerminalSession,
		terminalSessions,
		writeToTerminal,
	} from '$lib/shell';

	let resizingTerminal = $state(false);
	let terminalStartY = $state(0);
	let terminalStartHeight = $state(180);
	let resizingDocumentPanel = $state(false);
	let documentPanelStartX = $state(0);
	let documentPanelStartWidth = $state(340);

	function closeTab(): void {
		closeActiveDocument();
		const next = $activeDocument;
		if (next) openTarget(next);
	}

	function forceCloseTab(): void {
		closeActiveDocument({ force: true });
		const next = $activeDocument;
		if (next) openTarget(next);
	}

	function saveAndConfirmPendingTarget(): void {
		saveActiveVersion();
		confirmPendingTarget();
	}

	function formatBytes(size: number | undefined): string {
		if (size === undefined) return 'Unknown';
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	}

	function documentLoadState(): string {
		return $activeDocument?.loadState ?? 'loaded';
	}

	function documentSyncState(): string {
		return $activeDocument?.syncState ?? ($activeDocument?.dirty ? 'dirty' : 'saved');
	}

	function startTerminalResize(event: PointerEvent): void {
		resizingTerminal = true;
		terminalStartY = event.clientY;
		terminalStartHeight = $shellPreferences.terminalHeight;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function resizeTerminal(event: PointerEvent): void {
		if (!resizingTerminal) return;

		setPreferredTerminalHeight(terminalStartHeight - (event.clientY - terminalStartY));
	}

	function stopTerminalResize(event: PointerEvent): void {
		if (!resizingTerminal) return;

		resizingTerminal = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
	}

	function handleTerminalResizeKeydown(event: KeyboardEvent): void {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			setPreferredTerminalHeight($shellPreferences.terminalHeight + 12);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			setPreferredTerminalHeight($shellPreferences.terminalHeight - 12);
		} else if (event.key === 'Home') {
			event.preventDefault();
			setPreferredTerminalHeight(120);
		} else if (event.key === 'End') {
			event.preventDefault();
			setPreferredTerminalHeight(360);
		}
	}

	function startDocumentPanelResize(event: PointerEvent): void {
		resizingDocumentPanel = true;
		documentPanelStartX = event.clientX;
		documentPanelStartWidth = $shellPreferences.documentPanelWidth;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function resizeDocumentPanel(event: PointerEvent): void {
		if (!resizingDocumentPanel) return;

		setPreferredDocumentPanelWidth(documentPanelStartWidth - (event.clientX - documentPanelStartX));
	}

	function stopDocumentPanelResize(event: PointerEvent): void {
		if (!resizingDocumentPanel) return;

		resizingDocumentPanel = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
	}

	function handleDocumentPanelResizeKeydown(event: KeyboardEvent): void {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			setPreferredDocumentPanelWidth($shellPreferences.documentPanelWidth + 16);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			setPreferredDocumentPanelWidth($shellPreferences.documentPanelWidth - 16);
		} else if (event.key === 'Home') {
			event.preventDefault();
			setPreferredDocumentPanelWidth(280);
		} else if (event.key === 'End') {
			event.preventDefault();
			setPreferredDocumentPanelWidth(560);
		}
	}

	function createAndOpenTerminalTab(): void {
		const tab = createTerminalTab();
		setTerminalOpen(true);
		void startTerminalSession(terminalBridge, tab.id, terminalBridge?.config.projectPath || undefined);
	}

	function closeActiveTerminalTab(): void {
		const tabId = $shellPreferences.activeTerminalTabId;
		setTerminalOpen(closeTerminalTab());
		void stopTerminalSession(terminalBridge, tabId);
	}

	function sendTerminalInput(event: SubmitEvent): void {
		event.preventDefault();
		const value = terminalInputValue;
		terminalInputValue = '';
		if (!value) return;
		void writeToTerminal(terminalBridge, $shellPreferences.activeTerminalTabId, `${value}\n`);
	}

	function setMode(mode: EditorMode): void {
		setEditorMode(mode);
	}

	const skillDoc = $derived(isSkillDocument($activeDocument));

	const terminalBridge = $derived(
		$desktopBridge.status === 'ready' ? $desktopBridge.bridge : null,
	);
	const activeTerminalSession = $derived($terminalSessions[$shellPreferences.activeTerminalTabId]);
	const terminalLive = $derived(
		activeTerminalSession != null && activeTerminalSession.status !== 'unsupported',
	);

	let terminalInputValue = $state('');
	let terminalOutputEl = $state<HTMLPreElement | null>(null);

	// Start a PTY session whenever the panel is open and the active tab has none.
	$effect(() => {
		if (!$shellState.terminalOpen || !terminalBridge) return;
		void startTerminalSession(
			terminalBridge,
			$shellPreferences.activeTerminalTabId,
			terminalBridge.config.projectPath || undefined,
		);
	});

	// Keep the output view pinned to the newest line.
	$effect(() => {
		const output = activeTerminalSession?.output;
		if (terminalOutputEl && output != null) {
			terminalOutputEl.scrollTop = terminalOutputEl.scrollHeight;
		}
	});
</script>

<section class="surface" aria-label="Editor surface">
	{#if $shellState.activePanel === 'migration'}
		<div class="surface__intro">
			<p>Migration</p>
			<h2>Task Plan And Port Status</h2>
		</div>
		<MigrationBoard groups={migrationGroups} />
	{:else if $shellState.activePanel === 'activity'}
		<div
			class="surface__split"
			style={`--document-panel-width: ${$shellPreferences.documentPanelWidth}px`}
		>
			<VersionList document={$activeDocument} />
			<aside
				class="details-panel"
				class:resizing={resizingDocumentPanel}
				aria-label="Activity details"
			>
				<button
					class="details-panel__resize"
					type="button"
					aria-label={`Resize document panel, current width ${$shellPreferences.documentPanelWidth}px`}
					onpointerdown={startDocumentPanelResize}
					onpointermove={resizeDocumentPanel}
					onpointerup={stopDocumentPanelResize}
					onpointercancel={stopDocumentPanelResize}
					onkeydown={handleDocumentPanelResizeKeydown}
				></button>
				<p>Activity</p>
				<h2>{$activeDocument?.title ?? 'No document selected'}</h2>
				<dl>
					<div>
						<dt>Versions</dt>
						<dd>{$activeDocument?.versions.length ?? 0}</dd>
					</div>
					<div>
						<dt>Status</dt>
						<dd>{documentSyncState()}</dd>
					</div>
				</dl>
			</aside>
		</div>
	{:else}
		<div
			class="surface__split"
			style={`--document-panel-width: ${$shellPreferences.documentPanelWidth}px`}
		>
			<div class="editor">
				<div class="editor__tabs" aria-label="Open document tabs">
					{#each $openDocuments as document (document.path)}
						<button
							type="button"
							class:active={$shellState.activeTarget.path === document.path}
							onclick={() => openTarget(document)}
						>
							<span>{document.title}</span>
							{#if document.dirty}
								<small>unsaved</small>
							{/if}
						</button>
					{/each}
				</div>
				<div class="editor__bar">
					<div class="editor__modes" aria-label="Editor mode">
						<button type="button" class:active={$shellState.editorMode === 'rich'} onclick={() => setMode('rich')}>Rich</button>
						<button type="button" class:active={$shellState.editorMode === 'source'} onclick={() => setMode('source')}>Source</button>
						<button type="button" class:active={$shellState.editorMode === 'preview'} onclick={() => setMode('preview')}>Preview</button>
						<button type="button" class:active={$shellState.editorMode === 'diff'} onclick={() => setMode('diff')}>Diff</button>
					</div>
					<span>{$activeDocument?.path ?? $shellState.activeTarget.path}</span>
					<div class="editor__actions">
						<button type="button" onclick={saveActiveDocumentContent}>Save</button>
						<button type="button" onclick={discardActiveChanges}>Revert</button>
						<button type="button" onclick={saveActiveVersion}>Save version</button>
						<button type="button" onclick={reloadActiveDocument}>Reload</button>
						<button type="button" onclick={showVersionHistory}>History</button>
						<button type="button" onclick={closeTab}>Close</button>
					</div>
				</div>
				{#if $activeDocument && $activeDocument.kind === 'doc'}
					<div class="editor__collab">
						<CollabStatus />
					</div>
				{/if}
				{#if $documentWorkspace.pendingTarget}
					<div class="editor__notice" data-tone="warning">
						<span>
							Unsaved changes block opening {$documentWorkspace.pendingTarget.title}.
						</span>
						<div>
							<button type="button" onclick={saveAndConfirmPendingTarget}>Save and open</button>
							<button type="button" onclick={confirmPendingTarget}>Discard and open</button>
							<button type="button" onclick={clearPendingTarget}>Cancel</button>
						</div>
					</div>
				{:else if $documentWorkspace.notice}
					<div class="editor__notice">
						<span>{$documentWorkspace.notice}</span>
					</div>
				{/if}
				{#if $activeDocument}
					{#key $activeDocument.path}
						<div class="editor__body" in:fade={{ duration: 120 }} out:fade={{ duration: 80 }}>
							<DocumentHeader document={$activeDocument} />

							{#if $activeDocument.loadState === 'loading'}
								<div class="editor__state" aria-live="polite">
									<h3>Loading document</h3>
									<p>{$activeDocument.title}</p>
								</div>
							{:else if $activeDocument.loadState === 'failed'}
								<div class="editor__state" data-tone="danger" role="alert">
									<h3>Document blocked</h3>
									<p>{$activeDocument.loadError ?? 'The document could not be loaded.'}</p>
									<button type="button" onclick={reloadActiveDocument}>Try reload</button>
								</div>
							{:else if $activeDocument.kind === 'asset'}
								<div class="editor__viewer" data-zoom="fit">
									<AssetViewer document={$activeDocument} />
								</div>
							{:else if skillDoc && ($shellState.editorMode === 'preview' || $shellState.editorMode === 'rich')}
								<div class="editor__viewer">
									<SkillViewer document={$activeDocument} />
								</div>
							{:else if $shellState.editorMode === 'diff'}
								<div class="editor__viewer">
									<DiffViewer document={$activeDocument} />
								</div>
							{:else if $shellState.editorMode === 'source'}
								{#if $activeDocument.kind === 'doc'}
									<FrontmatterEditor content={$activeDocument.content} onChange={updateActiveContent} />
								{/if}
								<SourceEditor document={$activeDocument} onUpdate={updateActiveContent} />
							{:else if $shellState.editorMode === 'preview'}
								<div class="editor__viewer">
									<MarkdownViewer document={$activeDocument} />
								</div>
							{:else}
								{#if $activeDocument.kind === 'doc'}
									<FrontmatterEditor content={$activeDocument.content} onChange={updateActiveContent} />
								{/if}
								<RichEditor document={$activeDocument} onUpdate={updateActiveContent} />
							{/if}
						</div>
					{/key}
				{:else}
					<div class="editor__body">
						<h2>No document selected</h2>
					</div>
				{/if}
			</div>
			<aside
				class="details-panel"
				class:resizing={resizingDocumentPanel}
				aria-label="Document details"
			>
				<button
					class="details-panel__resize"
					type="button"
					aria-label={`Resize document panel, current width ${$shellPreferences.documentPanelWidth}px`}
					onpointerdown={startDocumentPanelResize}
					onpointermove={resizeDocumentPanel}
					onpointerup={stopDocumentPanelResize}
					onpointercancel={stopDocumentPanelResize}
					onkeydown={handleDocumentPanelResizeKeydown}
				></button>
				<p>Details</p>
				<h2>{$activeDocument?.title ?? $shellState.activeTarget.title}</h2>
				<dl>
					<div>
						<dt>Path</dt>
						<dd>{$activeDocument?.path ?? $shellState.activeTarget.path}</dd>
					</div>
					<div>
						<dt>Kind</dt>
						<dd>{$activeDocument?.kind ?? $shellState.activeTarget.kind}</dd>
					</div>
					<div>
						<dt>Versions</dt>
						<dd>{$activeDocument?.versions.length ?? 0}</dd>
					</div>
					<div>
						<dt>Status</dt>
						<dd>{documentSyncState()}</dd>
					</div>
					<div>
						<dt>Load</dt>
						<dd>{documentLoadState()}</dd>
					</div>
					<div>
						<dt>Size</dt>
						<dd>{formatBytes($activeDocument?.metadata?.size)}</dd>
					</div>
					<div>
						<dt>Type</dt>
						<dd>{$activeDocument?.metadata?.mime ?? 'Unknown'}</dd>
					</div>
					<div>
						<dt>Binary</dt>
						<dd>{$activeDocument?.metadata?.binary ? 'Yes' : 'No'}</dd>
					</div>
				</dl>
				{#if $activeDocument?.dirty}
					<div class="details-panel__actions">
						<button type="button" onclick={discardActiveChanges}>Discard changes</button>
						<button type="button" onclick={forceCloseTab}>Discard and close</button>
					</div>
				{/if}
			</aside>
		</div>
	{/if}

	{#if $shellState.terminalOpen}
		<aside
			class="terminal"
			class:resizing={resizingTerminal}
			aria-label="Terminal panel"
			style={`--terminal-height: ${$shellPreferences.terminalHeight}px`}
		>
			<button
				class="terminal__resize"
				type="button"
				aria-label={`Resize terminal, current height ${$shellPreferences.terminalHeight}px`}
				onpointerdown={startTerminalResize}
				onpointermove={resizeTerminal}
				onpointerup={stopTerminalResize}
				onpointercancel={stopTerminalResize}
				onkeydown={handleTerminalResizeKeydown}
			></button>
			<div class="terminal__bar">
				<div class="terminal__tabs" aria-label="Terminal tabs">
					{#each $shellPreferences.terminalTabs as tab (tab.id)}
						<button
							type="button"
							class:active={$shellPreferences.activeTerminalTabId === tab.id}
							onclick={() => setActiveTerminalTab(tab.id)}
						>
							<span>{tab.title}</span>
							<small>{tab.status}</small>
						</button>
					{/each}
				</div>
				<div class="terminal__actions">
					<button type="button" onclick={createAndOpenTerminalTab}>New</button>
					<button type="button" onclick={closeActiveTerminalTab}>Close</button>
				</div>
			</div>
			<div
				class="terminal__body"
				style={terminalLive ? 'display: flex; flex-direction: column; min-height: 0; padding: 0;' : ''}
			>
				{#if terminalLive && activeTerminalSession}
					<pre
						bind:this={terminalOutputEl}
						style="margin: 0; padding: 8px 10px; overflow: auto; flex: 1; min-height: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all;"
						aria-label="Terminal output"
					>{activeTerminalSession.output}</pre>
					<form
						onsubmit={sendTerminalInput}
						style="display: flex; align-items: center; gap: 8px; padding: 6px 10px;"
					>
						<span aria-hidden="true">{activeTerminalSession.status === 'exited' ? `[exited ${activeTerminalSession.exitCode ?? '?'}]` : '$'}</span>
						<input
							bind:value={terminalInputValue}
							aria-label="Terminal input"
							placeholder={activeTerminalSession.status === 'exited' ? 'Session exited — open a new tab' : 'Type a command and press Enter'}
							disabled={activeTerminalSession.status === 'exited'}
							style="flex: 1; min-width: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;"
						/>
					</form>
				{:else}
					<span>{$activeTerminalTab?.title ?? 'Terminal'}</span>
					<p>
						PTY support is available in the desktop app. Open the terminal panel
						while running the Tauri build to start a live shell session.
					</p>
					<dl>
						<div>
							<dt>Working directory</dt>
							<dd>{$activeTerminalTab?.cwd ?? '~'}</dd>
						</div>
						<div>
							<dt>Status</dt>
							<dd>{activeTerminalSession?.status ?? $activeTerminalTab?.status ?? 'unsupported'}</dd>
						</div>
					</dl>
				{/if}
			</div>
		</aside>
	{/if}
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.surface
		min-height: 0
		padding: 20px
		background: var(--ok-surface)
		display: grid
		grid-template-rows: minmax(0, 1fr) auto
		gap: 14px
		overflow: auto

		&__intro
			margin-bottom: 14px

			p
				margin: 0
				color: var(--ok-accent)
				font-size: 12px
				font-weight: 700
				text-transform: uppercase

			h2
				margin: 4px 0 0
				color: var(--ok-ink)
				font-size: 24px

		&__split
			min-height: 0
			display: grid
			grid-template-columns: minmax(0, 1fr) var(--document-panel-width)
			gap: 14px

	.editor,
	.terminal,
	.details-panel
		border: 1px solid var(--ok-line)
		border-radius: 8px
		background: var(--ok-panel)

	.editor
		min-height: 420px
		display: grid
		grid-template-rows: auto auto auto 1fr

		&__modes
			display: flex
			gap: 4px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 5px 8px
				background: var(--ok-surface)
				color: var(--ok-muted)
				cursor: pointer
				font-weight: 700

				&.active
					border-color: var(--ok-accent)
					color: var(--ok-ink)
					background: var(--ok-surface)

		&__collab
			padding: 8px 12px
			border-bottom: 1px solid var(--ok-line)

		&__tabs
			padding: 8px
			border-bottom: 1px solid var(--ok-line)
			display: flex
			gap: 6px
			overflow-x: auto

			button
				max-width: 180px
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 7px 9px
				background: var(--ok-surface)
				color: var(--ok-muted)
				cursor: pointer
				text-align: left

				&.active
					border-color: var(--ok-accent)
					color: var(--ok-ink)

			span,
			small
				display: block
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			small
				margin-top: 2px
				font-size: 10px
				text-transform: uppercase

		&__bar
			padding: 12px 14px
			border-bottom: 1px solid var(--ok-line)
			display: flex
			align-items: center
			justify-content: space-between
			gap: 16px
			color: var(--ok-muted)
			font-size: 13px

		&__actions
			display: flex
			gap: 6px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer

		&__notice
			padding: 10px 14px
			border-bottom: 1px solid var(--ok-line)
			background: var(--ok-surface)
			color: var(--ok-muted)
			display: flex
			align-items: center
			justify-content: space-between
			gap: 12px
			font-size: 13px

			&[data-tone='warning']
				color: var(--ok-warn)

			div
				display: flex
				gap: 6px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-panel)
				color: var(--ok-ink)
				cursor: pointer

		&__body
			padding: 28px
			color: var(--ok-muted)
			display: grid
			grid-template-rows: auto minmax(0, 1fr)
			gap: 18px

			h2
				margin: 0 0 10px
				color: var(--ok-ink)

			p
				margin: 0
				max-width: 680px

		&__state
			min-height: 320px
			border: 1px solid var(--ok-line)
			border-radius: 8px
			padding: 20px
			background: var(--ok-surface)
			color: var(--ok-muted)

			&[data-tone='danger']
				border-color: var(--ok-danger)

			h3
				margin: 0 0 8px
				color: var(--ok-ink)

			p
				margin: 0 0 14px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 7px 10px
				background: var(--ok-panel)
				color: var(--ok-ink)
				cursor: pointer

	.terminal
		position: relative
		min-height: 120px
		height: var(--terminal-height)
		max-height: 360px
		color: var(--ok-muted)
		overflow: auto
		display: grid
		grid-template-rows: auto minmax(0, 1fr)

		&.resizing
			user-select: none

		&__resize
			position: absolute
			inset: -5px 0 auto
			height: 10px
			border: 0
			padding: 0
			background: transparent
			cursor: row-resize

			&:focus-visible
				@include m.focus-ring(-2px, 2px)

			&:hover::after,
			&:focus-visible::after
				content: ''
				position: absolute
				inset: 4px 0
				background: var(--ok-accent)

		&__bar
			padding: 10px
			border-bottom: 1px solid var(--ok-line)
			display: flex
			align-items: center
			justify-content: space-between
			gap: 10px

		&__tabs
			min-width: 0
			display: flex
			gap: 6px
			overflow-x: auto

			button
				min-width: 92px
				max-width: 150px
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-muted)
				text-align: left
				cursor: pointer

				&.active
					border-color: var(--ok-accent)
					color: var(--ok-ink)

			span,
			small
				display: block
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			span
				font-weight: 700

			small
				margin-top: 2px
				font-size: 10px
				text-transform: uppercase

		&__actions
			display: flex
			gap: 6px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer
				font-size: 12px

		&__body
			min-height: 0
			padding: 14px
			overflow: auto

			span
				color: var(--ok-ink)
				font-weight: 700

			p
				margin: 6px 0 0
				font-size: 13px

			dl
				margin: 14px 0 0
				display: flex
				gap: 24px

			dt
				color: var(--ok-muted)
				font-size: 10px
				font-weight: 700
				text-transform: uppercase

			dd
				margin: 3px 0 0
				color: var(--ok-ink)

	.details-panel
		position: relative
		min-width: 280px
		max-width: 560px
		padding: 18px
		color: var(--ok-muted)
		overflow: auto

		&.resizing
			user-select: none

		&__resize
			position: absolute
			inset: 0 auto 0 -5px
			width: 10px
			border: 0
			padding: 0
			background: transparent
			cursor: col-resize

			&:focus-visible
				@include m.focus-ring(-2px, 2px)

			&:hover::after,
			&:focus-visible::after
				content: ''
				position: absolute
				inset: 0 4px
				background: var(--ok-accent)

		&__actions
			margin-top: 18px
			display: grid
			gap: 8px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 8px 10px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer

		p
			margin: 0
			color: var(--ok-accent)
			font-size: 12px
			font-weight: 700
			text-transform: uppercase

		h2
			margin: 6px 0 18px
			color: var(--ok-ink)
			font-size: 18px
			line-height: 1.25

		dl
			margin: 0
			display: grid
			gap: 14px

			div
				min-width: 0

		dt
			color: var(--ok-muted)
			font-size: 11px
			font-weight: 700
			text-transform: uppercase

		dd
			margin: 4px 0 0
			color: var(--ok-ink)
			overflow-wrap: anywhere

	@media (max-width: 940px)
		.surface
			&__split
				grid-template-columns: minmax(0, 1fr)

		.details-panel
			display: none
</style>
