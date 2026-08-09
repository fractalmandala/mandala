<script lang="ts">
	import {
		setAutoApproveOkTools,
		setTerminalCursorBlink,
		setTerminalCursorStyle,
		setTerminalEnabled,
		setTerminalFontFamily,
		setTerminalFontSize,
		setTerminalScrollback,
		setTerminalShellPath,
		shellPreferences,
	} from '$lib/shell';

	let prefs = $derived($shellPreferences);
</script>

<section class="settings-section" aria-labelledby="settings-terminal-title">
	<div>
		<h3 id="settings-terminal-title">Terminal</h3>
		<p>Run a real terminal docked inside OpenKnowledge, starting in this project's folder.</p>
	</div>

	<div class="settings-card">
		<label class="switch" for="terminal-enabled-toggle">
			<input
				id="terminal-enabled-toggle"
				type="checkbox"
				checked={prefs.terminalEnabled}
				onchange={(e) => setTerminalEnabled(e.currentTarget.checked)}
				data-testid="settings-terminal-toggle"
			/>
			<div>
				<strong>Enable terminal for this project</strong>
				<p data-testid="settings-terminal-body">
					{prefs.terminalEnabled
						? 'Commands run with the full access of your macOS user account on this machine. Turn this off to disable the shell.'
						: 'A real shell is off for this project. Turning it on runs commands with the full access of your macOS user account.'}
				</p>
			</div>
		</label>
	</div>

	<div class="settings-card">
		<label class="switch" for="terminal-autoapprove-toggle">
			<input
				id="terminal-autoapprove-toggle"
				type="checkbox"
				checked={prefs.autoApproveOkTools}
				onchange={(e) => setAutoApproveOkTools(e.currentTarget.checked)}
				data-testid="settings-terminal-autoapprove-toggle"
			/>
			<div>
				<strong>Let agents use OpenKnowledge without asking</strong>
				<p data-testid="settings-terminal-autoapprove-body">
					Applies to all projects on this machine. Claude and Codex auto-approve OpenKnowledge's read and write tools.
				</p>
			</div>
		</label>
	</div>

	<div class="settings-grid">
		<label>
			<span>Font Size (pt)</span>
			<input
				type="number"
				min="8"
				max="32"
				value={prefs.terminalFontSize}
				onchange={(e) => setTerminalFontSize(Number(e.currentTarget.value))}
				data-testid="settings-terminal-font-size"
			/>
		</label>

		<label>
			<span>Font Family</span>
			<input
				type="text"
				value={prefs.terminalFontFamily}
				onchange={(e) => setTerminalFontFamily(e.currentTarget.value)}
				data-testid="settings-terminal-font-family"
			/>
		</label>

		<label>
			<span>Scrollback Lines</span>
			<input
				type="number"
				min="100"
				max="50000"
				step="100"
				value={prefs.terminalScrollback}
				onchange={(e) => setTerminalScrollback(Number(e.currentTarget.value))}
				data-testid="settings-terminal-scrollback"
			/>
		</label>

		<label>
			<span>Cursor Style</span>
			<select
				value={prefs.terminalCursorStyle}
				onchange={(e) => setTerminalCursorStyle(e.currentTarget.value as 'block' | 'underline' | 'bar')}
				data-testid="settings-terminal-cursor-style"
			>
				<option value="block">Block</option>
				<option value="underline">Underline</option>
				<option value="bar">Bar</option>
			</select>
		</label>

		<label class="switch">
			<input
				type="checkbox"
				checked={prefs.terminalCursorBlink}
				onchange={(e) => setTerminalCursorBlink(e.currentTarget.checked)}
				data-testid="settings-terminal-cursor-blink"
			/>
			<span>Cursor Blink</span>
		</label>

		<label>
			<span>Shell Path Override</span>
			<input
				type="text"
				placeholder="/bin/zsh"
				value={prefs.terminalShellPath}
				onchange={(e) => setTerminalShellPath(e.currentTarget.value)}
				data-testid="settings-terminal-shell-path"
			/>
		</label>
	</div>

	<p class="settings-note">
		Note: Font, shell path, and scrollback changes apply on next terminal process spawn.
	</p>
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

	.settings-grid
		display: grid
		grid-template-columns: repeat(2, minmax(0, 1fr))
		gap: t.$space-3

		label
			display: grid
			gap: t.$space-1
			font-size: t.$font-size-sm
			color: var(--ok-ink)

			input,
			select
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-md
				padding: t.$space-2 t.$space-3
				background: var(--ok-panel)
				color: var(--ok-ink)
				font-size: t.$font-size-sm

				&:focus-visible
					@include m.focus-ring

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

	.settings-note
		font-size: t.$font-size-xs
		color: var(--ok-muted)
		font-style: italic
</style>
