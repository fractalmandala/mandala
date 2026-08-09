<script lang="ts">
	import {
		activeDocument,
		desktopEventHistory,
		openDocuments,
		setRightPanelView,
		shellState,
		workspaceDocuments,
		closeRightPanel,
		setRightPanelWidth,
	} from '$lib/shell';
	import type { RightPanelView } from '$lib/shell';
	import StatusBadge from './ui/StatusBadge.svelte';
	import AgentActivity from './AgentActivity.svelte';

	const views: { value: RightPanelView; label: string; description: string }[] = [
		{ value: 'activity', label: 'Activity', description: 'Recent edits, menu actions, and bridge events.' },
		{ value: 'diagnostics', label: 'Diagnostics', description: 'Validation errors and link diagnostics.' },
		{ value: 'version-history', label: 'Versions', description: 'Saved versions of the active document.' },
		{ value: 'document', label: 'Document', description: 'Metadata, sync, and word count for the active document.' },
	];

	let resizing = $state(false);
	let startX = 0;
	let startWidth = 0;

	const rightPanelOpen = $derived($shellState.rightPanelOpen);
	const rightPanelView = $derived($shellState.rightPanelView);
	const rightPanelWidth = $derived($shellState.rightPanelWidth);

	const eventHistory = $derived($desktopEventHistory);
	const activeDoc = $derived($activeDocument);
	const openDocs = $derived($openDocuments);
	const versions = $derived(activeDoc?.versions ?? []);
	const dirty = $derived(Boolean(activeDoc?.dirty));
	const loadState = $derived(activeDoc?.loadState ?? 'idle');
	const syncState = $derived(activeDoc?.syncState ?? 'idle');
	const loadError = $derived(activeDoc?.loadError ?? null);
	const metadata = $derived(activeDoc?.metadata ?? null);

	const diagnostics = $derived([
		...(loadError ? [{ kind: 'load' as const, message: loadError }] : []),
		...openDocs.flatMap((document) => {
			const error = document.loadError;
			if (!error) return [];
			return [{ kind: 'load' as const, message: `${document.title}: ${error}` }];
		}),
	]);

	const wordCount = $derived(
		activeDoc ? countWords(activeDoc.content ?? '') : 0,
	);
	const lineCount = $derived(activeDoc ? (activeDoc.content ?? '').split('\n').length : 0);
	const updatedAt = $derived(activeDoc?.metadata?.updatedAt ?? null);

	function countWords(value: string): number {
		const trimmed = value.trim();
		if (!trimmed) return 0;
		return trimmed.split(/\s+/u).length;
	}

	function selectView(view: RightPanelView): void {
		setRightPanelView(view);
	}

	function startResize(event: PointerEvent): void {
		resizing = true;
		startX = event.clientX;
		startWidth = rightPanelWidth;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function resizeSidebar(event: PointerEvent): void {
		if (!resizing) return;
		const delta = startX - event.clientX;
		setRightPanelWidth(startWidth + delta);
	}

	function stopResize(event: PointerEvent): void {
		if (!resizing) return;
		resizing = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
	}

	function handleResizeKeydown(event: KeyboardEvent): void {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
			return;
		}
		event.preventDefault();
		if (event.key === 'Home') {
			setRightPanelWidth(240);
			return;
		}
		if (event.key === 'End') {
			setRightPanelWidth(640);
			return;
		}
		const direction = event.key === 'ArrowRight' ? 1 : -1;
		setRightPanelWidth(rightPanelWidth + direction * 16);
	}

	function formatDate(iso: string | null): string {
		if (!iso) return 'Never';
		try {
			return new Date(iso).toLocaleString();
		} catch {
			return iso;
		}
	}

	function formatBytes(bytes: number | null | undefined): string {
		if (bytes === null || bytes === undefined) return '—';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

{#if rightPanelOpen}
	<aside
		class="right-panel"
		class:resizing
		aria-label="Right panel"
		style={`--right-panel-width: ${rightPanelWidth}px`}
	>
		<header class="right-panel__header">
			<div class="right-panel__tabs" role="tablist" aria-label="Right panel views">
				{#each views as view (view.value)}
					<button
						type="button"
						role="tab"
						aria-selected={rightPanelView === view.value}
						class:active={rightPanelView === view.value}
						onclick={() => selectView(view.value)}
						title={view.description}
					>
						{view.label}
					</button>
				{/each}
			</div>
			<button
				type="button"
				class="right-panel__close"
				aria-label="Close right panel"
				onclick={closeRightPanel}
			>
				×
			</button>
		</header>

		<div class="right-panel__body" role="tabpanel" aria-label={views.find((v) => v.value === rightPanelView)?.label}>
			{#if rightPanelView === 'activity'}
				<AgentActivity />
				<section aria-label="Activity feed">
					<h2>Activity</h2>
					<p class="right-panel__hint">Most recent bridge, menu, and document events.</p>
					{#if eventHistory.length === 0}
						<div class="right-panel__empty">
							<strong>No recent activity</strong>
							<small>Actions you take will appear here.</small>
						</div>
					{:else}
						<ol class="activity" aria-live="polite">
							{#each eventHistory as event (event.id)}
								<li>
									<span class="activity__kind">{event.kind}</span>
									<span class="activity__label">{event.label}</span>
									<time datetime={event.recordedAt}>{formatDate(event.recordedAt)}</time>
								</li>
							{/each}
						</ol>
					{/if}
				</section>
			{:else if rightPanelView === 'diagnostics'}
				<section aria-label="Diagnostics">
					<h2>Diagnostics</h2>
					<p class="right-panel__hint">Validation errors and link diagnostics.</p>
					{#if diagnostics.length === 0}
						<div class="right-panel__empty">
							<strong>No issues found</strong>
							<small>All open documents are clean.</small>
						</div>
					{:else}
						<ul class="diagnostics" aria-live="polite">
							{#each diagnostics as item, index (index)}
								<li>
									<StatusBadge tone="error" label={item.kind} />
									<span>{item.message}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{:else if rightPanelView === 'version-history'}
				<section aria-label="Version history">
					<h2>Version history</h2>
					<p class="right-panel__hint">Saved snapshots of the active document.</p>
					{#if !activeDoc}
						<div class="right-panel__empty">
							<strong>No document open</strong>
							<small>Open a document to view its versions.</small>
						</div>
					{:else if versions.length === 0}
						<div class="right-panel__empty">
							<strong>No versions yet</strong>
							<small>Save the document to capture a snapshot.</small>
						</div>
					{:else}
						<ol class="versions">
							{#each versions as version (version.id)}
								<li>
									<strong>{version.title}</strong>
									<time datetime={version.createdAt}>{formatDate(version.createdAt)}</time>
								</li>
							{/each}
						</ol>
					{/if}
				</section>
			{:else if rightPanelView === 'document'}
				<section aria-label="Document overview">
					<h2>{activeDoc?.title ?? 'Document'}</h2>
					{#if !activeDoc}
						<div class="right-panel__empty">
							<strong>No document open</strong>
							<small>Open a document to see metadata here.</small>
						</div>
					{:else}
						<dl class="document-overview">
							<dt>Path</dt>
							<dd>{activeDoc.path}</dd>
							<dt>Kind</dt>
							<dd>{activeDoc.kind}</dd>
							<dt>Words</dt>
							<dd>{wordCount}</dd>
							<dt>Lines</dt>
							<dd>{lineCount}</dd>
							<dt>Size</dt>
							<dd>{formatBytes(metadata?.size)}</dd>
							<dt>Updated</dt>
							<dd>{formatDate(updatedAt)}</dd>
							<dt>Load state</dt>
							<dd>
								<StatusBadge
									tone={loadState === 'loaded'
										? 'success'
										: loadState === 'loading'
											? 'info'
											: loadState === 'failed'
												? 'error'
												: 'neutral'}
									label={loadState}
								/>
							</dd>
							<dt>Sync state</dt>
							<dd>
								<StatusBadge
									tone={syncState === 'saved'
										? 'success'
										: dirty
											? 'warning'
											: syncState === 'failed'
												? 'error'
												: 'info'}
									label={dirty ? 'dirty' : syncState}
								/>
							</dd>
						</dl>
					{/if}
				</section>
			{/if}
		</div>

		<button
			class="right-panel__resize"
			type="button"
			aria-label={`Resize right panel, current width ${rightPanelWidth}px`}
			onpointerdown={startResize}
			onpointermove={resizeSidebar}
			onpointerup={stopResize}
			onpointercancel={stopResize}
			onkeydown={handleResizeKeydown}
		></button>
	</aside>
{/if}

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.right-panel
		position: relative
		width: var(--right-panel-width)
		min-width: t.$shell-right-panel-min-width
		max-width: 32rem
		border-left: 1px solid var(--ok-line)
		background: var(--ok-panel)
		display: flex
		flex-direction: column
		@include m.scrollbar

		&.resizing
			user-select: none

		&__header
			display: flex
			align-items: center
			justify-content: space-between
			border-bottom: 1px solid var(--ok-line)
			padding: 0 t.$space-2

		&__tabs
			display: flex
			flex: 1
			min-width: 0

			button
				flex: 1
				min-width: 0
				border: 0
				background: transparent
				padding: t.$space-3 t.$space-2
				color: var(--ok-muted)
				font-size: t.$font-size-sm
				font-weight: 600
				cursor: pointer
				@include m.hover-transition(color)

				&:hover
					color: var(--ok-ink)

				&:focus-visible
					@include m.focus-ring(1px, 1px)

				&.active
					color: var(--ok-ink)
					box-shadow: inset 0 -2px 0 var(--ok-accent)

		&__close
			width: 28px
			height: 28px
			border: 0
			background: transparent
			color: var(--ok-muted)
			font-size: t.$font-size-lg
			cursor: pointer
			border-radius: t.$radius-sm
			@include m.hover-transition(color)

			&:hover
				color: var(--ok-ink)

			&:focus-visible
				@include m.focus-ring

		&__body
			min-height: 0
			flex: 1
			padding: t.$space-4
			overflow: auto

			h2
				margin: 0 0 t.$space-1
				color: var(--ok-ink)
				font-size: t.$font-size-lg

		&__hint
			margin: 0 0 t.$space-3
			color: var(--ok-muted)
			font-size: t.$font-size-xs

		&__empty
			border: 1px dashed var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-4
			color: var(--ok-muted)

			strong,
			small
				display: block

			strong
				color: var(--ok-ink)

			small
				margin-top: t.$space-1
				font-size: t.$font-size-xs

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

	.activity,
	.diagnostics,
	.versions
		list-style: none
		padding: 0
		margin: 0
		display: flex
		flex-direction: column
		gap: t.$space-2

	.activity
		li
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-surface)
			display: grid
			grid-template-columns: auto 1fr auto
			gap: t.$space-2
			align-items: center

			.activity__kind
				font-family: t.$font-family-mono
				font-size: t.$font-size-xs
				color: var(--ok-muted)
				text-transform: uppercase

			.activity__label
				color: var(--ok-ink)
				font-size: t.$font-size-sm
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			time
				color: var(--ok-muted)
				font-size: t.$font-size-xs
				font-variant-numeric: tabular-nums

	.diagnostics
		li
			border: 1px solid var(--ok-danger)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-surface)
			color: var(--ok-ink)
			display: flex
			gap: t.$space-2
			align-items: flex-start
			font-size: t.$font-size-sm

	.versions
		li
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-surface)
			display: flex
			align-items: center
			justify-content: space-between

			strong
				color: var(--ok-ink)
				font-size: t.$font-size-sm
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			time
				color: var(--ok-muted)
				font-size: t.$font-size-xs
				font-variant-numeric: tabular-nums

	.document-overview
		display: grid
		grid-template-columns: auto 1fr
		gap: t.$space-2 t.$space-3
		margin: 0
		font-size: t.$font-size-sm

		dt
			color: var(--ok-muted)
			text-transform: uppercase
			font-size: t.$font-size-xs
			font-weight: 700

		dd
			margin: 0
			color: var(--ok-ink)
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

	@media (prefers-reduced-motion: reduce)
		button
			transition: none
</style>