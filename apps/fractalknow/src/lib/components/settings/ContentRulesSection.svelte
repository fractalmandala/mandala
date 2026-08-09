<script lang="ts">
	import { setValidationConfig, validationConfig } from '$lib/shell';
	import type { EditorDiagnosticSeverity } from '$lib/editor/diagnostics';

	let config = $derived($validationConfig);

	function updateRule(patch: Partial<typeof config>): void {
		setValidationConfig(patch);
	}
</script>

<section class="settings-section" aria-labelledby="settings-content-rules-title" data-testid="settings-content-rules">
	<div>
		<h3 id="settings-content-rules-title">Content rules</h3>
		<p>
			How validation findings surface across the project. Rule toggles and severities are committed to project config.
		</p>
	</div>

	<div class="rules-card">
		<!-- Global Validation Switches -->
		<div class="rule-row">
			<div class="rule-info">
				<label for="validate-on-save-toggle"><strong>Validate on save</strong></label>
				<small>Automatically run validation when saving markdown documents.</small>
			</div>
			<label class="switch" for="validate-on-save-toggle">
				<input
					id="validate-on-save-toggle"
					type="checkbox"
					checked={config.validateOnSave}
					onchange={(e) => updateRule({ validateOnSave: e.currentTarget.checked })}
					data-testid="settings-validate-on-save-toggle"
				/>
				<span>{config.validateOnSave ? 'Enabled' : 'Disabled'}</span>
			</label>
		</div>

		<div class="rule-row">
			<div class="rule-info">
				<strong>Problem indicators in file explorer</strong>
				<small>Tint and badge files that have lint or link problems without opening them.</small>
			</div>
			<label class="switch">
				<input
					type="checkbox"
					checked={config.fileTreeIndicators}
					onchange={(e) => updateRule({ fileTreeIndicators: e.currentTarget.checked })}
					data-testid="settings-content-rules-indicators"
				/>
				<span>{config.fileTreeIndicators ? 'Enabled' : 'Disabled'}</span>
			</label>
		</div>
	</div>

	<div class="rules-card">
		<h4 class="card-heading">Rule Configurations & Severities</h4>

		<!-- Frontmatter Requirements -->
		<div class="rule-row" data-testid="rule-row-frontmatter">
			<div class="rule-info">
				<strong>YAML Frontmatter Fences</strong>
				<small>Detect unclosed or malformed YAML frontmatter blocks at document start.</small>
			</div>
			<div class="rule-controls">
				<select
					value={config.frontmatterSeverity}
					onchange={(e) =>
						updateRule({ frontmatterSeverity: e.currentTarget.value as EditorDiagnosticSeverity })}
					disabled={!config.frontmatterValidation}
					data-testid="select-frontmatter-severity"
				>
					<option value="error">Error</option>
					<option value="warning">Warning</option>
					<option value="info">Info</option>
				</select>
				<label class="switch">
					<input
						type="checkbox"
						checked={config.frontmatterValidation}
						onchange={(e) => updateRule({ frontmatterValidation: e.currentTarget.checked })}
						data-testid="toggle-frontmatter-rule"
					/>
				</label>
			</div>
		</div>

		<!-- Broken Internal Links -->
		<div class="rule-row" data-testid="rule-row-links">
			<div class="rule-info">
				<strong>Internal Links & Bare URLs</strong>
				<small>Report unresolved wiki-links and bare URLs in editor diagnostics.</small>
			</div>
			<div class="rule-controls">
				<select
					value={config.linkSeverity}
					onchange={(e) =>
						updateRule({ linkSeverity: e.currentTarget.value as EditorDiagnosticSeverity })}
					disabled={!config.linkValidation}
					data-testid="select-link-severity"
				>
					<option value="error">Error</option>
					<option value="warning">Warning</option>
					<option value="info">Info</option>
				</select>
				<label class="switch">
					<input
						type="checkbox"
						checked={config.linkValidation}
						onchange={(e) => updateRule({ linkValidation: e.currentTarget.checked })}
						data-testid="toggle-link-rule"
					/>
				</label>
			</div>
		</div>

		<!-- Heading Structure -->
		<div class="rule-row" data-testid="rule-row-heading">
			<div class="rule-info">
				<strong>Heading Structure</strong>
				<small>Flag excessive heading depths (level > 6) and invalid nesting.</small>
			</div>
			<div class="rule-controls">
				<select
					value={config.headingSeverity}
					onchange={(e) =>
						updateRule({ headingSeverity: e.currentTarget.value as EditorDiagnosticSeverity })}
					disabled={!config.headingStructureValidation}
					data-testid="select-heading-severity"
				>
					<option value="error">Error</option>
					<option value="warning">Warning</option>
					<option value="info">Info</option>
				</select>
				<label class="switch">
					<input
						type="checkbox"
						checked={config.headingStructureValidation}
						onchange={(e) => updateRule({ headingStructureValidation: e.currentTarget.checked })}
						data-testid="toggle-heading-rule"
					/>
				</label>
			</div>
		</div>

		<!-- Trailing Whitespace -->
		<div class="rule-row" data-testid="rule-row-trailing">
			<div class="rule-info">
				<strong>Trailing Whitespace</strong>
				<small>Warn when lines contain trailing spaces or tabs.</small>
			</div>
			<div class="rule-controls">
				<select
					value={config.trailingWhitespaceSeverity}
					onchange={(e) =>
						updateRule({ trailingWhitespaceSeverity: e.currentTarget.value as EditorDiagnosticSeverity })}
					disabled={!config.trailingWhitespaceValidation}
					data-testid="select-trailing-severity"
				>
					<option value="error">Error</option>
					<option value="warning">Warning</option>
					<option value="info">Info</option>
				</select>
				<label class="switch">
					<input
						type="checkbox"
						checked={config.trailingWhitespaceValidation}
						onchange={(e) => updateRule({ trailingWhitespaceValidation: e.currentTarget.checked })}
						data-testid="toggle-trailing-rule"
					/>
				</label>
			</div>
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

	.rules-card
		@include m.panel
		background: var(--ok-surface)
		display: grid

	.card-heading
		margin: 0
		padding: t.$space-3 t.$space-4
		font-size: t.$font-size-sm
		font-weight: 600
		color: var(--ok-ink)
		border-bottom: 1px solid var(--ok-line)

	.rule-row
		display: flex
		align-items: center
		justify-content: space-between
		gap: t.$space-3
		padding: t.$space-3 t.$space-4
		border-bottom: 1px solid var(--ok-line)

		&:last-child
			border-bottom: 0

	.rule-info
		display: grid
		gap: 2px

		strong
			font-size: t.$font-size-sm
			color: var(--ok-ink)

		small
			font-size: t.$font-size-xs
			color: var(--ok-muted)

	.rule-controls
		display: flex
		align-items: center
		gap: t.$space-3

		select
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-1 t.$space-2
			background: var(--ok-panel)
			color: var(--ok-ink)
			font-size: t.$font-size-xs

			&:disabled
				opacity: 0.5
				cursor: not-allowed

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
