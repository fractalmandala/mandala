<script lang="ts">
	// ai-elements/ModelSelector
	// Searchable palette modeled on CommandPalette. Renders `groups` and
	// emits onSelect(provider, modelId) on click/enter. No data logic.

	import type { ModelGroup, ModelOption } from './types';

	let {
		groups = [],
		value = '',
		placeholder = 'Select a model…',
		onSelect = (_provider: string, _modelId: string) => {},
	} = $props<{
		groups?: ModelGroup[];
		value?: string;
		placeholder?: string;
		onSelect?: (provider: string, modelId: string) => void;
	}>();

	let isOpen = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let rootEl = $state<HTMLDivElement | null>(null);

	// Flatten groups → [{group, option}] for keyboard nav
	let flatList = $derived.by(() => {
		const out: { group: string; option: ModelOption }[] = [];
		const q = query.trim().toLowerCase();
		for (const g of groups) {
			for (const opt of g.options) {
				if (q) {
					const hay = `${opt.label} ${opt.id} ${opt.provider} ${g.label}`.toLowerCase();
					if (!hay.includes(q)) continue;
				}
				out.push({ group: g.label, option: opt });
			}
		}
		return out;
	});

	// Reset selected index when the filter changes
	$effect(() => {
		query;
		selectedIndex = 0;
	});

	function open() {
		isOpen = true;
		query = '';
		selectedIndex = 0;
		// Focus the input on next tick
		setTimeout(() => inputEl?.focus(), 0);
	}

	function close() {
		isOpen = false;
		query = '';
	}

	function commit(index: number) {
		const item = flatList[index];
		if (!item) return;
		onSelect(item.option.provider, item.option.id);
		close();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, Math.max(0, flatList.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(0, selectedIndex - 1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			commit(selectedIndex);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	function onDocClick(e: MouseEvent) {
		if (!rootEl) return;
		if (!rootEl.contains(e.target as Node)) {
			close();
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', onDocClick);
			return () => document.removeEventListener('mousedown', onDocClick);
		}
	});

	// Resolve current label for the closed trigger
	let currentLabel = $derived.by(() => {
		for (const g of groups) {
			for (const opt of g.options) {
				if (opt.id === value) return opt.label;
			}
		}
		return value || placeholder;
	});
</script>

<div class="ai-model-selector" bind:this={rootEl}>
	{#if !isOpen}
		<button
			type="button"
			class="ai-model-trigger"
			onclick={open}
			title="Change model"
			aria-haspopup="listbox"
			aria-expanded="false"
		>
			<span class="ai-model-trigger-label">{currentLabel}</span>
		</button>
	{:else}
		<div class="ai-model-popover">
			<input
				bind:this={inputEl}
				bind:value={query}
				class="ai-model-search"
				type="text"
				placeholder="Search models…"
				onkeydown={onKeydown}
				role="combobox"
				aria-expanded="true"
				aria-controls="ai-model-options"
				aria-activedescendant={flatList[selectedIndex] ? `ai-model-option-${selectedIndex}` : undefined}
			/>
			<div class="ai-model-list" id="ai-model-options" role="listbox">
				{#each flatList as item, i (i)}
					{@const isCurrent = item.option.id === value}
					{@const isDisabled = item.option.runnable === false}
					<button
						type="button"
						class="ai-model-item"
						class:is-selected={i === selectedIndex}
						class:is-current={isCurrent}
						class:is-disabled={isDisabled}
						id={`ai-model-option-${i}`}
						role="option"
						aria-selected={isCurrent}
						aria-disabled={isDisabled}
						disabled={isDisabled}
						onclick={() => { if (!isDisabled) commit(i); }}
						onmouseenter={() => (selectedIndex = i)}
						title={item.option.unavailableReason ?? ''}
					>
						<span class="ai-model-item-label">{item.option.label}</span>
						<span class="ai-model-item-group">{isDisabled ? item.option.unavailableReason ?? item.group : item.group}</span>
					</button>
				{:else}
					<div class="ai-model-empty">No models match.</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
