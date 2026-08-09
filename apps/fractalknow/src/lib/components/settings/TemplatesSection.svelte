<script lang="ts">
	import { desktopBridge } from '$lib/desktop';
	import {
		createTemplate,
		deleteTemplate,
		loadProjectTemplates,
		projectTemplates,
		renameTemplate,
	} from '$lib/shell';
	import type { ProjectTemplateItem } from '$lib/shell';

	let templates = $derived($projectTemplates);
	let isCreating = $state(false);
	let newTitle = $state('');
	let newDescription = $state('');
	let newContent = $state('');
	let deleteTarget = $state<ProjectTemplateItem | null>(null);

	let renamingTarget = $state<ProjectTemplateItem | null>(null);
	let renameTitle = $state('');

	$effect(() => {
		if ($desktopBridge.status === 'ready' && $projectTemplates.length === 0) {
			void loadProjectTemplates($desktopBridge.bridge);
		}
	});

	async function handleCreate(): Promise<void> {
		if (!newTitle.trim()) return;
		const bridge = $desktopBridge.status === 'ready' ? $desktopBridge.bridge : null;
		await createTemplate(bridge, newTitle, newContent, newDescription);
		isCreating = false;
		newTitle = '';
		newDescription = '';
		newContent = '';
	}

	async function handleDelete(item: ProjectTemplateItem): Promise<void> {
		const bridge = $desktopBridge.status === 'ready' ? $desktopBridge.bridge : null;
		await deleteTemplate(bridge, item.name);
		deleteTarget = null;
	}

	async function handleRename(): Promise<void> {
		if (!renamingTarget || !renameTitle.trim()) return;
		const bridge = $desktopBridge.status === 'ready' ? $desktopBridge.bridge : null;
		await renameTemplate(bridge, renamingTarget.name, renameTitle);
		renamingTarget = null;
		renameTitle = '';
	}
</script>

<section class="settings-section" aria-labelledby="settings-project-templates-title" data-testid="settings-project-templates-section">
	<div class="section-header">
		<div>
			<h3 id="settings-project-templates-title">Project templates</h3>
			<p>
				Stored at <code class="font-mono">.ok/templates/</code> in this project. Available across all folders.
			</p>
		</div>
		<button
			type="button"
			class="action-btn"
			onclick={() => (isCreating = !isCreating)}
			data-testid="settings-project-templates-new-button"
		>
			{isCreating ? 'Cancel' : '+ New Template'}
		</button>
	</div>

	{#if isCreating}
		<div class="create-form" data-testid="settings-templates-create-form">
			<label>
				<span>Template Title</span>
				<input
					type="text"
					placeholder="Sprint Plan"
					bind:value={newTitle}
					data-testid="new-template-title-input"
				/>
			</label>
			<label>
				<span>Description</span>
				<input
					type="text"
					placeholder="Standard sprint planning document scaffold"
					bind:value={newDescription}
					data-testid="new-template-desc-input"
				/>
			</label>
			<label>
				<span>Template Content (Markdown)</span>
				<textarea
					rows="4"
					placeholder="# Title\n\n## Overview\n"
					bind:value={newContent}
					data-testid="new-template-content-input"
				></textarea>
			</label>
			<button type="button" class="primary-btn" onclick={handleCreate} data-testid="save-new-template-btn">
				Save Template
			</button>
		</div>
	{/if}

	<div class="templates-card">
		{#if templates.length === 0}
			<p class="empty-msg" data-testid="settings-project-templates-empty">
				No project templates yet. Create one to make it available everywhere in this project.
			</p>
		{:else}
			<ul class="templates-list" data-testid="settings-project-templates-list">
				{#each templates as tpl (tpl.id)}
					<li class="template-row" data-testid={`template-row-${tpl.id}`}>
						<div class="template-info">
							<div class="title-line">
								<strong>{tpl.title}</strong>
								<span class="badge">project</span>
							</div>
							<small class="description">{tpl.description}</small>
						</div>
						<div class="row-actions">
							<button
								type="button"
								class="icon-btn"
								onclick={() => {
									renamingTarget = tpl;
									renameTitle = tpl.title;
								}}
								data-testid={`rename-template-${tpl.id}`}
							>
								Rename
							</button>
							<button
								type="button"
								class="icon-btn danger"
								onclick={() => (deleteTarget = tpl)}
								data-testid={`delete-template-${tpl.id}`}
							>
								Delete
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if renamingTarget}
		<div class="modal-backdrop">
			<div class="modal-card">
				<h4>Rename Template</h4>
				<input type="text" bind:value={renameTitle} data-testid="rename-template-input" />
				<div class="modal-actions">
					<button type="button" onclick={() => (renamingTarget = null)}>Cancel</button>
					<button type="button" class="primary-btn" onclick={handleRename} data-testid="confirm-rename-btn">
						Rename
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if deleteTarget}
		<div class="modal-backdrop">
			<div class="modal-card">
				<h4>Delete Template</h4>
				<p>Are you sure you want to delete <strong>{deleteTarget.title}</strong>?</p>
				<div class="modal-actions">
					<button type="button" onclick={() => (deleteTarget = null)}>Cancel</button>
					<button
						type="button"
						class="danger-btn"
						onclick={() => handleDelete(deleteTarget!)}
						data-testid="confirm-delete-template-btn"
					>
						Delete
					</button>
				</div>
			</div>
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

	.templates-card
		@include m.panel
		background: var(--ok-surface)

	.empty-msg
		padding: t.$space-4
		margin: 0
		font-size: t.$font-size-sm
		color: var(--ok-muted)

	.templates-list
		list-style: none
		margin: 0
		padding: 0

	.template-row
		display: flex
		align-items: center
		justify-content: space-between
		gap: t.$space-3
		padding: t.$space-3 t.$space-4
		border-bottom: 1px solid var(--ok-line)

		&:last-child
			border-bottom: 0

	.template-info
		display: grid
		gap: t.$space-1

	.title-line
		display: flex
		align-items: center
		gap: t.$space-2

		strong
			color: var(--ok-ink)
			font-size: t.$font-size-sm

	.badge
		font-size: t.$font-size-xs
		padding: 1px t.$space-2
		border-radius: t.$radius-sm
		background: var(--ok-panel)
		color: var(--ok-muted)
		border: 1px solid var(--ok-line)

	.description
		font-size: t.$font-size-xs
		color: var(--ok-muted)

	.row-actions
		display: flex
		align-items: center
		gap: t.$space-2

	.action-btn,
	.icon-btn
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		padding: t.$space-1 t.$space-3
		background: var(--ok-panel)
		color: var(--ok-ink)
		font-size: t.$font-size-sm
		cursor: pointer
		@include m.press-feedback

		&:hover
			background: var(--ok-surface)

		&.danger:hover
			color: var(--ok-danger)
			border-color: var(--ok-danger)

	.create-form
		@include m.panel
		padding: t.$space-3
		background: var(--ok-surface)
		display: grid
		gap: t.$space-3

		label
			display: grid
			gap: t.$space-1
			font-size: t.$font-size-xs
			color: var(--ok-ink)

			input,
			textarea
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-md
				padding: t.$space-2 t.$space-3
				background: var(--ok-panel)
				color: var(--ok-ink)
				font-size: t.$font-size-sm

				&:focus-visible
					@include m.focus-ring

	.primary-btn
		justify-self: start
		border: 0
		border-radius: t.$radius-md
		padding: t.$space-2 t.$space-3
		background: var(--ok-accent)
		color: var(--ok-panel)
		font-size: t.$font-size-sm
		font-weight: 500
		cursor: pointer
		@include m.press-feedback

	.danger-btn
		border: 0
		border-radius: t.$radius-md
		padding: t.$space-2 t.$space-3
		background: var(--ok-danger)
		color: var(--ok-panel)
		font-size: t.$font-size-sm
		cursor: pointer

	.modal-backdrop
		position: fixed
		inset: 0
		background: var(--ok-overlay-scrim)
		display: flex
		align-items: center
		justify-content: center
		z-index: t.$z-dialog

	.modal-card
		@include m.panel
		padding: t.$space-4
		background: var(--ok-panel)
		display: grid
		gap: t.$space-3
		width: 320px

		h4
			margin: 0
			color: var(--ok-ink)

		input
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-surface)
			color: var(--ok-ink)

	.modal-actions
		display: flex
		justify-content: flex-end
		gap: t.$space-2
</style>
