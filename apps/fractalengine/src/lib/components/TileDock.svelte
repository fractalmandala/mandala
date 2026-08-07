<script lang="ts">
	import { canvas, type TileKind } from '../state/canvas.svelte';
	import { appState } from '../state/app.svelte';
	import { FUTURE_MODULES } from '../data/tileKinds';

	let activeMenu = $state<string | null>(null);

	function toggleMenu(menu: string) {
		if (activeMenu === menu) {
			activeMenu = null;
		} else {
			activeMenu = menu;
		}
	}

	function addTileAndClose(kind: TileKind) {
		canvas.addTile(kind);
		activeMenu = null;
	}

	const modules = [
		{
			id: 'code',
			label: 'Code',
			icon: '/iconset/folder.svg',
			kinds: [
				{ kind: 'fileTree', label: 'Explorer' },
				{ kind: 'editor', label: 'Editor' },
				{ kind: 'terminal', label: 'Terminal' }
			]
		},
		{
			id: 'design',
			label: 'Design',
			icon: '/iconset/IntelliJ Platform Icons (196).svg',
			kinds: [
				{ kind: 'browser', label: 'Browser' },
				{ kind: 'designCanvas', label: 'Design Canvas (Soon)', disabled: true }
			]
		},
		{
			id: 'system',
			label: 'System',
			icon: '/iconset/config.svg',
			kinds: [
				{ kind: 'ai', label: 'AI Copilot' },
				{ kind: 'modelMarketplace', label: 'Model Downloads' },
				{ kind: 'skillsMarketplace', label: 'Skills Library' }
			]
		}
	];
</script>

<div class="tile-dock row ycenter gap12 shadow-lg">
	<button 
		class="dock-btn col ycenter gap4"
		onclick={() => appState.openTemplateGallery()}
		title="Templates / Layout Selection"
	>
		<img src="/iconset/layout.svg" alt="Templates" class="icon-svg-large icon-emphasis" />
		<span class="dock-btn-label">Templates</span>
	</button>

	<div class="dock-divider"></div>

	{#each modules as mod (mod.id)}
		<div class="dock-item relative">
			<button 
				class="dock-btn col ycenter gap4"
				onclick={() => toggleMenu(mod.id)}
				class:is-active={activeMenu === mod.id}
				title="Open {mod.label} panel launcher"
			>
				<img src={mod.icon} alt={mod.label} class="icon-svg-large icon-emphasis" />
				<span class="dock-btn-label">{mod.label}</span>
			</button>

			{#if activeMenu === mod.id}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="dock-menu-click-overlay" onclick={() => activeMenu = null}></div>
				<div class="dock-menu box shadow-xl col gap4">
					<div class="dock-menu-title font-semibold text-xs col3 padbottom4">{mod.label} Tools</div>
					{#each mod.kinds as item (item.kind)}
						<button
							class="dock-menu-item text-xs text-left"
							disabled={item.disabled}
							onclick={() => !item.disabled && addTileAndClose(item.kind as TileKind)}
						>
							{item.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<div class="dock-divider"></div>

	{#each FUTURE_MODULES as fut (fut.id ?? fut.label)}
		<button 
			class="dock-btn col ycenter gap4 is-disabled" 
			disabled 
			title="{fut.label} - Coming Soon: {fut.description}"
		>
			<img src={fut.icon} alt="" class="icon-svg-large icon-emphasis" />
			<span class="dock-btn-label">{fut.label}</span>
		</button>
	{/each}
</div>
