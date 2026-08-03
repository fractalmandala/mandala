<script lang="ts">
	import type { NavigationLink, OutlineLink, SidebarGroup } from '../types';
	import AppHeader from './AppHeader.svelte';
	import AppRight from './AppRight.svelte';
	import AppSidebar from './AppSidebar.svelte';
	import Article from './Article.svelte';

	interface Props {
		headerLinks?: NavigationLink[];
		sidebarGroups?: SidebarGroup[];
		outlineLinks?: OutlineLink[];
		title?: string;
	}

	let { sidebarGroups, outlineLinks, title = 'Page Title' }: Props = $props();
</script>

<div class="appshell">
	<AppHeader/>
	<div class="content">
		<AppSidebar groups={sidebarGroups} />
		<main><Article {title} /></main>
		<AppRight links={outlineLinks} />
	</div>
</div>

<style>
	.appshell {
		width: 100%;
		height: 100dvh;
		min-height: 720px;
		overflow: hidden;
		color: var(--shell-text);
		background: #fff;
	}
	.content {
		display: flex;
		align-items: stretch;
		justify-content: center;
		width: 100%;
		height: calc(100% - 56px);
		border-bottom: 1px solid var(--shell-border);
		overflow: hidden;
	}
	main {
		display: flex;
		flex: 1 1 auto;
		min-width: 0;
		justify-content: center;
		overflow: hidden;
	}
</style>
