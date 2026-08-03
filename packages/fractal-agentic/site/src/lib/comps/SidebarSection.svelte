<script lang="ts">
	import type { SidebarEntry } from '../types';
	import SectionLabel from './SectionLabel.svelte';
	import SidebarLinks from './SidebarLinks.svelte';

	interface Props {
		label?: string;
		items?: SidebarEntry[];
	}

	let { label = 'GROUP 1 LABEL', items }: Props = $props();
</script>

<section>
	<div class="section-label">{label}</div>
<div class="sidebar-links">
	{#each items as item}
	<a href="/">{label}</a>
	{/each}
</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}
</style>
