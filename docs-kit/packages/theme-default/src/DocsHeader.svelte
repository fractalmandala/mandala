<script lang="ts">
	import type { DocsNavigationNode } from '@docs-kit/core';
	import type { Snippet } from 'svelte';

	import LocaleSwitcher from './LocaleSwitcher.svelte';
	import MobileNav from './MobileNav.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import VersionSwitcher from './VersionSwitcher.svelte';

	import type { DocsLocaleSwitcherItem, DocsVersionSwitcherItem } from '@docs-kit/core';

	let {
		title,
		basePath = '/docs',
		navigation = [],
		pathname = '',
		actions,
		search,
		versions = [],
		locales = []
	}: {
		title: string;
		basePath?: string;
		navigation?: DocsNavigationNode[];
		pathname?: string;
		actions?: Snippet | undefined;
		/** Search trigger, rendered before the colour-scheme control. */
		search?: Snippet | undefined;
		/** Version switcher entries; the control appears only when there are several. */
		versions?: DocsVersionSwitcherItem[];
		/** Locale switcher entries; the control appears only when there are several. */
		locales?: DocsLocaleSwitcherItem[];
	} = $props();
</script>

<header class="docs-header">
	<MobileNav {navigation} {pathname} />
	<a class="docs-header__title" href={basePath}>{title}</a>
	<div class="docs-header__spacer"></div>
	{#if search}{@render search()}{/if}
	<VersionSwitcher items={versions} />
	<LocaleSwitcher items={locales} />
	{#if actions}{@render actions()}{/if}
	<ThemeToggle />
</header>
