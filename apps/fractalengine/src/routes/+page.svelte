<script lang="ts">
	import { ideState } from '../lib/state/ide.svelte';
	import { isTauri, openBrowserWindow } from '$lib/ipc';
	import { appState } from '../lib/state/app.svelte';
	import { shellState } from '../lib/state/shell.svelte';
	import { notes } from '$lib/modules/notes/state/notes.svelte';
	import { contributions } from '$lib/state/contributions.svelte';
	import BrowserLauncherCard from '$lib/modules/browser/components/BrowserLauncherCard.svelte';
	import { toggleWindowMaximize } from '../lib/ipc';
	import { setTheme, theme } from '$lib/globalstores.svelte'
	import AppDock from '$lib/components/AppDock.svelte'
	import { TEMPLATES } from '$lib/data/templates';
	import Home from '$lib/components/HomeTilesLayout.svelte'
	import BrowserIcon from '$lib/icons/browser.svelte'
	import BitsTooltip from '$lib/fractalui/bits-tooltip.svelte'
	import NewDesign from '$lib/modules/designer/components/NewDesignLayout.svelte'
	import CanvasPatternSelect from '$lib/modules/newdesign/components/CanvasPatternSelect.svelte'
	import SidebarL from '$lib/icons/sidebarL.svelte'
	import SidebarR from '$lib/icons/sidebarR.svelte'
	import { workspaceLayout, type WorkspaceProfileId, type WorkspaceSurfaceId } from '$lib/state/workspaceLayout.svelte';

	// Derived metrics from active file
	let fileRoute = $derived(ideState.activeFile ? ideState.activeFile.path : 'No file open');
	let activeFileDirty = $derived(ideState.activeFile?.isDirty ?? false);
	let activeFile = $derived(ideState.activeFile);
	let saveNameInput = $state('');
	let saveDialogOpen = $state(false);
	let saveInputRef = $state<HTMLInputElement | null>(null);
	let workspaceHeaderRevision = $state(0);
	import { layout } from '$lib/state/layoutstate.svelte';

	interface Props {
		/** When true, opens the browser window in the OS (Tauri) rather than the route. */
		launchInWindow?: boolean;
		/** Panel-mode close callback (for IDE drawer). */
		onClose?: () => void;
	}

	let {
		launchInWindow = false,
		onClose,
	}: Props = $props();

	function apply(id: string) {
		const tpl = TEMPLATES.find(t => t.id === id);
		if (tpl) {
			appState.applyTemplate(tpl);
		}
	}

	function toggleWorkspaceSurface(profile: WorkspaceProfileId, surface: WorkspaceSurfaceId): void {
		const collapsed = workspaceLayout.toggle(profile, surface);
		workspaceHeaderRevision += 1;
		window.dispatchEvent(new CustomEvent('fractalengine:workspace-toggle', { detail: { profile, surface, collapsed } }));
	}

	function isWorkspaceSurfaceCollapsed(profile: WorkspaceProfileId, surface: WorkspaceSurfaceId): boolean {
		workspaceHeaderRevision;
		return workspaceLayout.isCollapsed(profile, surface);
	}

	function handleHeaderClick(event: MouseEvent): void {
		const control = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-workspace-profile][data-workspace-surface]');
		if (!control) return;
		const profile = control.dataset.workspaceProfile as WorkspaceProfileId | undefined;
		const surface = control.dataset.workspaceSurface as WorkspaceSurfaceId | undefined;
		if (!profile || !surface) return;
		event.stopPropagation();
		toggleWorkspaceSurface(profile, surface);
	}

	async function handleFolderPick() {
		await ideState.selectAndLoadDirectory();
	}

	function submitSaveDialog(e: Event) {
		e.preventDefault();
		const name = saveNameInput.trim();
		if (!name) return;
		notes.saveCurrentAsVault(name);
		saveDialogOpen = false;
		saveNameInput = '';
	}

	function cancelSaveDialog() {
		saveDialogOpen = false;
		saveNameInput = '';
	}

	function formatTimestamp(ms: number): string {
		return new Date(ms).toLocaleString();
	}

	async function openBrowser() {
		// `window.open` cannot create a Tauri webview window. Always use the
		// tab-addressed browser engine when running in the desktop app, including
		// when this card is shown inside the app drawer.
		if (isTauri() || launchInWindow) {
			await openBrowserWindow('https://www.google.com');
			return;
		}

		window.open('/browser', '_blank', 'noopener,noreferrer');
	}

	// React to menu-triggered "Save Current as Vault…" by opening the inline dialog.
	$effect(() => {
		if (notes.pendingVaultSavePrompt) {
			saveDialogOpen = true;
			notes.pendingVaultSavePrompt = false;
			// setTimeout (not queueMicrotask) so we focus after Svelte's DOM flush
			// — Svelte's reactive updates are scheduled as microtasks; we need a macrotask.
			setTimeout(() => saveInputRef?.focus(), 0);
		}
	});
</script>

<div class="app-shell box full100">
	<header
		class="header-strip row ycenter xbetween padright16"
		role="presentation"
		onclick={handleHeaderClick}
		ondblclick={(e) => {
			if (e.target === e.currentTarget || (e.target as HTMLElement).hasAttribute('data-tauri-drag-region')) {
				toggleWindowMaximize();
			}
		}}
		>
				<div class="row ycenter gap16">
			{#if appState.activeTemplateId === 'notes'}
				<button class="btn-icon" data-workspace-profile="notes" data-workspace-surface="left" aria-label="Toggle vault sidebar" title="Toggle vault sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('notes', 'left')} />
				</button>
				<button class="btn-icon" data-workspace-profile="notes" data-workspace-surface="leftSecondary" aria-label="Toggle notes file sidebar" title="Toggle notes file sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('notes', 'leftSecondary')} />
				</button>
			{:else if appState.activeTemplateId === 'dev'}
				<button class="btn-icon" data-workspace-profile="dev" data-workspace-surface="left" aria-label="Toggle developer tools sidebar" title="Toggle developer tools sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('dev', 'left')} />
				</button>
			{:else if appState.activeTemplateId === 'code'}
				<button class="btn-icon" data-workspace-profile="code" data-workspace-surface="left" title="Toggle left sidebar" aria-label="Toggle code explorer sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('code', 'left')} />
				</button>
			{:else if appState.activeTemplateId === 'design'}
				<button class="btn-icon" data-workspace-profile="design" data-workspace-surface="left" title="Toggle left sidebar" aria-label="Toggle design layers sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('design', 'left')} />
				</button>
			{:else if appState.activeTemplateId === 'ai'}
				<button class="btn-icon" data-workspace-profile="agent" data-workspace-surface="left" title="Toggle left sidebar" aria-label="Toggle AI sessions sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('agent', 'left')} />
				</button>
			{:else if appState.activeTemplateId === 'media'}
				<button class="btn-icon" data-workspace-profile="media" data-workspace-surface="left" title="Toggle left sidebar" aria-label="Toggle media library sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('media', 'left')} />
				</button>
			{:else if appState.activeTemplateId === 'docs'}
				<button class="btn-icon" data-workspace-profile="docs" data-workspace-surface="left" title="Toggle left sidebar" aria-label="Toggle documentation navigation sidebar">
					<SidebarL collapsed={isWorkspaceSurfaceCollapsed('docs', 'left')} />
				</button>
			{/if}
			{#if appState.activeTemplateId === 'tester'}
				<button class="btn-icon" onclick={() => layout.toggleSidebar1()}>
					<SidebarL collapsed={layout.sidebar1Collapsed}/>
				</button>
			{/if}
				<button
					class="btn-icon"
					onclick={() => apply('home')}
					title="Templates / Layout Selection"
				>
					<img src="/ic-fin/module-appmain.svg" alt="Templates" class="icon-svg-md" />
					<span class="button-text w600 tt-u hover-accent">fracta</span>
				</button>
			</div>
			<div class="row ycenter gap16">
				{#if appState.activeTemplateId === 'code'}
					<button
						class="btn-icon-text"
						onclick={handleFolderPick}
						title="Open Folder"
					>
						<img src="/icontheme-allicon/NewFolder.svg" alt="Folder" class="icon-svg" />
						<span class="button-text">Open Folder</span>
					</button>
				<button
					class="btn-icon-text {activeFileDirty ? 'pulse-save' : ''}"
					onclick={() => ideState.activeFile && ideState.saveActiveFile()}
					disabled={!ideState.activeFile}
					title="Save Current File (Cmd+S)"
				>
					<img src="/iconset/saveColor.svg" alt="Save" class="icon-svg" />
					<span class="button-text">Save File</span>
				</button>
				{/if}
				{#if appState.activeTemplateId === 'code'}
				<button
					class="btn-icon-text"
					onclick={() => ideState.saveWorkspaceToFile()}
					title="Save Current Workspace"
				>
					<img src="/iconset/saveColor.svg" alt="Save" class="icon-svg" />
					<span class="button-text">Save Workspace</span>
				</button>
				<button
					class="btn-icon-text"
					onclick={() => ideState.executeTerminalCommand('pnpm build')}
					title="Run build pipeline"
				>
					<img src="/iconset/runBuild.svg" alt="Run" class="icon-svg" />
					<span class="button-text">Run Build</span>
				</button>
				<button
					class="btn-icon"
					data-workspace-profile="code"
					data-workspace-surface="right"
					title="Toggle Right Sidebar"
					aria-label="Toggle AI Copilot sidebar"
				>
					<SidebarR collapsed={isWorkspaceSurfaceCollapsed('code', 'right')} />
				</button>
				{:else if appState.activeTemplateId === 'notes'}
				<button class="btn-icon-text" onclick={() => notes.openVaultFromFolder()} title="Open Vault Folder">
					<img src="/iconset/folder.svg" alt="Folder" class="icon-svg" />
					<span class="button-text">Open Vault</span>
				</button>
				<button class="btn-icon-text" onclick={() => notes.addFolderToVault()} title="Add Folder to Current Vault">
					<img src="/iconset/addDirectory.svg" alt="Add Folder" class="icon-svg" />
					<span class="button-text">Add Folder</span>
				</button>
				<button
					class="btn-icon-text"
					onclick={() => {
						saveNameInput = '';
						saveDialogOpen = true;
						setTimeout(() => saveInputRef?.focus(), 0);
					}}
					disabled={notes.currentVaultRoots.length === 0}
					title="Save Current as Vault…"
				>
					<img src="/iconset/saveColor.svg" alt="Save" class="icon-svg" />
					<span class="button-text">Save Current</span>
				</button>
				<button class="btn-icon" data-workspace-profile="notes" data-workspace-surface="right" aria-label="Toggle notes AI sidebar">
					<SidebarR collapsed={isWorkspaceSurfaceCollapsed('notes', 'right')} />
				</button>
				{:else if appState.activeTemplateId === 'design'}
					<button class="btn-icon" data-workspace-profile="design" data-workspace-surface="right" aria-label="Toggle design inspector sidebar">
						<SidebarR collapsed={isWorkspaceSurfaceCollapsed('design', 'right')} />
					</button>
				{:else if appState.activeTemplateId === 'ai'}
					<button class="btn-icon" data-workspace-profile="agent" data-workspace-surface="right" aria-label="Toggle AI work panel">
						<SidebarR collapsed={isWorkspaceSurfaceCollapsed('agent', 'right')} />
					</button>
				{:else if appState.activeTemplateId === 'media'}
					<button class="btn-icon" data-workspace-profile="media" data-workspace-surface="right" aria-label="Toggle media inspector sidebar">
						<SidebarR collapsed={isWorkspaceSurfaceCollapsed('media', 'right')} />
					</button>
				{:else if appState.activeTemplateId === 'docs'}
					<button class="btn-icon" data-workspace-profile="docs" data-workspace-surface="right" aria-label="Toggle documentation outline sidebar">
						<SidebarR collapsed={isWorkspaceSurfaceCollapsed('docs', 'right')} />
					</button>
				{:else if appState.activeTemplateId === 'dev'}
					<button class="btn-icon" data-workspace-profile="dev" data-workspace-surface="right" aria-label="Toggle developer inspector sidebar">
						<SidebarR collapsed={isWorkspaceSurfaceCollapsed('dev', 'right')} />
					</button>
				{:else if appState.activeTemplateId === 'tester'}
					<CanvasPatternSelect />
					<button class="btn-icon" onclick={()  => layout.toggleSidebar2()}>
						<SidebarR collapsed={layout.sidebar2Collapsed}/>
					</button>
				{/if}
				{#each contributions.headerActionsFor(appState.activeTemplateId) as action (action.commandId)}
					<button
						class={action.kind === 'strip' ? 'btn-icon-text' : 'btn-icon'}
						onclick={() => void contributions.run(action.commandId)}
						aria-label={action.ariaLabel}
						title={action.title}
					>
						{#if action.commandId === 'media.toggleInspector'}
							<SidebarR collapsed={isWorkspaceSurfaceCollapsed('media', 'right')} />
						{:else}
							<img src={action.icon} alt="" class="icon-svg" />
						{/if}
						{#if action.kind === 'strip'}
							<span class="button-text">{action.title ?? action.ariaLabel}</span>
						{/if}
					</button>
				{/each}
				<BitsTooltip
					text="Open Browser"
					triggerProps={{ class: 'btn-icon', onclick: openBrowser, 'aria-label': 'Open browser' }}
				>
					{#snippet trigger()}
						<BrowserIcon/>
					{/snippet}
				</BitsTooltip>
			</div>
	</header>

	<div class="board-region box w100 h100 overflow-hidden">
		<div class="workspace-transition-surface">
			<svelte:boundary onerror={(e) => console.error('Workspace panel crashed:', e)}>
			{#if appState.activeTemplateId === 'code'}
				{#await import('$lib/modules/ide/components/ClassicIdeLayout.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">Loading editor…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
						<span class="text-item">Failed to load the editor panel.</span>
						<span class="text-item muted text-xs">{error?.message ?? String(error)}</span>
					</div>
				{/await}
			{:else if appState.activeTemplateId === 'notes'}
				{#await import('$lib/modules/notes/components/shell/NotesWorkspaceShell.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">Loading notes…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
						<span class="text-item">Failed to load the notes panel.</span>
						<span class="text-item muted text-xs">{error?.message ?? String(error)}</span>
					</div>
				{/await}
			{:else if appState.activeTemplateId === 'design'}
				{#await import('$lib/modules/designer/components/DesignLayout.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">Loading design canvas…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
						<span class="text-item">Failed to load the design panel.</span>
						<span class="text-item muted text-xs">{error?.message ?? String(error)}</span>
					</div>
				{/await}
			{:else if appState.activeTemplateId === 'ai'}
				{#await import('$lib/modules/ai/components/AiLayout.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">Loading AI workspace…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
						<span class="text-item">Failed to load the AI workspace.</span>
						<span class="text-item muted text-xs">{error?.message ?? String(error)}</span>
					</div>
				{/await}
			{:else if appState.activeTemplateId === 'bookmarks'}
				{#await import('$lib/modules/bookmarks/components/BookmarksLayout.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">Loading bookmarks…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
						<span class="text-item">Failed to load bookmarks.</span>
						<span class="text-item muted text-xs">{error?.message ?? String(error)}</span>
					</div>
				{/await}
			{:else if appState.activeTemplateId === 'media'}
				{#await import('$lib/modules/media/components/MediaLayout.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">Loading media library…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16"><span class="text-item">Failed to load media library.</span><span class="text-item muted text-xs">{error?.message ?? String(error)}</span></div>
				{/await}
			{:else if appState.activeTemplateId === 'docs'}
				{#await import('$lib/modules/fractaldocs/components/DocsLayout.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">Loading documentation…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
						<span class="text-item">Failed to load documentation wiki.</span>
						<span class="text-item muted text-xs">{error?.message ?? String(error)}</span>
					</div>
				{/await}
			{:else if appState.activeTemplateId === 'dev' }
				{#await import('$lib/modules/dev/DevLayout.svelte')}
					<div class="panel-loading box xcenter ycenter w100 h100"><span class="text-item muted">User beware…</span></div>
				{:then { default: C }}
					<C />
				{:catch error}
					<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
						<span class="text-item">Failed to load dev area.</span>
						<span class="text-item muted text-xs">{error?.message ?? String(error)}</span>
					</div>
				{/await}
				{:else if appState.activeTemplateId === 'tester' }
					<NewDesign/>
			{:else}
				<Home/>
			{/if}
			{#snippet failed(error, reset)}
				<div class="panel-error box xcenter ycenter w100 h100 gap8 pad16">
					<span class="text-item">Something went wrong in this workspace.</span>
					<span class="text-item muted text-xs">{error instanceof Error ? error.message : String(error)}</span>
					<button class="btn-app" onclick={reset}><span class="button-text">Retry</span></button>
				</div>
			{/snippet}
			</svelte:boundary>
		</div>
		{#if !ideState.browserCollapsed && appState.activeTemplateId !== 'code'}
			<aside class="global-browser-drawer" aria-label="In-app browser">
				<BrowserLauncherCard onClose={() => ideState.toggleBrowser()} />
			</aside>
		{/if}
	</div>

	<footer class="footer-strip row ycenter xbetween padleft12 padright12 text-xs col3">
		<div class="row ycenter gap16 flex-1 min-w-0">
			{#if appState.activeTemplateId === 'code'}
				<button
					class="btn-icon-text {ideState.terminalCollapsed ? '' : 'is-active'}"
					onclick={() => ideState.toggleTerminal()}
					title="Toggle Terminal Console"
				>
					<img src="/iconset/toolWindowConsole.svg" alt="Console" class="icon-svg" />
					<span class="button-text">Terminal</span>
				</button>
			{/if}
			<div class="row gap8 ycenter">
			<!-- File Route & Status Merged here -->
			{#if activeFile}
			<span class="text-item-sm">{activeFile.name}</span>
			<span class="text-item-sm truncate" title={fileRoute}>
				{fileRoute}
			</span>
			{:else}
			<span class="text-item-sm truncate" title={fileRoute}>
				{fileRoute}
			</span>
			{/if}
			</div>
			<span class="text-item-sm">Tauri - {isTauri() ? 'Active' : 'Mock (Web)'}</span>
			<a href="/webfront">webfront</a>
		</div>
		<div class="row ycenter gap16">
			<!-- Saved Vaults list (notes template) -->
			{#if appState.activeTemplateId === 'notes'}
				<div class="footer-vault-list">
					{#if notes.savedVaults.length === 0}
						<span class="text-item-sm">No saved vaults yet</span>
					{:else}
						<div class="row ycenter gap8">
							<img src="/iconset/folder.svg" alt="" class="icon-svg-sm" />
							{#each notes.savedVaults as vault (vault.id)}
								<button
									class="saved-vault-item-name"
									title={`Last opened: ${formatTimestamp(vault.lastOpenedAt)}\n${vault.roots.map(r => r.path).join('\n')}`}
									onclick={() => notes.loadSavedVault(vault.id)}
								>
									{vault.name}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
			<!-- Error banner (notes template) -->
			{#if appState.activeTemplateId === 'notes' && notes.vaultError}
				<div class="vault-error" role="alert">
					<img src="/iconset/warning.svg" alt="" class="icon-svg-sm" /> {notes.vaultError}
				</div>
			{/if}
			<!-- Settings Button -->
			<button
				class="btn-icon-text"
				onclick={() => shellState.showSettings = !shellState.showSettings}
				title="Open Settings (Cmd+,)"
			>
				<img src="/iconset/config.svg" alt="Settings" class="icon-svg"/>
				<span class="button-text">Settings</span>
			</button>
			{#if theme.value === 'theme-amrit-dark'}
			<button class="btn-icon-text" onclick={() => setTheme("theme-amrit-light")}>
				<img src="/iconset/colors.svg" alt="Toggle Theme" class="icon-svg">
				<span class="button-text">Toggle Theme</span>
			</button>
			{:else}
			<button class="btn-icon-text" onclick={() => setTheme("theme-amrit-dark")}>
				<img src="/iconset/colors.svg" alt="Toggle Theme" class="icon-svg">
				<span class="button-text">Toggle Theme</span>
				</button>
			{/if}
			<button class="btn-icon-text" onclick={(event) => { event.stopPropagation(); shellState.dockOpen = !shellState.dockOpen; }} title="Open App Switcher">
				<img src="/iconset/templateColor.svg" alt="Apps" class="icon-svg">
				<span class="button-text">Apps</span>
			</button>
		</div>
	</footer>

	<!--App Dock-->
	<AppDock/>

	<!-- Dialogs and Palette Overlays -->
	{#if shellState.showCommandPalette}
		{#await import('$lib/components/CommandPalette.svelte') then { default: C }}
			<C />
		{/await}
	{/if}
	{#if shellState.showSearchOverlay}
		{#await import('$lib/components/SearchOverlay.svelte') then { default: C }}
			<C />
		{/await}
	{/if}
	{#if shellState.showSettings}
		{#await import('$lib/components/SettingsDialog.svelte') then { default: C }}
			<C />
		{/await}
	{/if}
	<!-- Vault Save Modal (notes template) -->
	{#if saveDialogOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="vault-save-overlay"
			onclick={(e) => { if (e.target === e.currentTarget) cancelSaveDialog(); }}
			onkeydown={(e) => { if (e.key === 'Escape') cancelSaveDialog(); }}
			role="dialog"
			aria-modal="true"
			aria-labelledby="vault-name-input"
			tabindex="-1"
		>
			<form class="vault-save-form" onsubmit={submitSaveDialog}>
				<label for="vault-name-input"><span class="text-meta">Vault name</span></label>
				<input
					id="vault-name-input"
					bind:this={saveInputRef}
					bind:value={saveNameInput}
					class="vault-save-input"
					type="text"
					placeholder="e.g. Personal, Work"
					maxlength="64"
				/>
				<div class="vault-save-actions">
					<button type="submit" class="btn-app" disabled={!saveNameInput.trim()}>
						<span class="button-text">Save</span>
					</button>
					<button type="button" class="btn-app" onclick={cancelSaveDialog}>
						<span class="button-text">Cancel</span>
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
