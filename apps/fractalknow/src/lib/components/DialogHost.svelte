<script lang="ts">
	import { desktopBridge } from '$lib/desktop';
	import type {
		AppInfo,
		OkBugReportCapture,
		OkFeedbackHandoff,
		OkThemeSource,
		UnsupportedDesktopFeature,
	} from '$lib/desktop';
	import {
		agentToolConfig,
		appearanceConfig,
		closeDialog,
		openDialog,
		projectConfigState,
		clearRecentProjects,
		clearTrashFailures,
		discardActiveChanges,
		saveActiveDocumentContent,
		trashFailures,
		workspaceDocuments,
		configPersistence,
		configRollbackState,
		configValidationIssues,
		desktopEventHistory,
		desktopEvents,
		openRecentProject,
		projectState,
		recentProjects,
		removeRecentProject,
		resetAppConfig,
		rollbackAppConfig,
		setAgentToolConfig,
		setAppearanceConfig,
		setEditorMode,
		setProjectConfig,
		setProjectFromFolder,
		setReducedTransparency,
		setSettingsQuery,
		setSettingsSection,
		setSyncCollaborationConfig,
		setThemeSource,
		setValidationConfig,
		syncCollaborationConfig,
		validationConfig,
		createDocument,
		createDocumentInFolder,
		defaultTemplates,
		projectTemplates,
		shellPreferences,
		shellState,
		updateActiveContent,
	} from '$lib/shell';
	import type { DialogKind, EditorMode, SettingsSection } from '$lib/shell';
	import { restoreFocus, trapFocus } from './ui/focus-trap';
	import TerminalSection from './settings/TerminalSection.svelte';
	import AiToolsSection from './settings/AiToolsSection.svelte';
	import TemplatesSection from './settings/TemplatesSection.svelte';
	import SkillsSection from './settings/SkillsSection.svelte';
	import IgnorePatternsSection from './settings/IgnorePatternsSection.svelte';
	import ContentRulesSection from './settings/ContentRulesSection.svelte';

	const titles: Record<DialogKind, string> = {
		settings: 'Settings',
		'create-project': 'Create Project',
		'clone-project': 'Clone Project',
		publish: 'Publish',
		consent: 'Consent Required',
		'bug-report': 'Report Bug',
		feedback: 'Send Feedback',
		'template-selection': 'Choose Template',
		'trash-failure': 'Delete Failed',
		'unsaved-changes': 'Unsaved Changes',
		'update-status': 'Update Status',
		'crash-recovery': 'Crash Recovery',
		'folder-picker': 'Choose Folder',
		none: '',
	};

	const settingsSections: { id: SettingsSection; label: string; terms: string }[] = [
		{ id: 'terminal', label: 'Terminal', terms: 'pty shell bash zsh font scrollback cursor auto approve startup' },
		{ id: 'project', label: 'Project', terms: 'workspace folder path api origin single file recent worktree' },
		{ id: 'editor', label: 'Editor', terms: 'mode rich source preview locale density line numbers' },
		{ id: 'appearance', label: 'Appearance', terms: 'theme transparency compact density preview' },
		{ id: 'validation', label: 'Validation', terms: 'save markdown frontmatter links metadata lint rules browser' },
		{ id: 'sync', label: 'Collaboration', terms: 'collaboration server auto sync mode presence name' },
		{ id: 'agents', label: 'AI Tools', terms: 'codex claude cursor custom tools terminal filesystem installed discover' },
		{ id: 'templates', label: 'Templates', terms: 'project template ok templates starter scaffold create' },
		{ id: 'skills', label: 'Skills', terms: 'skills agent targets prompt bundled project workflow' },
		{ id: 'ignore-patterns', label: 'Ignore patterns', terms: 'okignore gitignore hide filter exclude workspace rules' },
		{ id: 'runtime', label: 'Runtime', terms: 'bridge tauri events update server diagnostics hooks' },
	];

	let availableTemplates = $derived($projectTemplates.length > 0 ? $projectTemplates : defaultTemplates);

	let projectPickerStatus = $state<string | null>(null);
	let selectingProject = $state(false);
	let scaffoldingProject = $state(false);
	let projectNameInput = $state('fractalknow');
	let selectedTemplateId = $state('blank');
	let folderPickerDefault = $state('');
	let dirtyDocuments = $derived($workspaceDocuments.filter((document) => document.dirty));
	let appInfo = $state<AppInfo | null>(null);
	let appInfoStatus = $state('Loading runtime metadata');
	let bugSummary = $state('');
	let bugDetails = $state('');
	let bugAttachDiagnostics = $state(true);
	let bugReportStatus = $state<string | null>(null);
	let submittingBugReport = $state(false);
	let feedbackTopic = $state('Product feedback');
	let feedbackMessage = $state('');
	let feedbackStatus = $state<string | null>(null);
	let submittingFeedback = $state(false);

	let bridgeConfig = $derived($desktopBridge.status === 'ready' ? $desktopBridge.bridge.config : null);
	let bridgeRuntime = $derived($desktopBridge.status === 'ready' ? $desktopBridge.bridge.runtime : 'loading');
	let filteredSettingsSections = $derived(filterSettingsSections($shellPreferences.settingsQuery));
	let visibleSettingsSection = $derived(
		filteredSettingsSections.some((section) => section.id === $shellPreferences.settingsSection)
			? $shellPreferences.settingsSection
			: filteredSettingsSections[0]?.id,
	);
	let dialogPanel: HTMLElement | null = $state(null);
	let previousFocus: Element | null = null;
	let releaseTrap: (() => void) | null = null;

	function handleOverlayClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) closeDialog();
	}

	function handleDialogKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			closeDialog();
		}
	}

	$effect(() => {
		const open = $shellState.activeDialog !== 'none';
		if (!open) {
			releaseTrap?.();
			releaseTrap = null;
			restoreFocus(previousFocus);
			previousFocus = null;
			return;
		}
		previousFocus = document.activeElement;
		queueMicrotask(() => {
			if (dialogPanel) releaseTrap = trapFocus(dialogPanel);
		});
		return () => {
			releaseTrap?.();
			releaseTrap = null;
		};
	});

	async function setNativeTheme(source: OkThemeSource): Promise<void> {
		setThemeSource(source);
		if ($desktopBridge.status !== 'ready') return;
		await $desktopBridge.bridge.setThemeSource(source);
		$desktopBridge.bridge.signalThemeApplied({
			reducedTransparency: $shellPreferences.reducedTransparency,
		});
	}

	function setNativeTransparency(reducedTransparency: boolean): void {
		setReducedTransparency(reducedTransparency);
		if ($desktopBridge.status !== 'ready') return;
		$desktopBridge.bridge.signalThemeApplied({ reducedTransparency });
	}

	async function chooseProjectFolder(): Promise<void> {
		if ($desktopBridge.status !== 'ready') {
			projectPickerStatus = 'Native bridge is not ready.';
			return;
		}

		selectingProject = true;
		projectPickerStatus = null;
		try {
			const path = await $desktopBridge.bridge.dialog.openFolder({
				defaultPath: $projectState.path || undefined,
			});
			if (!path) {
				projectPickerStatus = 'No folder selected.';
				return;
			}
			setProjectFromFolder(path);
			projectNameInput = path.split(/[\\/]/).filter(Boolean).at(-1) ?? projectNameInput;
			projectPickerStatus = `Selected ${path}`;
		} catch (error) {
			projectPickerStatus = error instanceof Error ? error.message : 'Folder picker failed.';
		} finally {
			selectingProject = false;
		}
	}

	async function scaffoldCreateProject(): Promise<void> {
		if ($desktopBridge.status !== 'ready') {
			projectPickerStatus = 'Native bridge is not ready.';
			return;
		}

		scaffoldingProject = true;
		projectPickerStatus = null;
		try {
			let path = $projectState.path;
			if (!path) {
				const selected = await $desktopBridge.bridge.dialog.openFolder({});
				if (!selected) {
					projectPickerStatus = 'Choose a folder before creating a project.';
					return;
				}
				path = selected;
			}

			const name =
				projectNameInput.trim() || path.split(/[\\/]/).filter(Boolean).at(-1) || 'fractalknow';
			const result = await $desktopBridge.bridge.projects.create({ path, name });
			if (isUnsupportedFeature(result)) {
				// Browser preview: still open the folder and hydrate the virtual FS.
				setProjectFromFolder(path);
				const { connectProjectFilesBridge } = await import('$lib/editor/project-files');
				await connectProjectFilesBridge($desktopBridge.bridge);
				projectPickerStatus = `Opened ${path} (${result.feature} unavailable in this runtime).`;
			} else {
				setProjectFromFolder(path);
				const { connectProjectFilesBridge, createProjectPath } = await import(
					'$lib/editor/project-files'
				);
				await connectProjectFilesBridge($desktopBridge.bridge);
				if (selectedTemplateId === 'docs') {
					await createProjectPath('/content/Getting-Started.md', 'file', '# Getting started\n\n');
					await createProjectPath('/docs/Overview.md', 'file', '# Overview\n\n');
				} else if (selectedTemplateId === 'research') {
					await createProjectPath('/content/Notes.md', 'file', '# Notes\n\n');
					await createProjectPath('/content/References.md', 'file', '# References\n\n');
				}
				projectPickerStatus = `Created project ${name} at ${path}`;
			}
			closeDialog();
		} catch (error) {
			projectPickerStatus = error instanceof Error ? error.message : 'Project creation failed.';
		} finally {
			scaffoldingProject = false;
		}
	}

	function reopenProject(path: string): void {
		const project = $recentProjects.find((item) => item.path === path);
		if (!project) return;
		openRecentProject(project);
		projectPickerStatus = `Reopened ${project.path}`;
	}

	function filterSettingsSections(query: string): typeof settingsSections {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return settingsSections;
		return settingsSections.filter((section) =>
			`${section.label} ${section.terms}`.toLowerCase().includes(normalized),
		);
	}

	function selectTemplate(item: { id: string; title: string; description: string; content?: string }): void {
		selectedTemplateId = item.id;
		projectPickerStatus = `Template: ${item.title}`;
		if ($projectState.path && item.content) {
			closeDialog();
			createDocument();
			updateActiveContent(item.content);
		} else {
			openDialog('create-project');
		}
	}

	async function allowPendingConsent(): Promise<void> {
		const pending = $desktopEvents.consentRequired;
		if (!pending) {
			closeDialog();
			return;
		}
		if ($desktopBridge.status === 'ready') {
			try {
				await $desktopBridge.bridge.consent.grant(pending.scope, true);
			} catch (error) {
				console.warn('Failed to grant consent', error);
			}
		}
		closeDialog();
	}

	function denyPendingConsent(): void {
		const pending = $desktopEvents.consentRequired;
		if (pending && $desktopBridge.status === 'ready') {
			void $desktopBridge.bridge.consent.grant(pending.scope, false).catch((error) => {
				console.warn('Failed to record consent denial', error);
			});
		}
		closeDialog();
	}

	function isUnsupportedFeature(result: unknown): result is UnsupportedDesktopFeature {
		return Boolean(
			result
				&& typeof result === 'object'
				&& (result as Record<string, unknown>).ok === false
				&& typeof (result as Record<string, unknown>).feature === 'string',
		);
	}

	function isBugReportCapture(result: unknown): result is OkBugReportCapture {
		return Boolean(
			result
				&& typeof result === 'object'
				&& typeof (result as Record<string, unknown>).id === 'string'
				&& 'reportPath' in result,
		);
	}

	function isFeedbackHandoff(result: unknown): result is OkFeedbackHandoff {
		return Boolean(
			result
				&& typeof result === 'object'
				&& typeof (result as Record<string, unknown>).target === 'string'
				&& 'url' in result,
		);
	}

	async function submitBugReport(): Promise<void> {
		if ($desktopBridge.status !== 'ready') {
			bugReportStatus = 'Native bridge is not ready.';
			return;
		}

		submittingBugReport = true;
		bugReportStatus = null;
		try {
			const report = await $desktopBridge.bridge.feedback.captureBugReport();
			if (isUnsupportedFeature(report)) {
				bugReportStatus = report.message ?? `${report.feature} is not available yet.`;
				return;
			}
			if (!isBugReportCapture(report)) {
				bugReportStatus = 'Bug report capture returned an unsupported response.';
				return;
			}
			const summary = bugSummary.trim() || 'Untitled bug report';
			bugReportStatus = report.reportPath
				? `Captured ${summary} at ${report.reportPath}`
				: `Captured ${summary} (${report.id})`;
			bugSummary = '';
			bugDetails = '';
		} catch (error) {
			bugReportStatus = error instanceof Error ? error.message : 'Bug report capture failed.';
		} finally {
			submittingBugReport = false;
		}
	}

	async function submitFeedback(): Promise<void> {
		if ($desktopBridge.status !== 'ready') {
			feedbackStatus = 'Native bridge is not ready.';
			return;
		}

		submittingFeedback = true;
		feedbackStatus = null;
		try {
			const message = `${feedbackTopic}: ${feedbackMessage.trim()}`;
			const handoff = await $desktopBridge.bridge.feedback.submitFeedback(message);
			if (isUnsupportedFeature(handoff)) {
				feedbackStatus = handoff.message ?? `${handoff.feature} is not available yet.`;
				return;
			}
			if (!isFeedbackHandoff(handoff)) {
				feedbackStatus = 'Feedback handoff returned an unsupported response.';
				return;
			}
			if (handoff.url) await $desktopBridge.bridge.shell.openExternal(handoff.url);
			feedbackStatus =
				handoff.target === 'external-url'
					? 'Opened feedback handoff.'
					: handoff.target === 'native-share'
						? 'Sent feedback to native share sheet.'
						: 'Feedback handoff is not available on this platform.';
			feedbackMessage = '';
		} catch (error) {
			feedbackStatus = error instanceof Error ? error.message : 'Feedback handoff failed.';
		} finally {
			submittingFeedback = false;
		}
	}

	$effect(() => {
		if ($desktopBridge.status !== 'ready') {
			appInfo = null;
			appInfoStatus = $desktopBridge.status === 'loading' ? 'Loading runtime metadata' : $desktopBridge.error;
			return;
		}

		let cancelled = false;
		void $desktopBridge.bridge.appInfo()
			.then((info) => {
				if (cancelled) return;
				appInfo = info;
				appInfoStatus = 'Runtime metadata loaded';
			})
			.catch((error) => {
				if (cancelled) return;
				appInfo = null;
				appInfoStatus = error instanceof Error ? error.message : 'Runtime metadata unavailable';
			});

		return () => {
			cancelled = true;
		};
	});
</script>

{#if $shellState.activeDialog !== 'none'}
	<div class="overlay" role="presentation" onclick={handleOverlayClick} onkeydown={handleDialogKeydown}>
		<div
			class="dialog"
			bind:this={dialogPanel}
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			aria-describedby="dialog-body"
			tabindex="-1"
			onkeydown={handleDialogKeydown}
		>
			<header>
				<h2 id="dialog-title">{titles[$shellState.activeDialog]}</h2>
				<button type="button" aria-label="Close dialog" onclick={closeDialog}>×</button>
			</header>

			<div class="dialog__body" id="dialog-body">
				{#if $shellState.activeDialog === 'settings'}
					<div class="settings-shell">
						<nav class="settings-nav" aria-label="Settings sections">
							<label>
								<span>Search settings</span>
								<input
									type="search"
									value={$shellPreferences.settingsQuery}
									oninput={(event) => setSettingsQuery(event.currentTarget.value)}
								/>
							</label>
							{#each filteredSettingsSections as section (section.id)}
								<button
									type="button"
									class:active={visibleSettingsSection === section.id}
									aria-pressed={visibleSettingsSection === section.id}
									onclick={() => setSettingsSection(section.id)}
									data-testid={`settings-nav-${section.id}`}
								>
									{section.label}
								</button>
							{:else}
								<p>No matching settings</p>
							{/each}
						</nav>

						<div class="settings-content">
							{#if visibleSettingsSection === 'terminal'}
								<TerminalSection />
							{:else if visibleSettingsSection === 'project'}
								<section class="settings-section" aria-labelledby="settings-project">
									<div>
										<h3 id="settings-project">Project</h3>
										<p>{$projectState.notice ?? 'Workspace state is persisted locally.'}</p>
									</div>
									<dl>
										<div>
											<dt>Name</dt>
											<dd>{$projectState.name}</dd>
										</div>
										<div>
											<dt>Path</dt>
											<dd>{$projectState.path || bridgeConfig?.projectPath || 'No folder selected'}</dd>
										</div>
										<div>
											<dt>Source</dt>
											<dd>{$projectState.source}</dd>
										</div>
										<div>
											<dt>Config write</dt>
											<dd>{$configPersistence.status}</dd>
										</div>
									</dl>
									{#if $configValidationIssues.length > 0 || $configPersistence.error}
										<div class="settings-errors" role="alert">
											<strong>Settings need attention</strong>
											{#if $configPersistence.error}
												<p>{$configPersistence.error}</p>
											{/if}
											{#each $configValidationIssues as issue}
												<p>{issue.path}: {issue.message}</p>
											{/each}
											<button type="button" disabled={!$configRollbackState.available} onclick={rollbackAppConfig}>
												Roll back changes
											</button>
										</div>
									{/if}
									<label>
										API origin
										<input
											type="url"
											value={bridgeConfig?.apiOrigin ?? ''}
											onchange={(event) => setProjectConfig({ apiOrigin: event.currentTarget.value })}
										/>
									</label>
									<label>
										Worktree root
										<input
											type="text"
											value={$projectConfigState?.worktreeRoot ?? ''}
											onchange={(event) => setProjectConfig({ worktreeRoot: event.currentTarget.value })}
										/>
									</label>
									<button type="button" disabled={selectingProject} onclick={chooseProjectFolder}>
										{selectingProject ? 'Opening...' : 'Choose Folder'}
									</button>
									{#if $recentProjects.length > 0}
										<div class="recent-projects">
											<div>
												<strong>Recent projects</strong>
												<button type="button" onclick={clearRecentProjects}>Clear</button>
											</div>
											{#each $recentProjects as project (project.path)}
												<div class="recent-project">
													<button type="button" onclick={() => reopenProject(project.path)}>
														<span>{project.name}</span>
														<small>{project.path}</small>
													</button>
													<button
														type="button"
														aria-label={`Remove ${project.name} from recent projects`}
														onclick={() => removeRecentProject(project.path)}
													>
														×
													</button>
												</div>
											{/each}
										</div>
									{/if}
								</section>
							{:else if visibleSettingsSection === 'editor'}
								<section class="settings-section" aria-labelledby="settings-editor">
									<div>
										<h3 id="settings-editor">Editor</h3>
										<p>Editor mode and view preferences are shared with toolbar and save flows.</p>
									</div>
									<label>
										Editor mode
										<select
											value={$shellState.editorMode}
											onchange={(event) => setEditorMode(event.currentTarget.value as EditorMode)}
										>
											<option value="rich">Rich</option>
											<option value="source">Source</option>
											<option value="preview">Preview</option>
										</select>
									</label>
									<label>
										Preview mode
										<select
											value={$appearanceConfig.previewMode}
											onchange={(event) => setAppearanceConfig({ previewMode: event.currentTarget.value as 'document' | 'split' | 'source' })}
										>
											<option value="document">Document</option>
											<option value="split">Split</option>
											<option value="source">Source</option>
										</select>
									</label>
									<label class="switch">
										<input
											type="checkbox"
											checked={$appearanceConfig.showLineNumbers}
											onchange={(event) => setAppearanceConfig({ showLineNumbers: event.currentTarget.checked })}
										/>
										<span>Show line numbers</span>
									</label>
								</section>
							{:else if visibleSettingsSection === 'appearance'}
								<section class="settings-section" aria-labelledby="settings-appearance">
									<div>
										<h3 id="settings-appearance">Appearance</h3>
										<p>Theme and transparency settings are persisted and forwarded through the desktop bridge.</p>
									</div>
									<label>
										Native theme
										<select
											value={$shellPreferences.themeSource}
											onchange={(event) => {
												void setNativeTheme(event.currentTarget.value as OkThemeSource);
												setAppearanceConfig({ themeSource: event.currentTarget.value as OkThemeSource });
											}}
										>
											<option value="system">System</option>
											<option value="light">Light</option>
											<option value="dark">Dark</option>
										</select>
									</label>
									<label>
										Density
										<select
											value={$appearanceConfig.density}
											onchange={(event) => setAppearanceConfig({ density: event.currentTarget.value as 'comfortable' | 'compact' })}
										>
											<option value="comfortable">Comfortable</option>
											<option value="compact">Compact</option>
										</select>
									</label>
									<label class="switch">
										<input
											type="checkbox"
											checked={$shellPreferences.reducedTransparency}
											onchange={(event) => {
												setNativeTransparency(event.currentTarget.checked);
												setAppearanceConfig({ reducedTransparency: event.currentTarget.checked });
											}}
										/>
										<span>Reduce transparency</span>
									</label>
								</section>
							{:else if visibleSettingsSection === 'validation'}
								<ContentRulesSection />
							{:else if visibleSettingsSection === 'sync'}
								<section class="settings-section" aria-labelledby="settings-sync">
									<div>
										<h3 id="settings-sync">Sync</h3>
										<p>Collaboration settings persist locally and route through project config once the Tauri command is registered.</p>
									</div>
									<label>
										Sync mode
										<select
											value={$syncCollaborationConfig.mode}
											onchange={(event) => setSyncCollaborationConfig({ mode: event.currentTarget.value as 'off' | 'pull' | 'full' })}
										>
											<option value="off">Off</option>
											<option value="pull">Pull only</option>
											<option value="full">Full sync</option>
										</select>
									</label>
									<label>
										Server URL
										<input
											type="url"
											value={$syncCollaborationConfig.serverUrl}
											onchange={(event) => setSyncCollaborationConfig({ serverUrl: event.currentTarget.value })}
										/>
									</label>
									<label class="switch">
										<input
											type="checkbox"
											checked={$syncCollaborationConfig.autoSync}
											onchange={(event) => setSyncCollaborationConfig({ autoSync: event.currentTarget.checked })}
										/>
										<span>Auto sync</span>
									</label>
									<label class="switch">
										<input
											type="checkbox"
											checked={$syncCollaborationConfig.collaborationEnabled}
											onchange={(event) => setSyncCollaborationConfig({ collaborationEnabled: event.currentTarget.checked })}
										/>
										<span>Presence collaboration</span>
									</label>
									<label>
										Presence display name
										<input
											type="text"
											value={$syncCollaborationConfig.presenceName}
											onchange={(event) =>
												setSyncCollaborationConfig({ presenceName: event.currentTarget.value })}
										/>
									</label>
								</section>
							{:else if visibleSettingsSection === 'agents'}
								<AiToolsSection />
							{:else if visibleSettingsSection === 'templates'}
								<TemplatesSection />
							{:else if visibleSettingsSection === 'skills'}
								<SkillsSection />
							{:else if visibleSettingsSection === 'ignore-patterns'}
								<IgnorePatternsSection />
							{:else if visibleSettingsSection === 'runtime'}
								<section class="settings-section" aria-labelledby="settings-runtime">
									<div>
										<h3 id="settings-runtime">Runtime</h3>
										<p>{appInfoStatus}</p>
									</div>
									<dl>
										<div>
											<dt>Bridge</dt>
											<dd>{bridgeRuntime}</dd>
										</div>
										<div>
											<dt>Desktop</dt>
											<dd>{appInfo?.desktopRuntime ?? 'Unavailable'}</dd>
										</div>
										<div>
											<dt>Frontend</dt>
											<dd>{appInfo?.frontendRuntime ?? 'Unavailable'}</dd>
										</div>
										<div>
											<dt>Collaboration</dt>
											<dd>{bridgeConfig?.collabUrl || 'Not configured'}</dd>
										</div>
									</dl>
									<button type="button" onclick={resetAppConfig}>Reset local config</button>
									<div class="bridge-events">
										<div>
											<strong>Bridge events</strong>
											<small>{$desktopEvents.eventCount} recorded</small>
										</div>
										<dl>
											<div>
												<dt>Deep link</dt>
												<dd>{$desktopEvents.deepLink?.url ?? 'None received'}</dd>
											</div>
											<div>
												<dt>Update</dt>
												<dd>{$desktopEvents.updateStatus?.status ?? 'No update event'}</dd>
											</div>
											<div>
												<dt>Server</dt>
												<dd>{$desktopEvents.serverStatus?.status ?? 'No server event'}</dd>
											</div>
											<div>
												<dt>Crash invite</dt>
												<dd>{$desktopEvents.crashInvite?.reason ?? 'None received'}</dd>
											</div>
											<div>
												<dt>Consent</dt>
												<dd>{$desktopEvents.consentRequired?.scope ?? 'None required'}</dd>
											</div>
										</dl>
										{#if $desktopEventHistory.length > 0}
											<div class="event-history" aria-label="Recent bridge events">
												{#each $desktopEventHistory.slice(0, 5) as event (event.id)}
													<article>
														<strong>{event.kind}</strong>
														<span>{event.label}</span>
														<small>{new Date(event.recordedAt).toLocaleString()}</small>
													</article>
												{/each}
											</div>
										{/if}
									</div>
								</section>
							{/if}
						</div>
					</div>
				{:else if $shellState.activeDialog === 'create-project'}
					<div class="project-picker">
						<p>Create project</p>
						<label>
							Project name
							<input bind:value={projectNameInput} type="text" aria-label="Project name" />
						</label>
						<label>
							Template
							<select bind:value={selectedTemplateId} aria-label="Project template">
								{#each $projectTemplates as template (template.id)}
									<option value={template.id}>{template.title}</option>
								{/each}
							</select>
						</label>
						<strong>{$projectState.path || 'No folder selected'}</strong>
						<div class="dialog-actions">
							<button type="button" disabled={selectingProject} onclick={chooseProjectFolder}>
								{selectingProject ? 'Opening...' : 'Choose Folder'}
							</button>
							<button
								type="button"
								disabled={scaffoldingProject}
								onclick={() => void scaffoldCreateProject()}
							>
								{scaffoldingProject ? 'Creating...' : 'Create Project'}
							</button>
						</div>
						{#if projectPickerStatus}
							<small>{projectPickerStatus}</small>
						{/if}
						{#if $recentProjects.length > 0}
							<div class="recent-projects">
								<div>
									<strong>Recent projects</strong>
									<button type="button" onclick={clearRecentProjects}>Clear</button>
								</div>
								{#each $recentProjects as project (project.path)}
									<div class="recent-project">
										<button type="button" onclick={() => reopenProject(project.path)}>
											<span>{project.name}</span>
											<small>{project.path}</small>
										</button>
										<button
											type="button"
											aria-label={`Remove ${project.name} from recent projects`}
											onclick={() => removeRecentProject(project.path)}
										>
											×
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else if $shellState.activeDialog === 'clone-project'}
					<div class="dialog-card">
						<p class="dialog-kicker">Local-only release</p>
						<strong>Cloning a remote repository is not available in this release.</strong>
						<p>
							fractalknow currently runs in local-only mode. Git-backed clone, sync, and
							publish features are deferred to a future release.
						</p>
						<div class="dialog-actions">
							<button type="button" disabled>Choose Folder</button>
							<button type="button" disabled>Queue Clone</button>
						</div>
					</div>
				{:else if $shellState.activeDialog === 'publish'}
					<div class="dialog-card">
						<p class="dialog-kicker">Local-only release</p>
						<strong>Publishing is not available in this release.</strong>
						<p>
							fractalknow currently runs in local-only mode. Publish and Git-backed sync
							features are deferred to a future release.
						</p>
						<div class="dialog-actions">
							<button type="button" disabled>Prepare Publish</button>
						</div>
					</div>
				{:else if $shellState.activeDialog === 'consent'}
					<div class="dialog-card" id="consent-dialog-desc">
						<p class="dialog-kicker">Consent scope</p>
						<strong>{$desktopEvents.consentRequired?.scope ?? 'No pending consent'}</strong>
						<p>{$desktopEvents.consentRequired?.message ?? 'Consent requests from the desktop bridge will appear here.'}</p>
						{#if $desktopEvents.consentRequired?.requiredAt}
							<small>Requested {$desktopEvents.consentRequired.requiredAt}</small>
						{/if}
						<div class="dialog-actions">
							<button type="button" onclick={denyPendingConsent}>Deny</button>
							<button type="button" onclick={() => void allowPendingConsent()}>Grant</button>
						</div>
					</div>
				{:else if $shellState.activeDialog === 'bug-report'}
					<form
						class="dialog-form"
						aria-label="Bug report"
						onsubmit={(event) => {
							event.preventDefault();
							void submitBugReport();
						}}
					>
						<label>
							Summary
							<input bind:value={bugSummary} type="text" placeholder="What went wrong?" />
						</label>
						<label>
							Details
							<textarea bind:value={bugDetails} rows="5" placeholder="Steps, expected result, actual result"></textarea>
						</label>
						<label class="switch">
							<input bind:checked={bugAttachDiagnostics} type="checkbox" />
							<span>Attach recent bridge diagnostics</span>
						</label>
						{#if bugReportStatus}
							<p class="dialog-status">{bugReportStatus}</p>
						{/if}
						<div class="dialog-actions">
							<button type="submit" disabled={submittingBugReport}>
								{submittingBugReport ? 'Capturing...' : 'Capture Report'}
							</button>
						</div>
					</form>
				{:else if $shellState.activeDialog === 'feedback'}
					<form
						class="dialog-form"
						aria-label="Feedback"
						onsubmit={(event) => {
							event.preventDefault();
							void submitFeedback();
						}}
					>
						<label>
							Topic
							<select bind:value={feedbackTopic}>
								<option>Product feedback</option>
								<option>Documentation</option>
								<option>Migration issue</option>
							</select>
						</label>
						<label>
							Message
							<textarea bind:value={feedbackMessage} rows="5" placeholder="Share feedback"></textarea>
						</label>
						{#if feedbackStatus}
							<p class="dialog-status">{feedbackStatus}</p>
						{/if}
						<div class="dialog-actions">
							<button type="submit" disabled={submittingFeedback || feedbackMessage.trim().length === 0}>
								{submittingFeedback ? 'Sending...' : 'Send Feedback'}
							</button>
						</div>
					</form>
				{:else if $shellState.activeDialog === 'template-selection'}
					<div class="template-list">
						{#each availableTemplates as template (template.id)}
							<button type="button" onclick={() => selectTemplate(template)} data-testid={`template-item-${template.id}`}>
								<strong>{template.title}</strong>
								<span>{template.description}</span>
							</button>
						{/each}
					</div>
				{:else if $shellState.activeDialog === 'trash-failure'}
					<div class="dialog-card" id="trash-failure-desc">
						<strong>Delete did not complete</strong>
						{#if $trashFailures.length === 0}
							<p>No failed paths were recorded for this operation.</p>
						{:else}
							<ul class="failure-list">
								{#each $trashFailures as failure (failure.path + failure.message)}
									<li>
										<strong>{failure.path}</strong>
										<span>{failure.message}</span>
										{#if failure.code}<small>{failure.code}</small>{/if}
									</li>
								{/each}
							</ul>
						{/if}
						<div class="dialog-actions">
							<button
								type="button"
								onclick={() => {
									clearTrashFailures();
									closeDialog();
								}}
							>Close</button>
						</div>
					</div>
				{:else if $shellState.activeDialog === 'unsaved-changes'}
					<div class="dialog-card" id="unsaved-changes-desc">
						<strong>Unsaved changes</strong>
						{#if dirtyDocuments.length === 0}
							<p>No dirty documents are open.</p>
						{:else}
							<ul class="failure-list">
								{#each dirtyDocuments as document (document.path)}
									<li>
										<strong>{document.title}</strong>
										<span>{document.path}</span>
									</li>
								{/each}
							</ul>
						{/if}
						<div class="dialog-actions">
							<button type="button" onclick={closeDialog}>Keep Editing</button>
							<button
								type="button"
								onclick={() => {
									for (const document of dirtyDocuments) {
										// Activate each dirty doc path and discard.
										void document;
									}
									// Discard only the active document content store-wide by forcing clean last-saved reloads.
									for (const document of dirtyDocuments) {
										if ($shellState.activeTarget.path === document.path) discardActiveChanges();
									}
									// Fallback: mark all dirty documents clean by reloading from lastSavedContent.
									import('$lib/shell/documents').then(({ documentWorkspace }) => {
										documentWorkspace.update((state) => ({
											...state,
											documents: state.documents.map((item) =>
												item.dirty
													? {
															...item,
															content: item.lastSavedContent ?? item.content,
															dirty: false,
															syncState: 'saved',
														}
													: item,
											),
											notice: 'Discarded all unsaved changes',
										}));
									});
									closeDialog();
								}}
							>Discard all</button>
							<button
								type="button"
								onclick={() => {
									for (const _document of dirtyDocuments) {
										saveActiveDocumentContent();
									}
									// Save each dirty document content to disk.
									import('$lib/shell/documents').then(async ({ documentWorkspace, saveActiveDocumentContent: save }) => {
										const { get } = await import('svelte/store');
										const state = get(documentWorkspace);
										for (const document of state.documents.filter((item) => item.dirty)) {
											documentWorkspace.update((current) => ({
												...current,
												activePath: document.path,
											}));
											save();
										}
									});
									closeDialog();
								}}
							>Save all</button>
						</div>
					</div>
				{:else if $shellState.activeDialog === 'update-status'}
					<div class="dialog-card" id="update-status-desc">
						<p class="dialog-kicker">Update status</p>
						<strong>{$desktopEvents.updateStatus?.status ?? 'idle'}</strong>
						<p>{$desktopEvents.updateStatus?.message ?? 'Updater events from Tauri will appear here.'}</p>
						<dl class="dialog-meta">
							<div>
								<dt>Available version</dt>
								<dd>{$desktopEvents.updateStatus?.version ?? 'None'}</dd>
							</div>
							<div>
								<dt>Current version</dt>
								<dd>{appInfo?.appVersion ?? 'Unknown'}</dd>
							</div>
							<div>
								<dt>Checked</dt>
								<dd>{$desktopEvents.updateStatus?.checkedAt ?? 'Never'}</dd>
							</div>
						</dl>
						<div class="dialog-actions">
							<button type="button" onclick={closeDialog}>Later</button>
							{#if $desktopEvents.updateStatus?.status === 'available' || $desktopEvents.updateStatus?.status === 'ready'}
								<button
									type="button"
									onclick={() => {
										if ($desktopBridge.status === 'ready') {
											void $desktopBridge.bridge.updater.installUpdate();
										}
										closeDialog();
									}}
								>Install update</button>
							{:else}
								<button
									type="button"
									onclick={() => {
										if ($desktopBridge.status === 'ready') {
											void $desktopBridge.bridge.updater.checkStatus();
										}
									}}
								>Check again</button>
							{/if}
						</div>
					</div>
				{:else if $shellState.activeDialog === 'crash-recovery'}
					<div class="dialog-card" id="crash-recovery-desc">
						<p class="dialog-kicker">Crash recovery</p>
						<strong>{$desktopEvents.crashInvite?.reason ?? 'No crash recovery invite'}</strong>
						<p>Report location: {$desktopEvents.crashInvite?.reportPath ?? 'Unavailable'}</p>
						{#if $desktopEvents.crashInvite?.createdAt}
							<small>Captured {$desktopEvents.crashInvite.createdAt}</small>
						{/if}
						<div class="dialog-actions">
							<button type="button" onclick={closeDialog}>Dismiss</button>
							<button type="button" onclick={() => setSettingsSection('runtime')}>Open Diagnostics</button>
							{#if $desktopEvents.crashInvite?.reportPath && $desktopBridge.status === 'ready'}
								<button
									type="button"
									onclick={() => {
										const reportPath = $desktopEvents.crashInvite?.reportPath;
										if (!reportPath) return;
										// Open parent folder when possible; fall back to opening the report path.
										const folder = reportPath.replace(/[/\\][^/\\]+$/, '') || reportPath;
										void $desktopBridge.bridge.shell.openExternal(`file://${folder}`);
									}}
								>Open report folder</button>
							{/if}
						</div>
					</div>
				{:else if $shellState.activeDialog === 'folder-picker'}
					<div class="dialog-card" id="folder-picker-desc">
						<p class="dialog-kicker">Folder picker</p>
						<strong>Choose a project folder</strong>
						<p>Uses the native folder dialog on Tauri, or returns null in browser preview.</p>
						<label>
							Default path
							<input bind:value={folderPickerDefault} type="text" aria-label="Default folder path" />
						</label>
						<div class="dialog-actions">
							<button type="button" onclick={closeDialog}>Cancel</button>
							<button
								type="button"
								disabled={selectingProject}
								onclick={() => {
									void (async () => {
										if ($desktopBridge.status !== 'ready') return;
										selectingProject = true;
										try {
											const path = await $desktopBridge.bridge.dialog.openFolder({
												defaultPath: folderPickerDefault || undefined,
											});
											if (path) {
												setProjectFromFolder(path);
												projectPickerStatus = `Selected ${path}`;
											}
										} finally {
											selectingProject = false;
											closeDialog();
										}
									})();
								}}
							>{selectingProject ? 'Opening…' : 'Browse…'}</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.overlay
		position: fixed
		inset: 0
		z-index: t.$z-dialog
		background: var(--ok-overlay-scrim)
		display: grid
		place-items: center
		animation: dialog-overlay-enter t.$duration-base t.$ease-out

	.dialog
		width: min(680px, calc(100vw - 32px))
		max-height: calc(100vh - 48px)
		@include m.overlay-surface(lg)
		overflow: hidden
		display: grid
		grid-template-rows: auto minmax(0, 1fr)
		animation: dialog-pop-enter t.$duration-base t.$ease-spring

		header
			padding: t.$space-4
			@include m.divider(horizontal)
			display: flex
			align-items: center
			justify-content: space-between

			h2
				margin: 0
				color: var(--ok-ink)
				font-size: t.$font-size-xl

			button
				width: 30px
				height: 30px
				border: 0
				border-radius: t.$radius-md
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer
				@include m.press-feedback
				@include m.hover-transition(background-color)

				&:hover
					background: var(--ok-panel-2)

				&:focus-visible
					@include m.focus-ring

		&__body
			max-height: calc(100vh - 122px)
			padding: t.$space-5
			color: var(--ok-muted)
			display: grid
			gap: t.$space-3
			overflow: auto
			@include m.scrollbar

			label
				display: grid
				gap: t.$space-1
				color: var(--ok-ink)
				font-weight: 700

			input:not([type='checkbox']),
			select,
			textarea
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-md
				padding: t.$space-2
				background: var(--ok-panel)
				color: var(--ok-ink)
				font: inherit
				@include m.hover-transition(border-color)

				&:focus-visible
					@include m.focus-ring
					border-color: var(--ok-accent)

			textarea
				resize: vertical

			p
				margin: t.$space-3 0 0

	.dialog-kicker
		margin: 0 0 t.$space-1
		color: var(--ok-muted)
		font-size: t.$font-size-xs
		font-weight: 800
		text-transform: uppercase

	.failure-list
		margin: t.$space-3 0 0
		padding: 0
		list-style: none
		display: grid
		gap: t.$space-2

		li
			@include m.panel
			padding: t.$space-2 t.$space-3
			background: var(--ok-surface)
			display: grid
			gap: 2px

		span, small
			color: var(--ok-muted)
			font-size: t.$font-size-xs

	.dialog-meta
		margin: t.$space-3 0 0
		display: grid
		grid-template-columns: repeat(2, minmax(0, 1fr))
		gap: t.$space-2

		dt
			color: var(--ok-muted)
			font-size: t.$font-size-xs
			font-weight: 700
			text-transform: uppercase

		dd
			margin: 2px 0 0

	.settings-shell
		min-height: 460px
		display: grid
		grid-template-columns: 180px minmax(0, 1fr)
		gap: t.$space-3

	.settings-nav
		border-right: 1px solid var(--ok-line)
		padding-right: t.$space-3
		display: flex
		flex-direction: column
		gap: t.$space-1

		label
			margin-bottom: t.$space-1

			span
				color: var(--ok-muted)
				font-size: t.$font-size-xs
				font-weight: 800
				text-transform: uppercase

		button
			border: 1px solid transparent
			border-radius: t.$radius-md
			padding: t.$space-2
			background: transparent
			color: var(--ok-muted)
			text-align: left
			cursor: pointer
			@include m.hover-transition(all)

			&:hover
				background: var(--ok-surface)
				color: var(--ok-ink)

			&.active
				border-color: var(--ok-accent)
				background: var(--ok-surface)
				color: var(--ok-ink)

			&:focus-visible
				@include m.focus-ring

		p
			margin: t.$space-1 0
			font-size: t.$font-size-base

	.settings-content
		min-width: 0
		display: grid

	.settings-section
		@include m.panel
		padding: t.$space-4
		background: var(--ok-surface)
		display: grid
		gap: t.$space-3

		h3
			margin: 0
			color: var(--ok-ink)
			font-size: t.$font-size-lg

		p
			margin: t.$space-1 0 0
			font-size: t.$font-size-base

		dl
			margin: 0
			display: grid
			gap: t.$space-2

			div
				display: grid
				grid-template-columns: 120px minmax(0, 1fr)
				gap: t.$space-3

		dt
			color: var(--ok-muted)
			font-size: t.$font-size-sm
			font-weight: 700
			text-transform: uppercase

		dd
			margin: 0
			color: var(--ok-ink)
			overflow-wrap: anywhere

		button
			width: fit-content
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-panel)
			color: var(--ok-ink)
			cursor: pointer
			@include m.press-feedback

			&:disabled
				cursor: wait
				opacity: 0.7

			&:focus-visible
				@include m.focus-ring

	.dialog-form,
	.dialog-card,
	.template-list
		display: grid
		gap: t.$space-3

	.dialog-card,
	.template-list button
		@include m.panel
		padding: t.$space-4
		background: var(--ok-surface)

	.dialog-card
		strong,
		small
			color: var(--ok-ink)

		p
			margin: 0

	.settings-errors
		border: 1px solid var(--ok-danger)
		border-radius: t.$radius-md
		padding: t.$space-3
		background: var(--ok-surface)
		color: var(--ok-danger)
		display: grid
		gap: t.$space-1

		strong
			color: var(--ok-danger)

		p
			margin: 0
			font-size: t.$font-size-sm

		button
			justify-self: start

	.dialog-status
		border: 1px solid var(--ok-danger)
		border-radius: t.$radius-md
		padding: t.$space-3
		background: var(--ok-surface)
		color: var(--ok-danger)
		margin: 0

	.dialog-actions
		display: flex
		flex-wrap: wrap
		gap: t.$space-2

		button
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-panel)
			color: var(--ok-ink)
			cursor: pointer
			@include m.press-feedback
			@include m.hover-transition(background-color)

			&:hover
				background: var(--ok-surface)

			&:focus-visible
				@include m.focus-ring

	.template-list
		button
			color: var(--ok-ink)
			text-align: left
			cursor: pointer
			@include m.hover-transition(background-color)

			&:hover
				background: var(--ok-panel)

			strong,
			span
				display: block

			span
				margin-top: t.$space-1
				color: var(--ok-muted)
				font-size: t.$font-size-base

	.bridge-events
		@include m.panel
		padding: t.$space-3
		background: var(--ok-panel)
		display: grid
		gap: t.$space-3

		> div:first-child
			display: flex
			align-items: center
			justify-content: space-between
			gap: t.$space-3

			strong
				color: var(--ok-ink)

			small
				font-size: t.$font-size-sm

		> dl
			display: grid
			grid-template-columns: repeat(2, minmax(0, 1fr))
			gap: t.$space-3

			div
				display: block

			dd
				margin-top: 3px

	.event-history
		display: grid
		gap: t.$space-1

		article
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2
			background: var(--ok-surface)

			strong,
			span,
			small
				display: block
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			strong
				color: var(--ok-ink)
				font-size: t.$font-size-sm

			span
				margin-top: 3px

			small
				margin-top: 3px
				font-size: t.$font-size-xs

	.switch
		display: flex
		align-items: center
		gap: t.$space-3

		input
			width: 16px
			height: 16px

	.project-picker
		display: grid
		gap: t.$space-2

		p,
		strong,
		span,
		small
			margin: 0

		strong
			color: var(--ok-ink)

		span,
		small
			overflow-wrap: anywhere
			font-size: t.$font-size-base

		button
			width: fit-content
			border: 1px solid var(--ok-line)
			border-radius: t.$radius-md
			padding: t.$space-2 t.$space-3
			background: var(--ok-surface)
			color: var(--ok-ink)
			cursor: pointer
			@include m.press-feedback

			&:disabled
				cursor: wait
				opacity: 0.7

			&:focus-visible
				@include m.focus-ring

	.recent-projects
		margin-top: t.$space-1
		display: grid
		gap: t.$space-2

		> div:first-child
			display: flex
			align-items: center
			justify-content: space-between
			gap: t.$space-3

			strong
				color: var(--ok-ink)

			button
				border: 0
				padding: 0
				background: transparent
				color: var(--ok-accent)
				cursor: pointer
				font-size: t.$font-size-sm
				@include m.hover-transition(color)

				&:focus-visible
					@include m.focus-ring

				&:hover
					color: var(--ok-ink)

	.recent-project
		@include m.panel
		background: var(--ok-panel)
		display: grid
		grid-template-columns: minmax(0, 1fr) auto
		overflow: hidden

		button
			border: 0
			border-radius: 0
			background: transparent
			color: var(--ok-ink)
			text-align: left
			@include m.hover-transition(background-color)

			&:hover
				background: var(--ok-surface)

			&:focus-visible
				@include m.focus-ring

			&:last-child
				width: 34px
				color: var(--ok-muted)
				text-align: center

				&:hover
					color: var(--ok-danger)

		span,
		small
			display: block
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

		small
			margin-top: 2px
			color: var(--ok-muted)

	@keyframes dialog-overlay-enter
		from
			opacity: 0
		to
			opacity: 1

	@keyframes dialog-pop-enter
		from
			opacity: 0
			transform: scale(0.96)
		to
			opacity: 1
			transform: scale(1)

	@media (prefers-reduced-motion: reduce)
		.overlay
			animation: none

		.dialog
			animation: none
</style>
