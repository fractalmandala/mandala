<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import SidebarLeft from '$lib/components/layout/sidebar-left.svelte';
	import SidebarRight from '$lib/components/layout/sidebar-right.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { docsConfig } from '$lib/docs/config.js';
	import type { SocialLink } from '$lib/components/nav/social-links.svelte';

	let { children, data } = $props();

	const socialLinks: SocialLink[] = [];
	if (docsConfig.site.social?.github) {
		socialLinks.push({
			platform: 'github',
			url: docsConfig.site.social.github,
			label: 'GitHub'
		});
	}
	if (docsConfig.site.social?.twitter) {
		socialLinks.push({
			platform: 'twitter',
			url: docsConfig.site.social.twitter,
			label: 'Twitter'
		});
	}
	if (docsConfig.site.social?.discord) {
		socialLinks.push({
			platform: 'discord',
			url: docsConfig.site.social.discord,
			label: 'Discord'
		});
	}
</script>

<a class="docs-skip" href="#doc-content">Skip to content</a>

<div class="docs-shell">
	<Sidebar.Provider>
		<SidebarLeft navigation={data.navigation} {socialLinks} />
		<Sidebar.Inset class="docs-main">
			<div class="docs-header">
				<Header {socialLinks} />
			</div>
			<div class="docs-content-wrap">
				{@render children()}
			</div>
		</Sidebar.Inset>
		<SidebarRight navigation={data.navigation} />
	</Sidebar.Provider>
</div>
