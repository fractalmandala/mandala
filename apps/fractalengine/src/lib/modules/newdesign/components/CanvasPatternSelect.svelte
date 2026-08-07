<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { newdesign } from '../state/newdesign.svelte';
	import { canvasPatternById, canvasPatternGroups, type CanvasPattern } from '../data/canvasPatterns';

	let selected = $derived(canvasPatternById(newdesign.canvasPatternId));

	function baseStyle(pattern: CanvasPattern): string {
		return `background-color: ${pattern.backgroundColor};`;
	}

	// Artwork (gradients + masks) goes on the inner layer so masks never fade the base color.
	function layerStyle(pattern: CanvasPattern): string {
		let css = '';
		if (pattern.backgroundImage) css += `background-image: ${pattern.backgroundImage};`;
		if (pattern.backgroundSize) css += ` background-size: ${pattern.backgroundSize};`;
		if (pattern.backgroundPosition) css += ` background-position: ${pattern.backgroundPosition};`;
		if (pattern.maskImage) css += ` -webkit-mask-image: ${pattern.maskImage}; mask-image: ${pattern.maskImage};`;
		if (pattern.maskComposite) css += ` -webkit-mask-composite: ${pattern.maskComposite}; mask-composite: ${pattern.maskComposite};`;
		return css;
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="btn-icon-text newdesign-pattern-trigger" title="Canvas Background Pattern">
		<span class="newdesign-pattern-thumb" style={selected ? baseStyle(selected) : null}>
			{#if selected}
				<span class="newdesign-pattern-thumb-inner" style={layerStyle(selected)}></span>
			{:else}
				<span class="newdesign-pattern-thumb-inner newdesign-pattern-thumb-default"></span>
			{/if}
		</span>
		<span class="button-text">{selected?.name ?? 'Default Grid'}</span>
		<img src="/iconset/chevronDown.svg" alt="" class="icon-svg" />
	</DropdownMenu.Trigger>
	<!-- Portal into the app shell (not body) — semantic tokens are scoped to .app-root-shell -->
	<DropdownMenu.Portal to=".app-root-shell">
		<DropdownMenu.Content class="newdesign-pattern-menu" align="end" sideOffset={6}>
			<DropdownMenu.RadioGroup
				value={newdesign.canvasPatternId ?? ''}
				onValueChange={(value) => newdesign.setCanvasPattern(value === '' ? null : value)}
			>
				<div class="newdesign-pattern-grid">
					<DropdownMenu.RadioItem
						value=""
						textValue="Default Grid"
						class="newdesign-pattern-tile {newdesign.canvasPatternId === null ? 'selected' : ''}"
						title="Default Grid"
					>
						<span class="newdesign-pattern-preview">
							<span class="newdesign-pattern-preview-inner newdesign-pattern-preview-default"></span>
						</span>
						<span class="newdesign-pattern-name text-item-sm">Default Grid</span>
					</DropdownMenu.RadioItem>
				</div>
				{#each canvasPatternGroups as group (group.label)}
					<div class="newdesign-pattern-heading text-item-sm muted">{group.label}</div>
					<div class="newdesign-pattern-grid">
						{#each group.patterns as pattern (pattern.id)}
							<DropdownMenu.RadioItem
								value={pattern.id}
								textValue={pattern.name}
								class="newdesign-pattern-tile {newdesign.canvasPatternId === pattern.id ? 'selected' : ''}"
								title={pattern.name}
							>
								<span class="newdesign-pattern-preview" style={baseStyle(pattern)}>
									<span class="newdesign-pattern-preview-inner" style={layerStyle(pattern)}></span>
								</span>
								<span class="newdesign-pattern-name text-item-sm">{pattern.name}</span>
							</DropdownMenu.RadioItem>
						{/each}
					</div>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
