<script lang="ts">
	import PageHeaderArea from './PageHeaderArea.svelte';

	interface Props {
		breadcrumbs?: string;
		title?: string;
		tag?: string;
		description?: string;
	}

	let {
		breadcrumbs = 'HOME / DOCS',
		title = 'Page Title',
		tag = 'ECC Skills',
		description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
	}: Props = $props();
</script>

<header>
	<div class="breadcrumbs">{breadcrumbs}</div>
	<PageHeaderArea {title} {tag} {description} />
</header>

<style>
	header {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		padding-bottom: 16px;
		border-bottom: 1px solid #e7e7e7;
	}
	.breadcrumbs {
		color: #a1a1a1;
		font-family: Geist, 'Google Sans Flex', system-ui, sans-serif;
		font-size: 10px;
		line-height: 14px;
	}
</style>
