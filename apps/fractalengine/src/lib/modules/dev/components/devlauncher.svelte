<script lang="ts">

	import { appState } from '$lib/state/app.svelte';
	import { dev } from '$lib/modules/dev/state/dev.svelte'
	import { layout } from '$lib/state/layoutstate.svelte'
	import SidebarL from '$lib/icons/sidebarL.svelte'
	import SidebarR from '$lib/icons/sidebarR.svelte'

</script>

<div class="row ycenter gap8" style="color: var(--text-secondary)">
	{#if appState.activeTemplateId === 'design'}
	<button class="btn-icon" onclick={() => layout.toggleSidebar1()}>
		<SidebarL collapsed={layout.sidebar1Collapsed}/>
	</button>
	<button class="btn-icon" onclick={() => layout.toggleSidebar2()}>
		<SidebarR collapsed={layout.sidebar2Collapsed}/>
	</button>
	{:else if appState.activeTemplateId === 'dev'}
	<button class="btn-icon" onclick={() => dev.toggleSidebar1()}>
		<SidebarL collapsed={dev.sidebar1Collapsed}/>
	</button>
	<button class="btn-icon" onclick={() => dev.toggleSidebar2()}>
		<SidebarR collapsed={dev.sidebar2Collapsed}/>
	</button>
	{:else if appState.activeTemplateId === 'tester'}
		<button class="btn-icon" onclick={() => layout.toggleSidebar1()}>
		<SidebarL collapsed={layout.sidebar1Collapsed}/>
	</button>
	<button class="btn-icon" onclick={() => layout.toggleSidebar2()}>
		<SidebarR collapsed={layout.sidebar2Collapsed}/>
	</button>
	{/if}
</div>
