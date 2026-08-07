<script lang="ts">
	import { settingsState as ideState } from "../state/settings.svelte";
	import { vault } from '$lib/modules/browser/state/vault.svelte';
	import Models from '$lib/components/ModelMarketplace.svelte'
	import Skills from '$lib/components/SkillsMarketplace.svelte'
	import { trapFocus } from '$lib/actions/focusTrap';
	import { browserSessionRestoreEnabled, browserSetSessionRestore, listAuthorizedPaths, requestDirectoryAccess, revokeAuthorizedPath, selectOpenFile, mediaGetLibrary } from '$lib/ipc';
	import { media } from '$lib/modules/media/state/media.svelte';
	import { modelRegistry, settingsBridge } from '$lib/state/modelRegistry.svelte';
	import { providerDefinition } from '$lib/data/aiProviders';
	import type { SettingsDraft, ModelRecord, ApiFormat } from '$lib/state/modelRegistry.contract';
	import { dictation } from '$lib/state/dictation.svelte';

	type SettingsTab = "general" | "dictation" | "aimodels" | "models" | "skills" | "browser" | "files" | "media";
	const settingsTabs: ReadonlyArray<{ id: SettingsTab; label: string }> = [
		{ id: 'general', label: 'General Editor' },
		{ id: 'dictation', label: 'Dictation' },
		{ id: 'aimodels', label: 'AI Models' },
		{ id: 'models', label: 'Model Downloads' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'files', label: 'File Access' },
		{ id: 'media', label: 'Media Library' },
		{ id: 'browser', label: 'In-App Browser' }
	];
	let activeTab = $state<SettingsTab>("general");

	function handleTabKeydown(event: KeyboardEvent) {
		const currentIndex = settingsTabs.findIndex(tab => tab.id === activeTab);
		let nextIndex = currentIndex;
		if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % settingsTabs.length;
		else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + settingsTabs.length) % settingsTabs.length;
		else if (event.key === 'Home') nextIndex = 0;
		else if (event.key === 'End') nextIndex = settingsTabs.length - 1;
		else return;
		event.preventDefault();
		activeTab = settingsTabs[nextIndex].id;
		requestAnimationFrame(() => document.getElementById(`settings-tab-${activeTab}`)?.focus());
	}

	// Local non-AI temporary form states (draft-committed by Save Changes)
	let localFontSize = $state(13);
	let localFontFamily = $state("");
	let localLineWrapping = $state(true);
	let localBrowserUrl = $state("");
	let localSessionRestore = $state(false);
	let authorizedPaths = $state<string[]>([]);
	let fileAccessStatus = $state('');
	let mediaLibraryPath = $state('');

	let isSaving = $state(false);
	let saveError = $state('');

	// Outcome banner for the immediate AI-model actions (add/select/remove/clear)
	let aiStatus = $state<{ kind: 'success' | 'error'; text: string } | null>(null);

	// Add Model modal
	type AddModelMode = 'api' | 'local';
	let showAddModelModal = $state(false);
	let addModelMode = $state<AddModelMode>('api');
	let addModelError = $state('');
	let addModelBusy = $state(false);

	// "Via API" form fields
	let apiFormat = $state<ApiFormat>("openai");
	let apiProviderName = $state("");
	let apiRequestUrl = $state("");
	let apiModelName = $state("");
	let apiKey = $state("");
	let apiIsMultimodal = $state(false);
	let apiIsFullUrl = $state(false);

	// "Upload local" form fields
	let localName = $state('');
	let localGgufFile = $state('');
	let localMmprojFile = $state('');

	function isHttpUrl(value: string): boolean {
		try {
			const url = new URL(value);
			return url.protocol === 'http:' || url.protocol === 'https:';
		} catch {
			return false;
		}
	}

	// All saved, user-manageable models — API (custom + per-provider) and local
	let savedModels = $derived(
		modelRegistry.records().filter(record =>
			record.source === 'custom' || record.source === 'user' || record.source === 'local')
	);
	let envRecords = $derived(modelRegistry.records().filter(record => record.providerId === 'env'));
	let hasActiveModel = $derived(modelRegistry.active() !== null);
	let hasLegacyPaths = $derived(
		!!ideState.localGgufModelPath || !!ideState.localMmprojPath || !!ideState.localMlxModelPath
	);

	function isActiveRecord(record: ModelRecord): boolean {
		return record.providerId === ideState.aiProvider && record.id === ideState.activeModelValue;
	}

	function recordDetail(record: ModelRecord): string {
		if (record.source === 'custom') {
			return `API · ${record.modelId} · ${(record.apiFormat ?? 'openai').toUpperCase()} · ${record.baseUrl ?? 'default endpoint'}`;
		}
		if (record.source === 'user') {
			return `API · ${providerDefinition(record.providerId).label}`;
		}
		const local = ideState.localModels.find(model => model.id === record.id);
		return local ? `Local · ${local.path}` : 'Local · downloaded model';
	}

	function selectRecord(record: ModelRecord) {
		aiStatus = null;
		if (!record.runnable) {
			aiStatus = { kind: 'error', text: record.unavailableReason ?? `${record.label} is not usable yet.` };
			return;
		}
		modelRegistry.setActive(record.providerId, record.id);
		aiStatus = { kind: 'success', text: `Now using ${record.label}.` };
	}

	function canRemove(record: ModelRecord): boolean {
		if (record.source === 'custom' || record.source === 'user') return true;
		return ideState.localModels.some(model => model.id === record.id);
	}

	async function removeRecord(record: ModelRecord) {
		aiStatus = null;
		try {
			if (record.source === 'custom') {
				await removeApiModel(record.id);
			} else if (record.source === 'user') {
				modelRegistry.removeUserModel(record.providerId, record.id);
			} else {
				ideState.removeLocalModel(record.id);
			}
			aiStatus = { kind: 'success', text: `Removed ${record.label}.` };
		} catch (error) {
			aiStatus = { kind: 'error', text: error instanceof Error ? error.message : String(error) };
		}
	}

	// Removing a BYOK model also deletes its keychain credential (empty key = delete),
	// in the same transaction that drops the model record.
	async function removeApiModel(id: string) {
		const capture = settingsBridge.captureSettingsDraft();
		const model = capture.customModels.find(item => item.id === id);
		if (!model) return;
		const wasActive = capture.activeModel?.providerId === 'custom' && capture.activeModel.id === id;
		const nextDraft: SettingsDraft = {
			...capture,
			customModels: capture.customModels.filter(item => item.id !== id),
			activeModel: wasActive ? null : capture.activeModel,
			pendingCredentials: { [model.credentialId]: '' },
		};
		await settingsBridge.commitSettingsDraft(nextDraft);
	}

	// Sync draft when settings modal opens
	$effect(() => {
		if (ideState.showSettings) {
			localFontSize = ideState.editorFontSize;
			localFontFamily = ideState.editorFontFamily;
			localLineWrapping = ideState.editorLineWrapping;
			localBrowserUrl = ideState.browserUrl;
			void browserSessionRestoreEnabled().then(enabled => {
				if (ideState.showSettings) localSessionRestore = enabled;
			}).catch(error => {
				saveError = error instanceof Error ? error.message : String(error);
			});
			saveError = '';
			aiStatus = null;
			void refreshAuthorizedPaths();
			void mediaGetLibrary().then(library => mediaLibraryPath = library?.basePath ?? 'Not set up');
		}
	});

	async function refreshAuthorizedPaths() {
		try {
			authorizedPaths = await listAuthorizedPaths();
			fileAccessStatus = '';
		} catch (error) {
			fileAccessStatus = error instanceof Error ? error.message : String(error);
		}
	}

	async function grantFolderAccess() {
		try {
			const path = await requestDirectoryAccess();
			if (!path) return;
			await refreshAuthorizedPaths();
			fileAccessStatus = `Granted access to ${path}.`;
		} catch (error) {
			fileAccessStatus = error instanceof Error ? error.message : String(error);
		}
	}

	async function revokeFolderAccess(path: string) {
		try {
			await revokeAuthorizedPath(path);
			await refreshAuthorizedPaths();
			fileAccessStatus = `Removed access to ${path}.`;
		} catch (error) {
			fileAccessStatus = error instanceof Error ? error.message : String(error);
		}
	}

	async function handleSave() {
		if (isSaving) return;
		isSaving = true;
		saveError = '';
		try {
			if (localBrowserUrl && !isHttpUrl(localBrowserUrl)) {
				throw new Error('The browser homepage must be a valid HTTP or HTTPS URL.');
			}
			await browserSetSessionRestore(localSessionRestore);
			ideState.editorFontSize = localFontSize;
			ideState.editorFontFamily = localFontFamily;
			ideState.editorLineWrapping = localLineWrapping;
			ideState.browserUrl = localBrowserUrl;
			ideState.saveSettings();
			ideState.showSettings = false;
		} catch (error) {
			saveError = error instanceof Error ? error.message : String(error);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		if (isSaving) return;
		ideState.showSettings = false;
	}

	async function resetPasswordVault() {
		if (!confirm('Are you sure you want to reset the password database cache? This will clear all password manager saved keys.')) return;
		if (!await vault.clear()) {
			saveError = 'The password vault could not be reset. Check the application log and try again.';
		}
	}

	async function resetAiConfiguration() {
		if (!confirm('Reset all saved AI models, provider URLs, selected model, and provider credentials? Downloaded model files will remain on disk.')) return;
		aiStatus = null;
		try {
			await ideState.resetAiConfiguration();
			aiStatus = { kind: 'success', text: 'AI configuration was reset. Downloaded model files remain on disk.' };
		} catch (error) {
			aiStatus = { kind: 'error', text: error instanceof Error ? error.message : String(error) };
		}
	}

	function clearLegacyPath(target: 'gguf' | 'mmproj' | 'mlx') {
		aiStatus = null;
		ideState.pushUndo();
		if (target === 'gguf') {
			ideState.localGgufModelPath = '';
			if (ideState.selectedModelId === 'custom-local-gguf') ideState.selectedModelId = '';
		} else if (target === 'mmproj') {
			ideState.localMmprojPath = '';
		} else {
			ideState.localMlxModelPath = '';
			if (ideState.selectedModelId === 'custom-local-mlx') ideState.selectedModelId = '';
		}
		ideState.saveSettings(false);
		aiStatus = { kind: 'success', text: 'Cleared the legacy model path.' };
	}

	// --- Add Model flow ---

	function openAddModel() {
		addModelMode = 'api';
		addModelError = '';
		apiFormat = 'openai';
		apiProviderName = '';
		apiRequestUrl = '';
		apiModelName = '';
		apiKey = '';
		apiIsMultimodal = false;
		apiIsFullUrl = false;
		localName = '';
		localGgufFile = '';
		localMmprojFile = '';
		aiStatus = null;
		showAddModelModal = true;
	}

	async function browseModalGguf(target: 'model' | 'mmproj') {
		addModelError = '';
		try {
			const path = await selectOpenFile(target === 'model' ? 'Select GGUF Model' : 'Select mmproj File', 'gguf');
			if (!path) return;
			if (!path.toLowerCase().endsWith('.gguf')) {
				addModelError = 'Select a file with the .gguf extension.';
				return;
			}
			if (target === 'model') localGgufFile = path;
			else localMmprojFile = path;
		} catch (error) {
			addModelError = error instanceof Error ? error.message : String(error);
		}
	}

	async function executeAddApiModel() {
		addModelError = '';
		if (!apiProviderName.trim() || !apiModelName.trim() || !apiKey || !apiRequestUrl.trim()) {
			addModelError = "Fill in the provider name, API link, model name, and API key.";
			return;
		}
		if (!isHttpUrl(apiRequestUrl)) {
			addModelError = 'Enter a valid HTTP or HTTPS API link.';
			return;
		}

		const capture = settingsBridge.captureSettingsDraft();
		const id = crypto.randomUUID();
		const credentialId = `custom-model-${id}`;
		const nextDraft: SettingsDraft = {
			...capture,
			aiProvider: 'custom',
			activeModel: { providerId: 'custom', id },
			customModels: [
				...capture.customModels,
				{
					id,
					credentialId,
					name: apiProviderName.trim(),
					provider: apiProviderName.trim(),
					modelId: apiModelName.trim(),
					baseUrl: apiRequestUrl.trim(),
					apiFormat,
					isMultimodal: apiIsMultimodal,
					isFullUrl: apiIsFullUrl,
				}
			],
			pendingCredentials: { [credentialId]: apiKey }
		};

		addModelBusy = true;
		try {
			// A BYOK model must be usable as soon as it is added. Persist the configuration
			// and its keychain credential together instead of waiting for the outer dialog.
			await settingsBridge.commitSettingsDraft(nextDraft);
			ideState.addLog(`Added and selected API model: ${apiModelName.trim()}`, 'success');
			aiStatus = { kind: 'success', text: `Added and selected ${apiModelName.trim()}. The API key is saved in your OS keychain.` };
			showAddModelModal = false;
		} catch (error) {
			addModelError = error instanceof Error ? error.message : String(error);
		} finally {
			addModelBusy = false;
		}
	}

	function executeAddLocalModel() {
		addModelError = '';
		if (!localName.trim()) {
			addModelError = 'Give the model a name.';
			return;
		}
		if (!localGgufFile) {
			addModelError = 'Choose a .gguf model file.';
			return;
		}
		try {
			const model = ideState.addLocalModel(localName, localGgufFile, localMmprojFile, true);
			aiStatus = { kind: 'success', text: `Added and selected local model “${model.name}”. It loads from ${model.path} when you send a message.` };
			showAddModelModal = false;
		} catch (error) {
			addModelError = error instanceof Error ? error.message : String(error);
		}
	}

	function submitAddModel() {
		if (addModelBusy) return;
		if (addModelMode === 'api') void executeAddApiModel();
		else executeAddLocalModel();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (!isSaving && e.target === e.currentTarget) {
			ideState.showSettings = false;
		}
	}

	function handleDialogKeydown(e: KeyboardEvent) {
		if (!isSaving && e.key === 'Escape') {
			e.preventDefault();
			ideState.showSettings = false;
		}
	}
</script>

{#if ideState.showSettings}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="settings-overlay" onclick={handleBackdropClick}>
		<div
			class="settings-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-title"
			aria-hidden={showAddModelModal ? 'true' : undefined}
			inert={showAddModelModal}
			tabindex="-1"
			use:trapFocus
			onkeydown={handleDialogKeydown}
		>
				<!-- Settings Sidebar navigation -->
				<div class="settings-sidebar" role="tablist" aria-label="Settings sections">
					<div class="settings-header"></div>
					{#each settingsTabs as tab (tab.id)}
						<button
							id={`settings-tab-${tab.id}`}
							class="settings-tab-btn {activeTab === tab.id ? 'is-active' : ''}"
							onclick={() => (activeTab = tab.id)}
							onkeydown={handleTabKeydown}
							role="tab"
							aria-selected={activeTab === tab.id}
							aria-controls="settings-panel"
							tabindex={activeTab === tab.id ? 0 : -1}
						>
							{tab.label}
						</button>
					{/each}
				</div>
				<!-- Settings content area -->
				<div class="settings-content" id="settings-panel" role="tabpanel" aria-labelledby={`settings-tab-${activeTab}`}>
					<header class="settings-header row ycenter xright">
						<h2 id="settings-title" class="sr-only">Settings</h2>
						<button
							class="btn-icon"
							aria-label="Close Settings"
							onclick={handleCancel}
							disabled={isSaving}
							title="Close Settings"
						>
							<img
								src="/iconset/close.svg"
								alt="Close"
								class="icon-svg-sm"
							/>
						</button>
					</header>
					<div class="settings-content-body">
					{#if activeTab === "general"}
						<div class="box gap16">
							<h3 class="settings-section-title">Editor preferences</h3>
			<div class="settings-row">
								<label
									for="editor-font-family"
									class="settings-label">Font Family</label
								>
								<input
									id="editor-font-family"
									type="text"
									class="settings-input"
									bind:value={localFontFamily}
									placeholder="e.g. 'JetBrains Mono', monospace"
								/>
							</div>

							<div class="settings-row">
								<label
									for="editor-font-size"
									class="settings-label">Font Size (px)</label
								>
								<input
									id="editor-font-size"
									type="number"
									class="settings-input"
									bind:value={localFontSize}
									min="10"
									max="24"
								/>
							</div>

							<div class="settings-row row ycenter gap8 padtop8">
								<input
									id="editor-line-wrap"
									type="checkbox"
									bind:checked={localLineWrapping}
								/>
								<label
									for="editor-line-wrap"
									class="settings-label font-bold cursor-pointer"
									>Enable Line Wrapping</label
								>
							</div>
						</div>
					{:else if activeTab === "dictation"}
						<div class="box gap16">
							<h3 class="settings-section-title">Apple Dictation</h3>
							<p class="settings-guidance">Dictation uses Apple’s on-device speech recognition. Hold Fn/Globe where macOS delivers that key to FractalEngine, or use the command palette, microphone controls, or the Cmd+Shift+D fallback.</p>
							<div class="settings-row">
								<label class="settings-label" for="dictation-language">Language</label>
								<select id="dictation-language" class="settings-select" value={dictation.locale} onchange={event => dictation.setLocale((event.target as HTMLSelectElement).value)} disabled={dictation.isActive}>
									<option value="en-US">English (United States)</option>
									<option value="en-IN">English (India)</option>
									<option value="hi-IN">Hindi (India) — available when installed on-device</option>
								</select>
							</div>
							<div class="settings-row">
								<span class="settings-label">Status</span>
								<p class="settings-guidance" role="status">{dictation.message || 'Ready. Recognition remains on this Mac; no network fallback is used.'}</p>
							</div>
							<button class="btn-secondary" onclick={() => void dictation.toggle()}>{dictation.isActive ? 'Stop Dictation' : 'Start Dictation'}</button>
						</div>
					{:else if activeTab === "aimodels"}
						<div class="box gap16">
							<h3 class="settings-section-title">AI Models</h3>
							<p class="settings-guidance" role="status">Add a model by uploading a local GGUF file or by connecting an API with your own key. Every saved model stays in this list and is always available in the model picker. Changes here apply immediately.</p>
							{#if aiStatus}
								{#if aiStatus.kind === 'error'}
									<p class="settings-save-error" role="alert">{aiStatus.text}</p>
								{:else}
									<p class="settings-status-success" role="status">{aiStatus.text}</p>
								{/if}
							{/if}

							<div class="border-top padtop12 box gap8">
								<div class="row xbetween ycenter">
									<span class="settings-label font-bold">Your models</span>
									<button class="btn-secondary" onclick={openAddModel}>Add Model…</button>
								</div>
								{#each savedModels as record (record.providerId + ':' + record.id)}
									<div class="settings-model-row row xbetween ycenter border rounded pad8 text-xs">
										<label class="row ycenter gap8">
											<input
												type="radio"
												name="active-model"
												value={`${record.providerId}:${record.id}`}
												checked={isActiveRecord(record)}
												disabled={!record.runnable}
												onchange={() => selectRecord(record)}
											/>
											<span class="box gap2">
												<span class="font-bold col1">{record.label}</span>
												<span class="text-3xs col3">{record.runnable ? recordDetail(record) : (record.unavailableReason ?? recordDetail(record))}</span>
											</span>
										</label>
										{#if canRemove(record)}
											<button class="btn-secondary" onclick={() => removeRecord(record)} aria-label={`Remove ${record.label}`}>Remove</button>
										{/if}
									</div>
								{:else}
									<span class="text-2xs col3">No models added yet. Click “Add Model…” to connect an API model or upload a local GGUF file.</span>
								{/each}
								{#if !hasActiveModel && savedModels.length > 0}
									<p class="settings-guidance" role="status">No model is selected. Pick one above to use it in the AI chat.</p>
								{/if}
							</div>

							{#if envRecords.length > 0}
								<div class="border-top padtop12 box gap8">
									<span class="settings-label font-bold">Detected from this project’s .env</span>
									{#each envRecords as record (record.id)}
										<label class="row ycenter gap8 text-xs border rounded pad8">
											<input
												type="radio"
												name="active-model"
												value={`env:${record.id}`}
												checked={isActiveRecord(record)}
												disabled={!record.runnable}
												onchange={() => selectRecord(record)}
											/>
											<span class="box gap2">
												<span class="font-bold col1">{record.label}</span>
												<span class="text-3xs col3">{record.runnable ? (record.modelId || 'Model from project environment') : (record.unavailableReason ?? '')}</span>
											</span>
										</label>
									{/each}
								</div>
							{/if}

							{#if hasLegacyPaths}
								<div class="border-top padtop12 box gap8">
									<span class="settings-label font-bold">Legacy local paths</span>
									<span class="text-2xs col3">These paths predate named local models. Add the same file through “Add Model… → Upload local file” to give it a name, then clear the legacy entry.</span>
									{#if ideState.localGgufModelPath}
										<div class="row xbetween ycenter border rounded pad8 text-xs">
											<div class="box gap2"><span class="font-bold">Custom GGUF</span><span class="text-3xs col3">{ideState.localGgufModelPath}</span></div>
											<button class="btn-secondary" onclick={() => clearLegacyPath('gguf')}>Clear</button>
										</div>
									{/if}
									{#if ideState.localMmprojPath}
										<div class="row xbetween ycenter border rounded pad8 text-xs">
											<div class="box gap2"><span class="font-bold">Vision projector (mmproj)</span><span class="text-3xs col3">{ideState.localMmprojPath}</span></div>
											<button class="btn-secondary" onclick={() => clearLegacyPath('mmproj')}>Clear</button>
										</div>
									{/if}
									{#if ideState.localMlxModelPath}
										<div class="row xbetween ycenter border rounded pad8 text-xs">
											<div class="box gap2"><span class="font-bold">Custom MLX</span><span class="text-3xs col3">{ideState.localMlxModelPath}</span></div>
											<button class="btn-secondary" onclick={() => clearLegacyPath('mlx')}>Clear</button>
										</div>
									{/if}
								</div>
							{/if}

							<div class="settings-row border-top padtop16">
								<div class="box gap4">
									<span class="settings-label font-bold text-red">Reset AI configuration</span>
									<span class="text-2xs col3">Clears saved models, local model paths, provider URLs, selected model, and provider credentials. Downloaded files stay on disk.</span>
								</div>
								<button class="btn-danger text-center font-bold" onclick={resetAiConfiguration}>Reset AI Models & Credentials</button>
							</div>
						</div>
					{:else if activeTab === "models"}
					<Models/>
					{:else if activeTab === "skills"}
						<Skills/>
					{:else if activeTab === "files"}
						<div class="box gap16">
							<h3 class="settings-section-title">File access</h3>
							<p class="settings-guidance">FractalEngine can read only folders you choose through a native picker. Saved vaults may request access again when their folder is not listed here.</p>
							<div class="row xbetween ycenter">
								<span class="settings-label font-bold">Granted folders</span>
								<button class="btn-secondary" onclick={grantFolderAccess}>Grant folder…</button>
							</div>
							{#each authorizedPaths as path (path)}
								<div class="settings-model-row row xbetween ycenter border rounded pad8 text-xs">
									<span class="col1 break-all">{path}</span>
									<button class="btn-secondary" onclick={() => revokeFolderAccess(path)} aria-label={`Revoke access to ${path}`}>Revoke</button>
								</div>
							{:else}
								<p class="text-2xs col3">No folders have been granted yet.</p>
							{/each}
							{#if fileAccessStatus}
								<p class="settings-guidance" role="status">{fileAccessStatus}</p>
							{/if}
						</div>
					{:else if activeTab === "media"}
						<div class="box gap16">
							<h3 class="settings-section-title">Media Library</h3>
							<div class="settings-row"><span class="settings-label font-bold">Library location</span><span class="text-2xs col3 break-all">{mediaLibraryPath}</span></div>
							<div class="settings-row"><label class="settings-label" for="media-default-sort">Default sort</label><select id="media-default-sort" class="settings-select" value={media.sort} onchange={event => media.setSort((event.target as HTMLSelectElement).value as typeof media.sort)}><option value="added">Recently added</option><option value="name">Name</option><option value="modified">Modified</option><option value="size">Size</option><option value="kind">Kind</option></select></div>
							<div class="settings-row"><label class="settings-label" for="media-thumb-edge">Thumbnail max edge</label><input id="media-thumb-edge" type="range" min="96" max="320" step="8" value={media.thumbSize} oninput={event => media.setThumbSize(Number((event.target as HTMLInputElement).value))} /></div>
							<div class="settings-row"><label class="settings-label" for="media-import-mode">Default import mode</label><select id="media-import-mode" class="settings-select" value={media.defaultImportMode} onchange={event => media.setDefaultImportMode((event.target as HTMLSelectElement).value as 'copy' | 'move')}><option value="copy">Copy into library</option><option value="move">Move into library</option></select></div>
						</div>
					{:else if activeTab === "browser"}
						<div class="box gap16">
							<h3 class="settings-section-title">
								Browser Settings
							</h3>

							<div class="settings-row">
								<label for="homepage-url" class="settings-label"
									>Default Homepage / URL</label
								>
								<input
									id="homepage-url"
									type="text"
									class="settings-input"
									bind:value={localBrowserUrl}
									placeholder="https://www.google.com"
								/>
							</div>

							<div class="settings-row row ycenter gap8">
								<input
									id="browser-session-restore"
									type="checkbox"
									bind:checked={localSessionRestore}
								/>
								<label for="browser-session-restore" class="settings-label font-bold cursor-pointer">
									Reopen tabs from the last browser session
								</label>
							</div>

							<div class="settings-row border-top padtop16">
								<span class="settings-label font-bold text-red"
									>Danger Zone</span
								>
								<button
									class="btn-danger text-center w100 font-bold"
									onclick={resetPasswordVault}
								>
									Reset Passwords Vault Data
								</button>
							</div>
						</div>
					{/if}
					</div>
					{#if saveError}<p class="settings-save-error" role="alert">{saveError}</p>{/if}
					<div class="settings-footer row gap16">
						<button class="app-button secondary" onclick={handleCancel} disabled={isSaving}>Cancel</button>
						<button class="app-button primary" onclick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Changes'}</button>
					</div>
				</div>
		</div>
	</div>

	<!-- Add Model Modal Overlay -->
	{#if showAddModelModal}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="add-model-overlay"
			onclick={(e) => {
				if (e.target === e.currentTarget) showAddModelModal = false;
			}}
		>
			<div
				class="add-model-dialog box"
				role="dialog"
				aria-modal="true"
				aria-label="Add model"
				tabindex="-1"
				use:trapFocus
				onkeydown={(event) => {
					if (event.key === 'Escape') {
						event.preventDefault();
						showAddModelModal = false;
					}
				}}
			>
				<header class="add-model-header">
					<span class="text-xs font-bold col1">Add Model</span>
					<button
						class="icon-action-btn"
						aria-label="Close Add Model"
						onclick={() => (showAddModelModal = false)}
					>
						<img
							src="/iconset/close.svg"
							alt="Close"
							class="icon-svg-xs"
						/>
					</button>
				</header>

				<div class="add-model-tabs" role="tablist" aria-label="Model source">
					<button
						type="button"
						class="add-model-tab-btn"
						class:is-active={addModelMode === 'api'}
						role="tab"
						aria-selected={addModelMode === 'api'}
						onclick={() => { addModelMode = 'api'; addModelError = ''; }}
					>Via API</button>
					<button
						type="button"
						class="add-model-tab-btn"
						class:is-active={addModelMode === 'local'}
						role="tab"
						aria-selected={addModelMode === 'local'}
						onclick={() => { addModelMode = 'local'; addModelError = ''; }}
					>Upload local file</button>
				</div>

				<div class="add-model-body">
					{#if addModelMode === 'api'}
						<div class="settings-row">
							<label for="custom-provider-name" class="settings-label font-bold">* Provider name</label>
							<input id="custom-provider-name" type="text" class="settings-input" bind:value={apiProviderName} placeholder="e.g. OpenCode" />
						</div>
						<div class="settings-row">
							<label
								for="custom-api-format"
								class="settings-label font-bold"
								>* API Format</label
							>
							<select
								id="custom-api-format"
								class="settings-select"
								bind:value={apiFormat}
							>
								<option value="openai"
									>OpenAI Chat Completions</option
								>
								<option value="anthropic"
									>Anthropic Claude</option
								>
								<option value="gemini">Google Gemini</option>
								<option value="ollama">Ollama</option>
							</select>
						</div>

						<div class="settings-row">
							<div class="row xbetween ycenter">
								<label
									for="custom-request-url"
									class="settings-label font-bold"
								>* API link</label
								>
								<div class="row ycenter gap4">
									<input
										id="custom-full-url"
										type="checkbox"
										bind:checked={apiIsFullUrl}
									/>
									<label for="custom-full-url" class="text-3xs col3 font-bold">Full URL</label>
								</div>
							</div>
							<input
								id="custom-request-url"
								type="text"
								class="settings-input"
								bind:value={apiRequestUrl}
								placeholder="e.g. https://api.example.com/v1"
							/>
						</div>

						<div class="settings-row">
							<div class="row xbetween ycenter">
								<label
									for="custom-model-id"
									class="settings-label font-bold"
								>* Model name</label
								>
								<div class="row ycenter gap4">
									<input
										id="custom-multimodal"
										type="checkbox"
										bind:checked={apiIsMultimodal}
									/>
									<label for="custom-multimodal" class="text-3xs col3 font-bold">Multimodal</label>
								</div>
							</div>
							<input
								id="custom-model-id"
								type="text"
								class="settings-input"
								bind:value={apiModelName}
								placeholder="e.g. gpt-4o-mini"
							/>
						</div>

						<div class="settings-row">
							<label
								for="custom-api-key"
								class="settings-label font-bold"
								>* API Key</label
							>
							<input
								id="custom-api-key"
								type="password"
								class="settings-input"
								bind:value={apiKey}
								placeholder="Paste your API key"
								autocomplete="new-password"
							/>
						</div>
						<p class="text-3xs col3">The key is stored in your OS keychain, never in app files. The model is selected as soon as it is added.</p>
					{:else}
						<div class="settings-row">
							<label for="local-model-name" class="settings-label font-bold">* Model name</label>
							<input id="local-model-name" type="text" class="settings-input" bind:value={localName} placeholder="e.g. Qwen Coder 7B" />
						</div>
						<div class="settings-row">
							<label for="local-model-file" class="settings-label font-bold">* GGUF model file</label>
							<div class="settings-input-group-row">
								<input id="local-model-file" class="settings-input" value={localGgufFile} placeholder="No file chosen" readonly />
								<button class="btn-secondary" onclick={() => browseModalGguf('model')}>Choose File…</button>
							</div>
						</div>
						<div class="settings-row">
							<label for="local-mmproj-file" class="settings-label font-bold">Vision projector (mmproj) — optional</label>
							<div class="settings-input-group-row">
								<input id="local-mmproj-file" class="settings-input" value={localMmprojFile} placeholder="No file chosen" readonly />
								<button class="btn-secondary" onclick={() => browseModalGguf('mmproj')}>Choose File…</button>
								{#if localMmprojFile}
									<button class="btn-secondary" onclick={() => (localMmprojFile = '')}>Clear</button>
								{/if}
							</div>
						</div>
						<p class="text-3xs col3">The file stays where it is on disk. The model loads into memory when you send a message and unloads after the reply.</p>
					{/if}
				</div>

				{#if addModelError}<p class="settings-save-error" role="alert">{addModelError}</p>{/if}
				<footer class="add-model-footer">
					<button
						class="btn-secondary"
						onclick={() => (showAddModelModal = false)}
						>Cancel</button
					>
					<button class="btn-primary" onclick={submitAddModel} disabled={addModelBusy}>
						{addModelBusy ? 'Adding…' : addModelMode === 'api' ? 'Add API Model' : 'Add Local Model'}
					</button>
				</footer>
			</div>

		</div>
	{/if}
{/if}
