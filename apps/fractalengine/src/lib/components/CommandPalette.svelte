<script lang="ts">
	import { shellState } from '../state/shell.svelte';
	import { ideState } from '../state/ide.svelte';
	import { canvas, type TileKind } from '../state/canvas.svelte';
	import { appState } from '../state/app.svelte';
	import { TILE_KINDS } from '../data/tileKinds';
	import { TEMPLATES } from '../data/templates';
	import { contributions } from '../state/contributions.svelte';
	import { trapFocus } from '$lib/actions/focusTrap';
	import { AI_PROVIDER_DEFINITIONS, type AiProvider } from '$lib/data/aiProviders';

	let searchQuery = $state('');
	let selectedIdx = $state(0);
	let subMode = $state<'none' | 'model' | 'tile' | 'template'>('none');
	let searchInput = $state<HTMLInputElement | null>(null);

	function reportCommandFailure(label: string, error: unknown) {
		const detail = error instanceof Error ? error.message : String(error);
		ideState.addLog(`Command "${label}" failed: ${detail}`, 'error');
		console.error(`Command "${label}" failed`, error);
	}

	function executeItem(item: { label: string; action: () => unknown }) {
		try {
			const result = item.action();
			if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
				void Promise.resolve(result).catch(error => reportCommandFailure(item.label, error));
			}
		} catch (error: unknown) {
			reportCommandFailure(item.label, error);
		}
		if (subMode === 'none') shellState.showCommandPalette = false;
	}

	function switchProvider(provider: AiProvider) {
		const firstModel = ideState.buildModelGroups()
			.flatMap(group => group.options)
			.find(option => option.provider === provider)?.id ?? '';
		ideState.onSelectModel(provider, firstModel);
		shellState.showCommandPalette = false;
	}

	function openSubMode(mode: 'model' | 'tile' | 'template') {
		subMode = mode;
		searchQuery = '';
		selectedIdx = 0;
	}

	// Focus input on mount or toggle
	$effect(() => {
		if (shellState.showCommandPalette) {
			searchQuery = '';
			selectedIdx = 0;
			subMode = 'none';
			setTimeout(() => {
				searchInput?.focus();
			}, 50);
		}
	});

	$effect(() => {
		searchQuery;
		subMode;
		selectedIdx = 0;
	});

	$effect(() => {
		const handleSubmode = (event: Event) => {
			const mode = (event as CustomEvent<'model' | 'tile' | 'template'>).detail;
			openSubMode(mode);
		};
		window.addEventListener('fractalengine:palette-submode', handleSubmode);
		return () => window.removeEventListener('fractalengine:palette-submode', handleSubmode);
	});

	let commandItems = $derived(
		contributions.commandsFor(appState.activeTemplateId).map(command => ({
			label: command.label,
			category: command.category,
			shortcut: command.shortcutLabel ?? '',
			icon: command.icon,
			action: () => contributions.run(command.id),
		})),
	);

	// Derived items list depending on active subMode
	let items = $derived(
		subMode === 'model'
				? [
						...ideState.availableModels.map(m => ({
							label: `AI Model: ${m}`,
							category: `Provider: ${ideState.aiProvider.toUpperCase()}`,
							shortcut: 'API',
							icon: "/iconset/Logo48Colored.svg",
							action: () => {
								ideState.onSelectModel(ideState.aiProvider, m);
								ideState.addLog(`Switched active AI model to ${m}`, 'success');
								shellState.showCommandPalette = false;
							}
						})),
							...AI_PROVIDER_DEFINITIONS.map(provider => ({
								label: `Switch AI Provider to ${provider.label}`,
								category: "AI Providers",
								shortcut: provider.kind,
								icon: "/iconset/Logo48Colored.svg",
								action: () => switchProvider(provider.id)
							}))
					]
				: subMode === 'tile'
				? Object.entries(TILE_KINDS).map(([kind, meta]) => ({
						label: `Add Tile: ${meta.label}`,
						category: `Module: ${meta.module}`,
						shortcut: '',
						icon: '/iconset/add.svg',
						action: () => {
							canvas.addTile(kind as TileKind);
							shellState.showCommandPalette = false;
						}
					}))
				: subMode === 'template'
					? TEMPLATES.map(tpl => ({
							label: `Apply Template: ${tpl.name}`,
							category: 'Workspace Templates',
							shortcut: '',
							icon: '/iconset/layout.svg',
							action: () => {
								appState.applyTemplate(tpl);
								shellState.showCommandPalette = false;
							}
						}))
					: commandItems
	);

	// Filtered list derived from items and searchQuery
	let filteredItems = $derived(
		items.filter(item => 
			item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.category.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Handle keystrokes
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (filteredItems.length === 0) return;
			selectedIdx = (selectedIdx + 1) % filteredItems.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (filteredItems.length === 0) return;
			selectedIdx = (selectedIdx - 1 + filteredItems.length) % filteredItems.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredItems[selectedIdx]) {
				executeItem(filteredItems[selectedIdx]);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			if (subMode !== 'none') {
				subMode = 'none';
				searchQuery = '';
				selectedIdx = 0;
			} else {
				shellState.showCommandPalette = false;
			}
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			shellState.showCommandPalette = false;
		}
	}
</script>

{#if shellState.showCommandPalette}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="command-palette-overlay" onclick={handleBackdropClick}>
		<div class="command-palette-card box" role="dialog" aria-modal="true" aria-label="Command palette" tabindex="-1" use:trapFocus>
			<div class="command-palette-input-container row ycenter">
				<img src="/iconset/explorer.svg" alt="Search" class="command-palette-icon" />
				<input 
					type="text" 
					class="command-palette-input" 
					placeholder={subMode === 'model' ? 'Search models/providers...' : subMode === 'tile' ? 'Search tile kinds...' : subMode === 'template' ? 'Search templates...' : 'Search commands (e.g. Toggle, Model)...'}
					bind:value={searchQuery}
					bind:this={searchInput}
					onkeydown={handleKeyDown}
				/>
				{#if subMode !== 'none'}
					<span class="command-palette-shortcut">Esc to Back</span>
				{/if}
			</div>

			<div class="command-palette-list flex-1 overflow-y-auto">
				{#if filteredItems.length === 0}
					<div class="command-palette-empty">No matching commands found.</div>
				{:else}
					{#each filteredItems as item, idx (`${item.category}:${item.label}`)}
						<button 
							class="command-palette-item {idx === selectedIdx ? 'is-active' : ''}"
							onclick={() => executeItem(item)}
						>
							<div class="command-palette-item-left">
								<img src={item.icon} alt="Icon" class="command-palette-item-icon" />
								<span class="w600 truncate">{item.label}</span>
								<span class="text-2xs col3">({item.category})</span>
							</div>
							{#if item.shortcut}
								<span class="command-palette-shortcut">{item.shortcut}</span>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
