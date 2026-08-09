<script lang="ts">
	import { desktopBridge } from '$lib/desktop';
	import {
		appendPattern,
		checkHeuristicWarnings,
		countMatches,
		editPatternAt,
		listPatterns,
		loadOkignore,
		okignoreText,
		parseOkignoreDoc,
		removePatternAt,
		saveOkignore,
		serializeOkignoreDoc,
		workspaceDocuments,
	} from '$lib/shell';

	let text = $derived($okignoreText);
	let documents = $derived($workspaceDocuments);
	let filePaths = $derived(documents.map((d) => d.path));

	let doc = $derived(parseOkignoreDoc(text));
	let patterns = $derived(listPatterns(doc));

	let showAdvanced = $state(false);
	let newPatternText = $state('');

	$effect(() => {
		if ($desktopBridge.status === 'ready') {
			void loadOkignore($desktopBridge.bridge);
		}
	});

	async function updateOkignoreText(nextText: string): Promise<void> {
		const bridge = $desktopBridge.status === 'ready' ? $desktopBridge.bridge : null;
		await saveOkignore(bridge, nextText);
	}

	async function handleAddPattern(): Promise<void> {
		const trimmed = newPatternText.trim();
		if (!trimmed) return;
		const updatedDoc = appendPattern(doc, trimmed);
		await updateOkignoreText(serializeOkignoreDoc(updatedDoc));
		newPatternText = '';
	}

	async function handleEditPattern(index: number, nextValue: string): Promise<void> {
		const updatedDoc = editPatternAt(doc, index, nextValue);
		await updateOkignoreText(serializeOkignoreDoc(updatedDoc));
	}

	async function handleRemovePattern(index: number): Promise<void> {
		const updatedDoc = removePatternAt(doc, index);
		await updateOkignoreText(serializeOkignoreDoc(updatedDoc));
	}

	async function handleRawTextChange(e: Event & { currentTarget: HTMLTextAreaElement }): Promise<void> {
		await updateOkignoreText(e.currentTarget.value);
	}
</script>

<section class="settings-section" aria-labelledby="settings-okignore-title" data-testid="settings-okignore-section">
	<div class="section-header">
		<div>
			<h3 id="settings-okignore-title">Ignore patterns</h3>
			<p>
				Hide files and folders from your knowledge base. Hidden items don't appear in the file tree or search.
			</p>
		</div>
		<button
			type="button"
			class="action-btn"
			onclick={() => (showAdvanced = !showAdvanced)}
			data-testid="settings-okignore-show-advanced-toggle"
		>
			{showAdvanced ? 'Hide advanced' : 'Show advanced'}
		</button>
	</div>

	{#if showAdvanced}
		<div class="advanced-editor">
			<textarea
				value={text}
				oninput={handleRawTextChange}
				rows="8"
				placeholder="# One pattern per line.\n# Examples:\n#   drafts/\n#   *.draft.md\n#   !keep.md"
				data-testid="settings-okignore-advanced-textarea"
			></textarea>
		</div>
	{:else}
		<div class="patterns-card">
			{#if patterns.length === 0}
				<p class="empty-msg" data-testid="settings-okignore-empty">
					No patterns yet. Type a folder or file pattern below to start hiding files.
				</p>
			{:else}
				<ul class="patterns-list" data-testid="settings-okignore-list">
					{#each patterns as pattern, idx (idx)}
						{@const warnings = checkHeuristicWarnings(pattern.text)}
						{@const matchCount = countMatches(pattern.text, filePaths)}
						<li class="pattern-row" data-testid="settings-okignore-row">
							<div class="input-wrap">
								<input
									type="text"
									value={pattern.text}
									onblur={(e) => handleEditPattern(idx, e.currentTarget.value)}
									onkeydown={(e) => {
										if (e.key === 'Enter') e.currentTarget.blur();
									}}
									data-testid="settings-okignore-row-input"
								/>
								{#if warnings.length > 0}
									<span
										class="warning-badge"
										title={warnings.map((w) => w.message).join(' ')}
										data-testid="settings-okignore-warning-indicator"
									>
										⚠️
									</span>
								{/if}
								<span class="preview-count" data-testid="pattern-preview-count">
									matches {matchCount} {matchCount === 1 ? 'file' : 'files'}
								</span>
							</div>
							<button
								type="button"
								class="remove-btn"
								onclick={() => handleRemovePattern(idx)}
								data-testid="settings-okignore-remove"
							>
								✕
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="add-row" data-testid="settings-okignore-add">
			{#if true}
				{@const addWarnings = checkHeuristicWarnings(newPatternText)}
				{@const addMatchCount = countMatches(newPatternText, filePaths)}
				<div class="add-input-wrap">
					<input
						type="text"
						placeholder="e.g. drafts/ or *.draft.md"
						bind:value={newPatternText}
						onkeydown={(e) => {
							if (e.key === 'Enter') void handleAddPattern();
						}}
						data-testid="settings-okignore-add-input"
					/>
					{#if addWarnings.length > 0}
						<span class="warning-badge" title={addWarnings.map((w) => w.message).join(' ')}>⚠️</span>
					{/if}
					{#if newPatternText.trim().length > 0}
						<span class="preview-count">would match {addMatchCount} {addMatchCount === 1 ? 'file' : 'files'}</span>
					{/if}
				</div>
				<button
					type="button"
					class="primary-btn"
					onclick={handleAddPattern}
					disabled={newPatternText.trim().length === 0}
					data-testid="settings-okignore-add-button"
				>
					Add pattern
				</button>
			{/if}
		</div>
	{/if}
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.settings-section
		display: grid
		gap: t.$space-4

		h3
			margin: 0
			font-size: t.$font-size-base
			font-weight: 600
			color: var(--ok-ink)

		p
			margin: t.$space-1 0 0 0
			font-size: t.$font-size-sm
			color: var(--ok-muted)

	.section-header
		display: flex
		align-items: center
		justify-content: space-between
		gap: t.$space-3

	.patterns-card
		@include m.panel
		background: var(--ok-surface)

	.empty-msg
		padding: t.$space-4
		margin: 0
		font-size: t.$font-size-sm
		color: var(--ok-muted)

	.patterns-list
		list-style: none
		margin: 0
		padding: 0

	.pattern-row
		display: flex
		align-items: center
		justify-content: space-between
		gap: t.$space-3
		padding: t.$space-2 t.$space-3
		border-bottom: 1px solid var(--ok-line)

		&:last-child
			border-bottom: 0

	.input-wrap
		display: flex
		align-items: center
		gap: t.$space-2
		flex: 1

		input
			flex: 1
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-1 t.$space-3
			background: var(--ok-panel)
			color: var(--ok-ink)
			font-size: t.$font-size-sm
			font-family: monospace

			&:focus-visible
				@include m.focus-ring

	.warning-badge
		font-size: t.$font-size-xs
		cursor: help

	.preview-count
		font-size: t.$font-size-xs
		color: var(--ok-muted)

	.remove-btn
		border: 0
		background: transparent
		color: var(--ok-muted)
		font-size: t.$font-size-sm
		cursor: pointer
		padding: t.$space-1

		&:hover
			color: var(--ok-danger)

	.add-row
		display: flex
		align-items: center
		gap: t.$space-2

	.add-input-wrap
		display: flex
		align-items: center
		gap: t.$space-2
		flex: 1

		input
			flex: 1
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-panel)
			color: var(--ok-ink)
			font-size: t.$font-size-sm
			font-family: monospace

	.action-btn
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		padding: t.$space-1 t.$space-3
		background: var(--ok-panel)
		color: var(--ok-ink)
		font-size: t.$font-size-xs
		cursor: pointer

	.primary-btn
		border: 0
		border-radius: t.$radius-md
		padding: t.$space-2 t.$space-3
		background: var(--ok-accent)
		color: var(--ok-panel)
		font-size: t.$font-size-sm
		font-weight: 500
		cursor: pointer
		@include m.press-feedback

		&:disabled
			opacity: 0.5
			cursor: not-allowed

	.advanced-editor
		textarea
			width: 100%
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-3
			background: var(--ok-panel)
			color: var(--ok-ink)
			font-family: monospace
			font-size: t.$font-size-xs
</style>
