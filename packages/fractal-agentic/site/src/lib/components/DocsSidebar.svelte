<script lang="ts">
	import { page } from '$app/state';
	import type { NavSection } from '$lib/content';

	interface Props {
		sections: NavSection[];
		statsLabel?: string;
	}

	let { sections,  statsLabel = '' }: Props = $props();

	function isActive(href: string): boolean {
		const path = page.url.pathname.replace(/\/$/, '') || '/';
		const target = href.replace(/\/$/, '') || '/';
		return path === target;
	}

	function isSectionActive(section: NavSection): boolean {
		return section.items.some((item) => isActive(item.href));
	}
</script>

<nav class="sidebar-content box gap32" aria-label="Guide sections">
	{#each sections as section (section.title)}
		<div class="box gap16">
			<span class="text-xs tt-u muted">{section.title}</span>
			<div class="box section-list gap0">
				{#each section.items as item (item.href)}
					<a
						class="section-list-item"
						href={item.href}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
			</div>
		</div>
	{/each}
</nav>
