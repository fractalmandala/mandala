<script lang="ts">
	import {
		BUNDLED_SKILLS,
		skillsStore,
		skillTargetsStore,
		toggleSkillEnabled,
		toggleSkillTarget,
		workspaceDocuments,
		syncSkillsPipeline,
	} from '$lib/shell';
	import type { SkillTargetEditor } from '$lib/shell';

	let skills = $derived($skillsStore);
	let targets = $derived($skillTargetsStore);
	let documents = $derived($workspaceDocuments);
	let expandedMetadataId = $state<string | null>(null);

	$effect(() => {
		if (documents.length > 0) {
			syncSkillsPipeline(documents);
		} else if ($skillsStore.length === 0) {
			skillsStore.set(BUNDLED_SKILLS);
		}
	});

	let bundledSkills = $derived(skills.filter((s) => s.scope === 'bundled'));
	let projectSkills = $derived(skills.filter((s) => s.scope === 'project'));

	function toggleTarget(target: SkillTargetEditor, checked: boolean): void {
		toggleSkillTarget(target, checked);
	}

	function toggleExpanded(id: string): void {
		expandedMetadataId = expandedMetadataId === id ? null : id;
	}
</script>

<section class="settings-section" aria-labelledby="settings-skills-title" data-testid="settings-skills-section">
	<div>
		<h3 id="settings-skills-title">Skills</h3>
		<p>
			Skills teach agents repeatable workflows and tasks. Enable or disable bundled and project skills.
		</p>
	</div>

	<!-- Skill Target Editors Picker -->
	<div class="targets-card" data-testid="skill-targets-picker">
		<strong>Project skills into target editors</strong>
		<p class="card-subtitle">Choose which target editors receive enabled skills for this project.</p>
		<div class="targets-grid">
			<label class="switch">
				<input
					type="checkbox"
					checked={targets.claude}
					onchange={(e) => toggleTarget('claude', e.currentTarget.checked)}
					data-testid="skill-target-claude"
				/>
				<span>Claude Code</span>
			</label>
			<label class="switch">
				<input
					type="checkbox"
					checked={targets.codex}
					onchange={(e) => toggleTarget('codex', e.currentTarget.checked)}
					data-testid="skill-target-codex"
				/>
				<span>Codex</span>
			</label>
			<label class="switch">
				<input
					type="checkbox"
					checked={targets.cursor}
					onchange={(e) => toggleTarget('cursor', e.currentTarget.checked)}
					data-testid="skill-target-cursor"
				/>
				<span>Cursor</span>
			</label>
			<label class="switch">
				<input
					type="checkbox"
					checked={targets.builtin}
					onchange={(e) => toggleTarget('builtin', e.currentTarget.checked)}
					data-testid="skill-target-builtin"
				/>
				<span>Built-in Agents</span>
			</label>
		</div>
	</div>

	<!-- Bundled Skills Group -->
	<div class="scope-group" data-testid="skills-group-bundled">
		<div class="group-header">
			<h4>Bundled Skills</h4>
			<p>Standard skills included with OpenKnowledge for code guidance, styling, and accessibility.</p>
		</div>
		<div class="skills-card">
			<ul class="skills-list" data-testid="skills-group-bundled-list">
				{#each bundledSkills as skill (skill.id)}
					<li class="skill-row" data-testid={`skill-row-${skill.id}`}>
						<div class="skill-main">
							<div class="skill-info">
								<div class="title-line">
									<strong><code>{skill.name}</code></strong>
									<span class="badge bundled">bundled</span>
								</div>
								<small class="description">{skill.description}</small>
							</div>
							<div class="skill-controls">
								<button
									type="button"
									class="meta-btn"
									onclick={() => toggleExpanded(skill.id)}
									data-testid={`skill-meta-toggle-${skill.id}`}
								>
									{expandedMetadataId === skill.id ? 'Hide Meta' : 'Metadata'}
								</button>
								<label class="switch">
									<input
										type="checkbox"
										checked={skill.enabled}
										onchange={(e) => toggleSkillEnabled(skill.id, e.currentTarget.checked)}
										data-testid={`skill-toggle-${skill.id}`}
									/>
									<span>Enabled</span>
								</label>
							</div>
						</div>

						{#if expandedMetadataId === skill.id && skill.metadata}
							<div class="skill-meta-details" data-testid={`skill-meta-details-${skill.id}`}>
								<small>Path: <code>{skill.path}</code></small>
								<dl>
									{#each Object.entries(skill.metadata) as [key, val]}
										<div>
											<dt>{key}:</dt>
											<dd>{val}</dd>
										</div>
									{/each}
								</dl>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- Project Skills Group -->
	<div class="scope-group" data-testid="skills-group-project">
		<div class="group-header">
			<h4>Project Skills</h4>
			<p>Project-scoped skills authored under <code>.ok/skills/</code> in this workspace.</p>
		</div>
		<div class="skills-card">
			{#if projectSkills.length === 0}
				<p class="empty-msg" data-testid="skills-group-project-empty">
					No project skills yet. Author skills in <code>.ok/skills/&lt;skill-name&gt;/SKILL.md</code> to teach agents project-specific tasks.
				</p>
			{:else}
				<ul class="skills-list" data-testid="skills-group-project-list">
					{#each projectSkills as skill (skill.id)}
						<li class="skill-row" data-testid={`skill-row-${skill.id}`}>
							<div class="skill-main">
								<div class="skill-info">
									<div class="title-line">
										<strong><code>{skill.name}</code></strong>
										<span class="badge project">project</span>
									</div>
									<small class="description">{skill.description}</small>
								</div>
								<div class="skill-controls">
									<button
										type="button"
										class="meta-btn"
										onclick={() => toggleExpanded(skill.id)}
									>
										{expandedMetadataId === skill.id ? 'Hide Meta' : 'Metadata'}
									</button>
									<label class="switch">
										<input
											type="checkbox"
											checked={skill.enabled}
											onchange={(e) => toggleSkillEnabled(skill.id, e.currentTarget.checked)}
											data-testid={`skill-toggle-${skill.id}`}
										/>
										<span>Enabled</span>
									</label>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
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

	.targets-card
		@include m.panel
		padding: t.$space-3
		background: var(--ok-surface)
		display: grid
		gap: t.$space-2

		strong
			color: var(--ok-ink)
			font-size: t.$font-size-sm

	.card-subtitle
		font-size: t.$font-size-xs
		color: var(--ok-muted)

	.targets-grid
		display: grid
		grid-template-columns: repeat(2, minmax(0, 1fr))
		gap: t.$space-2
		margin-top: t.$space-1

	.scope-group
		display: grid
		gap: t.$space-2

	.group-header
		h4
			margin: 0
			font-size: t.$font-size-sm
			font-weight: 600
			color: var(--ok-ink)

		p
			margin: 2px 0 0 0
			font-size: t.$font-size-xs
			color: var(--ok-muted)

	.skills-card
		@include m.panel
		background: var(--ok-surface)

	.empty-msg
		padding: t.$space-4
		margin: 0
		font-size: t.$font-size-sm
		color: var(--ok-muted)

	.skills-list
		list-style: none
		margin: 0
		padding: 0

	.skill-row
		display: grid
		gap: t.$space-2
		padding: t.$space-3 t.$space-4
		border-bottom: 1px solid var(--ok-line)

		&:last-child
			border-bottom: 0

	.skill-main
		display: flex
		align-items: center
		justify-content: space-between
		gap: t.$space-3

	.skill-info
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

		&.bundled
			color: var(--ok-accent)
			border-color: var(--ok-accent)

	.description
		font-size: t.$font-size-xs
		color: var(--ok-muted)

	.skill-controls
		display: flex
		align-items: center
		gap: t.$space-3

	.meta-btn
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		padding: t.$space-1 t.$space-2
		background: var(--ok-panel)
		color: var(--ok-muted)
		font-size: t.$font-size-xs
		cursor: pointer
		@include m.press-feedback

		&:hover
			color: var(--ok-ink)

	.skill-meta-details
		border-top: 1px dashed var(--ok-line)
		padding-top: t.$space-2
		display: grid
		gap: t.$space-1
		font-size: t.$font-size-xs
		color: var(--ok-muted)

		dl
			display: grid
			grid-template-columns: repeat(2, minmax(0, 1fr))
			gap: t.$space-2
			margin: 0

			div
				display: flex
				gap: t.$space-1

			dt
				font-weight: 600

			dd
				margin: 0

	.switch
		display: flex
		align-items: center
		gap: t.$space-2
		cursor: pointer
		font-size: t.$font-size-xs

		input
			width: 14px
			height: 14px
</style>
