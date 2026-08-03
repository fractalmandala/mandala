<script lang="ts">
	import { page } from '$app/state';
	import type { NavSection } from '$lib/content';

	interface Props {
		sections: NavSection[];
	}

	let { sections }: Props = $props();

	function isActive(href: string): boolean {
		const path = page.url.pathname.replace(/\/$/, '') || '/';
		const target = href.replace(/\/$/, '') || '/';
		return path === target;
	}
</script>

<nav aria-label="Guide sections">
	{#each sections as section (section.title)}
		<section>
			<div class="section-label">{section.title}</div>
			<div class="sidebar-links">
				{#each section.items as item (item.href)}
					<a
						class:active={isActive(item.href)}
						href={item.href}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
			</div>
		</section>
	{/each}
</nav>
