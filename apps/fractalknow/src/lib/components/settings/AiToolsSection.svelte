<script lang="ts">
	import { desktopBridge } from '$lib/desktop';
	import {
		agentDetection,
		appConfig,
		BUILTIN_AGENT_TOOLS,
		clearToolOverride,
		getToolState,
		refreshAgentDetections,
		setAgentToolConfig,
		setToolOverride,
	} from '$lib/shell';
	import type { AgentToolId } from '$lib/shell';

	let detections = $derived($agentDetection);
	let config = $derived($appConfig);

	$effect(() => {
		if ($desktopBridge.status === 'ready') {
			void refreshAgentDetections($desktopBridge.bridge);
		}
	});

	function handleToggle(toolId: AgentToolId, checked: boolean, currentCmd: string): void {
		setToolOverride(toolId, checked, currentCmd);
	}

	function handleCommandChange(toolId: AgentToolId, currentEnabled: boolean, cmd: string): void {
		setToolOverride(toolId, currentEnabled, cmd);
	}
</script>

<section class="settings-section" aria-labelledby="settings-ai-tools-title">
	<div>
		<h3 id="settings-ai-tools-title">AI Tools & Agent CLIs</h3>
		<p>
			Configure local AI coding agents (Claude Code, Codex, Cursor). Detect installed tools and customize launch templates.
		</p>
	</div>

	<div class="settings-card general-settings">
		<label class="switch">
			<input
				type="checkbox"
				checked={config.agentTools.allowTerminalTools}
				onchange={(e) => setAgentToolConfig({ allowTerminalTools: e.currentTarget.checked })}
				data-testid="settings-ai-tools-allow-terminal"
			/>
			<div>
				<strong>Allow terminal CLI launches</strong>
				<p>Permit agents to launch sub-shells in the docked terminal.</p>
			</div>
		</label>

		<label class="switch">
			<input
				type="checkbox"
				checked={config.agentTools.allowFilesystemTools}
				onchange={(e) => setAgentToolConfig({ allowFilesystemTools: e.currentTarget.checked })}
				data-testid="settings-ai-tools-allow-filesystem"
			/>
			<div>
				<strong>Allow filesystem tools</strong>
				<p>Allow local agent session logging and file operations.</p>
			</div>
		</label>
	</div>

	<div class="tools-list">
		<h4>Installed & Configured Agents</h4>
		{#each BUILTIN_AGENT_TOOLS as tool (tool.id)}
			{@const state = getToolState(config, tool.id)}
			{@const isDetected = detections[tool.id]}

			<div class="tool-card" data-testid={`ai-tool-card-${tool.id}`}>
				<div class="tool-header">
					<div class="tool-info">
						<strong>{tool.name}</strong>
						<span class="tool-badge" class:detected={isDetected}>
							{isDetected ? 'Detected on system' : 'Not detected'}
						</span>
					</div>
					<label class="switch">
						<input
							type="checkbox"
							checked={state.enabled}
							onchange={(e) => handleToggle(tool.id, e.currentTarget.checked, state.launchCommand)}
							data-testid={`ai-tool-toggle-${tool.id}`}
						/>
						<span>Enabled</span>
					</label>
				</div>

				<p class="tool-desc">{tool.description}</p>

				<div class="tool-launch">
					<label>
						<span>Launch Command Template</span>
						<input
							type="text"
							value={state.launchCommand}
							oninput={(e) => handleCommandChange(tool.id, state.enabled, (e.target as HTMLInputElement).value)}
							onchange={(e) => handleCommandChange(tool.id, state.enabled, (e.target as HTMLInputElement).value)}
							data-testid={`ai-tool-command-${tool.id}`}
						/>
					</label>
					{#if state.isOverridden}
						<button
							type="button"
							class="reset-btn"
							onclick={() => clearToolOverride(tool.id)}
							data-testid={`ai-tool-reset-${tool.id}`}
						>
							Reset Override
						</button>
					{/if}
				</div>
			</div>
		{/each}
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

	.settings-card
		@include m.panel
		padding: t.$space-3
		background: var(--ok-surface)
		display: grid
		gap: t.$space-3

	.tools-list
		display: grid
		gap: t.$space-3

		h4
			margin: 0
			font-size: t.$font-size-sm
			font-weight: 600
			color: var(--ok-ink)

	.tool-card
		@include m.panel
		padding: t.$space-3
		background: var(--ok-surface)
		display: grid
		gap: t.$space-2

	.tool-header
		display: flex
		align-items: center
		justify-content: space-between
		gap: t.$space-3

	.tool-info
		display: flex
		align-items: center
		gap: t.$space-2

		strong
			color: var(--ok-ink)
			font-size: t.$font-size-sm

	.tool-badge
		font-size: t.$font-size-xs
		padding: 2px t.$space-2
		border-radius: t.$radius-sm
		background: var(--ok-panel)
		color: var(--ok-muted)
		border: 1px solid var(--ok-line)

		&.detected
			color: var(--ok-accent)
			border-color: var(--ok-accent)

	.tool-desc
		margin: 0
		font-size: t.$font-size-xs
		color: var(--ok-muted)

	.tool-launch
		display: grid
		grid-template-columns: minmax(0, 1fr) auto
		align-items: end
		gap: t.$space-2
		margin-top: t.$space-1

		label
			display: grid
			gap: t.$space-1
			font-size: t.$font-size-xs
			color: var(--ok-ink)

			input
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-md
				padding: t.$space-2 t.$space-3
				background: var(--ok-panel)
				color: var(--ok-ink)
				font-size: t.$font-size-sm

				&:focus-visible
					@include m.focus-ring

	.reset-btn
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-md
		padding: t.$space-2 t.$space-3
		background: var(--ok-panel)
		color: var(--ok-muted)
		font-size: t.$font-size-xs
		cursor: pointer
		@include m.press-feedback

		&:hover
			color: var(--ok-ink)

	.switch
		display: flex
		align-items: flex-start
		gap: t.$space-3
		cursor: pointer

		input
			margin-top: 3px
			width: 16px
			height: 16px

		strong
			color: var(--ok-ink)
			font-size: t.$font-size-sm

		p
			margin-top: 2px
</style>
