<script lang="ts">
	import { aiWorkspace } from '../state/ai.svelte';
	import Sidebar from '$lib/modules/ide/components/Sidebar.svelte';
	import Terminal from '$lib/modules/ide/components/Terminal.svelte';
	import BrowserLauncherCard from '$lib/modules/browser/components/BrowserLauncherCard.svelte';
	import type { AiWorkTab } from '../types';
</script>

<div class="sidebar-content">
	<!-- Tab bar -->
	<div class="sidebar-tabs">
		{#each ['files', 'terminal', 'browser'] as tab (tab)}
			<button
				type="button"
				class="sidebar-tab-btn"
				class:active={aiWorkspace.workTab === tab}
				onclick={() => aiWorkspace.setWorkTab(tab as AiWorkTab)}
			>
				{tab.charAt(0).toUpperCase() + tab.slice(1)}
			</button>
		{/each}
	</div>

	<!-- Content area — mounts the active tab component -->
	<!-- ai→ide module edge: WorkPanel imports ide Sidebar/Terminal and core Browser (see ADR-024) -->
	<div class="sidebar-content-box">
		{#if aiWorkspace.workTab === 'files'}
			<Sidebar side="sidebar1" />
		{:else if aiWorkspace.workTab === 'terminal'}
			<Terminal />
		{:else if aiWorkspace.workTab === 'browser'}
			<BrowserLauncherCard />
		{/if}
	</div>
</div>
