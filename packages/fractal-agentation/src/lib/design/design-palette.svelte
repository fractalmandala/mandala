<script lang="ts">
	import { COMPONENT_REGISTRY, type ComponentType } from './design-types';

	interface Props {
		activeType: ComponentType | null;
		isDarkMode: boolean;
		visible: boolean;
		wireframeEnabled: boolean;
		wireframePurpose: string;
		placementCount: number;
		onSelect: (type: ComponentType) => void;
		onDragStart?: (type: ComponentType, e: MouseEvent) => void;
		onWireframeToggle: (on: boolean) => void;
		onWireframePurposeChange: (purpose: string) => void;
		onClear: () => void;
		onExited?: () => void;
	}

	let {
		activeType = null,
		isDarkMode = true,
		visible = false,
		wireframeEnabled = false,
		wireframePurpose = '',
		placementCount = 0,
		onSelect,
		onDragStart,
		onWireframeToggle,
		onWireframePurposeChange,
		onClear,
		onExited
	}: Props = $props();

	let footerCollapsed = $state(true);
	let footerText = $state('');

	// Footer text
	$effect(() => {
		if (placementCount > 0) {
			footerCollapsed = false;
			footerText = `${placementCount} ${wireframeEnabled ? 'Component' : 'Change'}${placementCount !== 1 ? 's' : ''}`;
		} else {
			footerCollapsed = true;
			setTimeout(() => { footerText = ''; }, 300);
		}
	});

	function handleItemMouseDown(type: ComponentType, e: MouseEvent) {
		if (e.button === 0) onDragStart?.(type, e);
	}

	const paletteCount = $derived(COMPONENT_REGISTRY.reduce((sum, s) => sum + s.items.length, 0));
</script>

{#if visible}
	<div
		class="dp-palette"
		class:dp-light={!isDarkMode}
		data-feedback-toolbar
		onclick={(e) => e.stopPropagation()}
		onmousedown={(e) => e.stopPropagation()}
	>
		<!-- Header -->
		<div class="dp-palette-header">
			<div class="dp-palette-title">Layout Mode</div>
			<div class="dp-palette-desc">
				Place components from the palette to design your layout. Drag to size, click for default.
			</div>
		</div>

		<!-- Wireframe toggle -->
		<button
			class="dp-wireframe-toggle"
			class:dp-active={wireframeEnabled}
			onclick={() => onWireframeToggle(!wireframeEnabled)}
		>
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1" />
				<circle cx="4.5" cy="4.5" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="7" cy="4.5" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="9.5" cy="4.5" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="4.5" cy="7" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="7" cy="7" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="9.5" cy="7" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="4.5" cy="9.5" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="7" cy="9.5" r="0.8" fill="currentColor" opacity=".6" />
				<circle cx="9.5" cy="9.5" r="0.8" fill="currentColor" opacity=".6" />
			</svg>
			<span>Wireframe New Page</span>
		</button>

		<!-- Wireframe purpose -->
		<div class="dp-purpose-wrap" class:dp-purpose-collapsed={!wireframeEnabled}>
			<textarea
				class="dp-purpose-input"
				placeholder="Describe this page to provide additional context..."
				value={wireframePurpose}
				oninput={(e) => onWireframePurposeChange((e.target as HTMLTextAreaElement).value)}
				rows={2}
			></textarea>
		</div>

		<!-- Component grid -->
		<div class="dp-palette-grid">
			{#each COMPONENT_REGISTRY as section}
				<div class="dp-section">
					<div class="dp-section-title">{section.section}</div>
					{#each section.items as item}
						<button
							class="dp-item"
							class:dp-item-active={activeType === item.type}
							class:dp-item-wireframe={wireframeEnabled}
							onclick={() => onSelect(item.type)}
							onmousedown={(e) => handleItemMouseDown(item.type, e)}
						>
							<span class="dp-item-icon">
								<svg viewBox="0 0 20 16" width="20" height="16" fill="none">
									<rect x="1" y="1" width="18" height="14" rx="1" stroke="currentColor" stroke-width="0.5" />
									<rect x="4" y="5" width="10" height="1" rx=".5" fill="currentColor" opacity=".3" />
									<rect x="4" y="7.5" width="7" height="1" rx=".5" fill="currentColor" opacity=".15" />
								</svg>
							</span>
							<span class="dp-item-label">{item.label}</span>
						</button>
					{/each}
				</div>
			{/each}
		</div>

		<!-- Footer -->
		<div class="dp-footer-wrap" class:dp-footer-hidden={footerCollapsed}>
			<div class="dp-footer">
				<span class="dp-footer-count">{footerText}</span>
				<button class="dp-footer-clear" onclick={onClear}>Clear</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dp-palette {
		position: fixed; bottom: 64px; right: 16px; z-index: 10001;
		width: 260px; max-height: calc(100vh - 100px);
		background: rgba(28,28,30,0.98); backdrop-filter: blur(18px);
		border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
		box-shadow: 0 18px 34px rgba(0,0,0,0.2); overflow: hidden;
		display: flex; flex-direction: column;
		transition: transform 0.2s ease, opacity 0.2s ease;
	}
	.dp-palette-enter { transform: translateY(0); opacity: 1; }
	.dp-palette-exit { transform: translateY(12px); opacity: 0; pointer-events: none; }

	.dp-palette.dp-light {
		background: rgba(255,255,255,0.99); border-color: rgba(15,23,42,0.08);
		box-shadow: 0 18px 34px rgba(15,23,42,0.08);
	}
	.dp-palette.dp-light .dp-section-title { color: rgba(23,24,28,0.5); }
	.dp-palette.dp-light .dp-item { color: rgba(15,23,42,0.7); }
	.dp-palette.dp-light .dp-item:hover { background: rgba(15,23,42,0.05); }
	.dp-palette.dp-light .dp-item-active { background: rgba(37,99,235,0.1); color: #2563eb; }
	.dp-palette.dp-light .dp-footer { border-color: rgba(15,23,42,0.08); }
	.dp-palette.dp-light .dp-footer-count { color: rgba(15,23,42,0.6); }

	.dp-palette-header { padding: 12px 14px 8px; }
	.dp-palette-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 4px; }
	.dp-palette-desc { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.4; }

	.dp-wireframe-toggle {
		display: flex; align-items: center; gap: 8px; margin: 0 14px 8px;
		padding: 6px 10px; border: 1px solid rgba(255,255,255,0.08);
		border-radius: 6px; background: transparent; color: rgba(255,255,255,0.6);
		font-size: 12px; cursor: pointer; transition: all 0.15s;
	}
	.dp-wireframe-toggle:hover { border-color: rgba(255,255,255,0.14); }
	.dp-wireframe-toggle.dp-active { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.3); color: #f97316; }

	.dp-purpose-wrap {
		display: grid; grid-template-rows: 1fr; transition: grid-template-rows 0.2s ease;
		margin: 0 14px 8px;
	}
	.dp-purpose-collapsed { grid-template-rows: 0fr; }
	.dp-purpose-input {
		overflow: hidden; width: 100%; min-height: 0; resize: none;
		background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
		border-radius: 6px; padding: 6px 8px; color: rgba(255,255,255,0.8);
		font-size: 11px; outline: none; line-height: 1.4;
	}
	.dp-purpose-input:focus { border-color: #3b82f6; }

	.dp-palette-grid { flex: 1; overflow-y: auto; padding: 0 8px 8px; }
	.dp-section { padding: 6px 6px; }
	.dp-section-title {
		font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;
		color: rgba(255,255,255,0.35); padding: 2px 4px; margin-bottom: 4px;
	}
	.dp-item {
		display: flex; align-items: center; gap: 8px; width: 100%;
		padding: 5px 8px; border: none; border-radius: 6px;
		background: transparent; color: rgba(255,255,255,0.65);
		font-size: 12px; cursor: pointer; text-align: left;
		transition: background 0.1s;
	}
	.dp-item:hover { background: rgba(255,255,255,0.06); }
	.dp-item-active { background: rgba(10,132,255,0.15); color: #3b82f6; }
	.dp-item-wireframe.dp-item-active { background: rgba(249,115,22,0.15); color: #f97316; }
	.dp-item-icon { display: flex; align-items: center; opacity: 0.6; flex-shrink: 0; }
	.dp-item-label { white-space: nowrap; }

	/* Footer */
	.dp-footer-wrap {
		display: grid; grid-template-rows: 1fr;
		transition: grid-template-rows 0.25s ease;
	}
	.dp-footer-hidden { grid-template-rows: 0fr; }
	.dp-footer {
		overflow: hidden; display: flex; align-items: center; justify-content: space-between;
		padding: 8px 14px; border-top: 1px solid rgba(255,255,255,0.08);
	}
	.dp-footer-count { font-size: 11px; color: rgba(255,255,255,0.5); }
	.dp-footer-clear {
		background: transparent; border: none; color: #ef4444; font-size: 11px; cursor: pointer;
		padding: 2px 6px; border-radius: 4px;
	}
	.dp-footer-clear:hover { background: rgba(239,68,68,0.1); }
</style>
