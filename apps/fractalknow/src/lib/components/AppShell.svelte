<script lang="ts">
	import { desktopBridge } from '$lib/desktop';
	import {
		appProviders,
		applyMenuEnablement,
		bindTerminalBridge,
		closeRightPanel,
		connectAppConfigBridge,
		connectRecentProjectsBridge,
		createCommandItems,
		desktopEvents,
		handleMenuAction,
		hydrateProjectConfig,
		initializeFeatureFlags,
		initializeI18nProvider,
		initializeTelemetryProvider,
		markDesktopListenersReady,
		markProviderFailed,
		navigateToDeepLink,
		navigateToHash,
		navigateToInitialDocument,
		navigationState,
		openDialog,
		recordConsentRequired,
		recordCrashInvite,
		recordDeepLink,
		recordMenuAction,
		recordProjectConfig,
		recordServerStatus,
		recordTelemetryEvent,
		recordUpdateStatus,
		resolveShellShortcutCommand,
		runCommandById,
		setSidebarOpen,
		setSidebarPartition,
		shellPreferences,
		shellState,
		unbindTerminalBridge,
		workspaceDocuments,
		LEFT_COLLAPSE_THRESHOLD,
	} from '$lib/shell';
	import type { OkMenuAction } from '$lib/desktop';
	import CommandPalette from './CommandPalette.svelte';
	import DialogHost from './DialogHost.svelte';
	import EditorSurface from './EditorSurface.svelte';
	import RightPanel from './RightPanel.svelte';
	import ShellSidebar from './ShellSidebar.svelte';
	import ShellToolbar from './ShellToolbar.svelte';
	import StatusBadge from './ui/StatusBadge.svelte';
	import Toast from './ui/Toast.svelte';
	import { browser } from '$app/environment';

	let nativeStatus = $state('Checking native bridge...');
	let baseProvidersInitialized = $state(false);
	const loadingProviders = $derived($appProviders.filter((provider) => provider.status === 'loading'));
	const failedProviders = $derived($appProviders.filter((provider) => provider.status === 'failed'));
	const hasWorkspaceDocuments = $derived($workspaceDocuments.some((document) => document.kind !== 'migration'));
	const bridge = $derived(
		$desktopBridge.status === 'ready' ? $desktopBridge.bridge : null,
	);
	const activeDocument = $derived(
		$shellState.activeTarget.kind === 'doc' ? $shellState.activeTarget.path : null,
	);
	const activeTerminal = $derived(
		$shellPreferences.terminalTabs.find((tab) => tab.id === $shellPreferences.activeTerminalTabId)?.id ??
			$shellPreferences.terminalTabs[0]?.id ??
			null,
	);

	$effect(() => {
		void applyMenuEnablement(bridge, {
			activeDocument,
			activeSidebarSection: $shellPreferences.sidebarSection,
			activeTerminal,
			canNavigateBack: $navigationState.backStack.length > 0,
			canNavigateForward: $navigationState.forwardStack.length > 0,
		});
	});

	$effect(() => {
		if (baseProvidersInitialized) return;

		baseProvidersInitialized = true;
		initializeI18nProvider();
		initializeTelemetryProvider();
	});

	function resolveTheme(source: 'system' | 'light' | 'dark'): 'light' | 'dark' | 'hc' {
		if (!browser || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return source === 'dark' ? 'dark' : 'light';
		}
		// High contrast is an OS-level accessibility request, not a palette
		// choice: whenever the OS asks for more contrast, the hc theme wins.
		if (window.matchMedia('(prefers-contrast: more)').matches) return 'hc';
		if (source === 'light' || source === 'dark') return source;
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	$effect(() => {
		if (!browser || typeof document === 'undefined') return;
		const source = $shellPreferences.themeSource;
		const apply = () => {
			document.documentElement.dataset.theme = resolveTheme(source);
			if ($shellPreferences.reducedTransparency) {
				document.documentElement.dataset.reducedTransparency = 'true';
			} else {
				delete document.documentElement.dataset.reducedTransparency;
			}
		};
		apply();
		const runtime = $desktopBridge.status === 'ready' ? $desktopBridge.bridge.runtime : null;
		document.documentElement.dataset.platform = runtime ?? 'browser';
		// Canonical platform class consumed by the title-bar reserve styles:
		// macOS reserves left space for the traffic-light cluster.
		const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
		const platformHint = nav.userAgentData?.platform ?? nav.platform ?? '';
		document.documentElement.classList.toggle('platform-macos', /mac/i.test(platformHint));
		if (typeof window.matchMedia !== 'function') return;
		// Watch both OS signals; the color-scheme flip only matters when the
		// source is system, while the contrast flip applies at any source.
		const scheme = window.matchMedia('(prefers-color-scheme: dark)');
		const contrast = window.matchMedia('(prefers-contrast: more)');
		const onChange = () => apply();
		if (typeof scheme.addEventListener !== 'function') return;
		scheme.addEventListener('change', onChange);
		contrast.addEventListener('change', onChange);
		return () => {
			scheme.removeEventListener('change', onChange);
			contrast.removeEventListener('change', onChange);
		};
	});

	$effect(() => {
		const handleHashChange = () => {
			navigateToHash(window.location.hash);
		};

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	});

	// Viewport-partition watcher for the sidebar pin store (mirrors the
	// reference sidebar.tsx: crossing the 1024px collapse threshold re-resolves
	// the effective open/collapsed state from the per-partition pins).
	$effect(() => {
		if (typeof window.matchMedia !== 'function') return;
		const mql = window.matchMedia(`(min-width: ${LEFT_COLLAPSE_THRESHOLD}px)`);
		const onChange = () => setSidebarPartition(mql.matches ? 'above' : 'below');
		onChange();
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	});

	$effect(() => {
		const state = $desktopBridge;
		if (state.status === 'loading') {
			nativeStatus = 'Checking native bridge...';
			return;
		}
		if (state.status === 'error') {
			nativeStatus = state.error;
			markProviderFailed('project-config', state.error);
			markProviderFailed('desktop-listeners', state.error);
			markProviderFailed('feature-flags', state.error);
			return;
		}
		nativeStatus = `${state.bridge.runtime} bridge connected`;
		connectRecentProjectsBridge(state.bridge);
		void connectAppConfigBridge(state.bridge);
		void import('$lib/editor/project-files').then(({ connectProjectFilesBridge }) =>
			connectProjectFilesBridge(state.bridge),
		);
		recordProjectConfig(state.bridge.config);
		hydrateProjectConfig(state.bridge.config);
		initializeFeatureFlags(state.bridge.config);
		if (!window.location.hash) navigateToInitialDocument(state.bridge.config.initialDoc);
		recordTelemetryEvent('desktop_bridge_ready', {
			runtime: state.bridge.runtime,
			e2eSmoke: state.bridge.config.e2eSmoke,
			singleFile: state.bridge.config.singleFile,
		});
		void state.bridge.signalThemeApplied({
			reducedTransparency: $shellPreferences.reducedTransparency,
		});
		const unsubscribeProject = state.bridge.onProjectSwitched((config) => {
			recordProjectConfig(config);
			hydrateProjectConfig(config);
			recordTelemetryEvent('project_switched', {
				projectName: config.projectName,
				singleFile: config.singleFile,
			});
		});
		const unsubscribeMenu = state.bridge.onMenuAction((action: OkMenuAction) => {
			recordMenuAction(action);
			void handleMenuAction(action, state.bridge);
		});
		const unsubscribeDeepLink = state.bridge.onDeepLink((event) => {
			recordDeepLink(event);
			navigateToDeepLink(event.url);
			recordTelemetryEvent('deep_link_opened', { url: event.url });
		});
		const unsubscribeUpdateStatus = state.bridge.onUpdateStatus((event) => {
			recordUpdateStatus(event);
			if (event.status === 'available' || event.status === 'ready' || event.status === 'error') {
				openDialog('update-status');
			}
		});
		const unsubscribeServerStatus = state.bridge.onServerStatus(recordServerStatus);
		const unsubscribeCrashInvite = state.bridge.onCrashInvite((event) => {
			recordCrashInvite(event);
			openDialog('crash-recovery');
		});
		const unsubscribeConsentRequired = state.bridge.onConsentRequired((event) => {
			recordConsentRequired(event);
			openDialog('consent');
		});
		bindTerminalBridge(state.bridge);
		markDesktopListenersReady();
		return () => {
			unsubscribeProject();
			unsubscribeMenu();
			unsubscribeDeepLink();
			unsubscribeUpdateStatus();
			unsubscribeServerStatus();
			unsubscribeCrashInvite();
			unsubscribeConsentRequired();
			unbindTerminalBridge();
		};
	});

	function handleKeydown(event: KeyboardEvent): void {
		const bridge = $desktopBridge.status === 'ready' ? $desktopBridge.bridge : null;
		const commands = createCommandItems(bridge);
		const overlayOpen = $shellState.commandPaletteOpen || $shellState.activeDialog !== 'none';
		// In the Tauri runtime the native menu owns its accelerator chords;
		// the web resolver must stay silent for them (single owner per chord).
		const commandId = resolveShellShortcutCommand(event, overlayOpen, bridge?.runtime === 'tauri');
		if (!commandId) {
			// No shortcut match — still let the document keydown handler run so
			// rename-on-Enter / delete-on-Backspace work everywhere.
			handleDocumentKeydown(event);
			handleOverlayEscape(event);
			return;
		}
		event.preventDefault();
		void runCommandById(commands, commandId).then(() => {
			if (commandId === 'focus-search') {
				document.querySelector<HTMLInputElement>('[data-sidebar-search]')?.focus();
			}
		});
	}

	function handleOverlayEscape(event: KeyboardEvent): void {
		if (event.key !== 'Escape') return;
		if ($shellState.commandPaletteOpen || $shellState.activeDialog !== 'none') return;
		if ($shellState.rightPanelOpen) {
			event.preventDefault();
			closeRightPanel();
			return;
		}
		// Below the collapse threshold an unpinned sidebar is transient: Esc
		// dismisses it and focus leaves the sidebar for the main content.
		const narrow =
			typeof window.matchMedia === 'function' &&
			!window.matchMedia(`(min-width: ${LEFT_COLLAPSE_THRESHOLD}px)`).matches;
		if (narrow && $shellState.sidebarOpen && !$shellPreferences.sidebarPinned) {
			event.preventDefault();
			setSidebarOpen(false);
			const sidebarEl = document.querySelector('aside.sidebar');
			if (sidebarEl?.contains(document.activeElement)) {
				document.getElementById('main-content')?.focus();
			}
		}
	}

	function handleDocumentKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Delete' && event.key !== 'Backspace' && event.key !== 'Enter') return;
		const target = event.target;
		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
			return;
		}
		if (target instanceof HTMLElement && target.isContentEditable) return;

		if (event.key === 'Enter') {
			event.preventDefault();
			void runCommandById(createCommandItems($desktopBridge.status === 'ready' ? $desktopBridge.bridge : null), 'rename');
			return;
		}
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			void runCommandById(createCommandItems($desktopBridge.status === 'ready' ? $desktopBridge.bridge : null), 'delete');
		}
	}

	function errorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<a class="skip-link" href="#main-content">Skip to content</a>
<div class="app-shell" data-sidebar={$shellState.sidebarOpen}>
	<ShellSidebar />
	<RightPanel />
	<section class="workspace" aria-label="OpenKnowledge workspace">
		<ShellToolbar />
		{#if failedProviders.length > 0}
			<div class="provider-state provider-state--failed" role="alert" aria-live="assertive">
				<span>Provider failed</span>
				<p>{failedProviders.map((provider) => provider.message).join(' ')}</p>
			</div>
		{:else if loadingProviders.length > 0}
			<div class="provider-state" aria-live="polite">
				<span>Loading app services</span>
				<p>{loadingProviders.map((provider) => provider.label).join(', ')}</p>
			</div>
		{/if}
		<main id="main-content" class="workspace__main" aria-label="Document workspace">
			<svelte:boundary>
				{#if !hasWorkspaceDocuments && $shellState.activePanel !== 'migration'}
					<section class="shell-empty" aria-label="Empty workspace">
						<p>No workspace files</p>
						<h2>Start with a document or project folder.</h2>
						<div>
							<button
								type="button"
								onclick={() => runCommandById(createCommandItems($desktopBridge.status === 'ready' ? $desktopBridge.bridge : null), 'new-doc')}
							>
								New document
							</button>
							<button
								type="button"
								onclick={() => runCommandById(createCommandItems($desktopBridge.status === 'ready' ? $desktopBridge.bridge : null), 'new-project')}
							>
								Choose project
							</button>
						</div>
					</section>
				{:else}
					<EditorSurface />
				{/if}

				{#snippet failed(error, reset)}
					<div class="boundary">
						<h2>Surface crashed</h2>
						<p>{errorMessage(error)}</p>
						<button type="button" onclick={reset}>Reset surface</button>
					</div>
				{/snippet}
			</svelte:boundary>
		</main>
		<footer class="status-footer" aria-label="Application status" aria-live="polite">
			<span>{nativeStatus}</span>
			{#if $desktopEvents.serverStatus}
				<StatusBadge
					tone={$desktopEvents.serverStatus.status === 'running'
						? 'success'
						: $desktopEvents.serverStatus.status === 'error'
							? 'error'
							: 'info'}
					label={`server: ${$desktopEvents.serverStatus.status}`}
				/>
			{:else if $desktopEvents.lastMenuAction}
				<span>last menu: {$desktopEvents.lastMenuAction}</span>
			{:else}
				<span>events: {$desktopEvents.eventCount}</span>
			{/if}
			{#if $desktopEvents.updateStatus}
				<StatusBadge
					tone={$desktopEvents.updateStatus.status === 'error'
						? 'error'
						: $desktopEvents.updateStatus.status === 'available' ||
							  $desktopEvents.updateStatus.status === 'ready'
							? 'warning'
							: 'info'}
					label={`update: ${$desktopEvents.updateStatus.status}`}
				/>
			{/if}
			<span>{$shellState.editorMode} mode</span>
		</footer>
	</section>
	<CommandPalette />
	<DialogHost />
	<Toast />
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.app-shell
		min-height: 100vh
		background: var(--ok-surface)
		display: flex
		color: var(--ok-ink)

	.workspace
		min-width: 0
		min-height: 100vh
		flex: 1
		display: grid
		grid-template-rows: auto auto minmax(0, 1fr) auto

	footer
		min-height: 34px
		padding: 0 14px
		border-top: 1px solid var(--ok-line)
		background: var(--ok-panel)
		color: var(--ok-muted)
		display: flex
		align-items: center
		justify-content: space-between
		gap: 12px
		font-size: 12px

	.provider-state
		margin: 12px 20px 0
		border: 1px solid var(--ok-line)
		border-radius: 8px
		padding: 10px 12px
		background: var(--ok-panel)
		color: var(--ok-muted)
		display: flex
		align-items: center
		justify-content: space-between
		gap: 14px
		font-size: 13px

		&--failed
			border-color: var(--ok-danger)
			color: var(--ok-danger)

		span
			color: var(--ok-ink)
			font-weight: 700

		p
			margin: 0
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

	.boundary
		margin: 20px
		border: 1px solid var(--ok-line)
		border-radius: 8px
		padding: 24px
		background: var(--ok-panel)

		h2
			margin: 0 0 8px
			color: var(--ok-ink)

		p
			color: var(--ok-muted)

		button
			border: 1px solid var(--ok-line)
			border-radius: 6px
			padding: 8px 10px
			background: var(--ok-surface)
			color: var(--ok-ink)
			cursor: pointer

	.shell-empty
		margin: 20px
		min-height: 280px
		border: 1px solid var(--ok-line)
		border-radius: 8px
		padding: 28px
		background: var(--ok-panel)
		display: flex
		flex-direction: column
		align-items: flex-start
		justify-content: center
		gap: 14px

		p
			margin: 0
			color: var(--ok-accent)
			font-size: 12px
			font-weight: 700
			text-transform: uppercase

		h2
			margin: 0
			max-width: 440px
			color: var(--ok-ink)
			font-size: 24px

		div
			display: flex
			flex-wrap: wrap
			gap: 10px

		button
			border: 1px solid var(--ok-line)
			border-radius: 6px
			padding: 9px 12px
			background: var(--ok-surface)
			color: var(--ok-ink)
			cursor: pointer

	@media (max-width: 760px)
		.app-shell
			min-height: 100dvh
			flex-direction: column

		.workspace
			min-height: 0
			grid-template-rows: auto auto minmax(0, 1fr) auto

		.provider-state
			margin: 10px
			align-items: flex-start
			flex-direction: column

			p
				white-space: normal

		footer
			height: auto
			padding: 8px 10px
			align-items: flex-start
			flex-direction: column
			gap: 4px

		.shell-empty
			margin: 10px
			min-height: 220px
			padding: 20px
</style>
