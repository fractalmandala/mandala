<script lang="ts">
	import { Tabs } from '$lib/components/motion/tabs/index.js';
	const items = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'settings', label: 'Settings' }
	];
	let activeId = $state('overview');
</script>

<div class="fixture-preview"><Tabs tabs={items} bind:activeId variant="segment" /></div>
