<script lang="ts">
	import { Bot, PanelLeft, Search, Settings, SunMoon } from '@lucide/svelte';
	import IconBox from './icon.svelte';

	type Props = {
		query?: string;
		ledgerOpen: boolean;
		askOpen: boolean;
		onToggleNavigator: () => void;
		onExpandLedger: () => void;
		onToggleAsk: () => void;
		onToggleTheme: () => void;
		onOpenSettings: () => void;
		askTrigger?: HTMLButtonElement;
		settingsTrigger?: HTMLButtonElement;
	};

	let {
		query = $bindable(''),
		ledgerOpen,
		askOpen,
		onToggleNavigator,
		onExpandLedger,
		onToggleAsk,
		onToggleTheme,
		onOpenSettings,
		askTrigger = $bindable(),
		settingsTrigger = $bindable()
	}: Props = $props();
</script>

<header class="workbench-topbar">
	<div class="workbench-brand">
		<div class="inline">
			<img src="/images/icon.png" alt="" class="logo-image" />
			<strong>fracta</strong>
		</div>
		<button class="btn-icon" onclick={onToggleNavigator} aria-label="Toggle navigator">
			<IconBox><PanelLeft size={16} /></IconBox>
		</button>
	</div>
	<div class="workbench-crumbs">
		<span>03stations</span>
		{#if !ledgerOpen}
			<button class="ui-icon workbench-reopen-ledger" aria-label="Expand document ledger" onclick={onExpandLedger}>›</button>
		{/if}
	</div>
	<label class="workbench-search">
		<Search size={20} />
		<input data-design-search bind:value={query} placeholder="Search Fracta" aria-label="Search Fracta" />
		<kbd>⌘K</kbd>
	</label>
	<div class="workbench-actions">
		<button bind:this={askTrigger} class="btn-icon" aria-expanded={askOpen} aria-label={askOpen ? 'Collapse Ask Fracta panel' : 'Expand Ask Fracta panel'} onclick={onToggleAsk}><Bot size={16} /></button>
		<button class="btn-icon" aria-label="Toggle light and dark theme" onclick={onToggleTheme}><SunMoon size={16} /></button>
		<button bind:this={settingsTrigger} class="btn-icon" aria-label="Open settings" onclick={onOpenSettings}><Settings size={16} /></button>
	</div>
</header>
