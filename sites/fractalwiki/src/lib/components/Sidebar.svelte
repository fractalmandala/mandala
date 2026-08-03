<script lang="ts">
	import type { VaultNavGroup } from '$lib/server/vault';
	import { page } from '$app/stores';

	let { navGroups, isOpen = $bindable(true) }: { navGroups: VaultNavGroup[]; isOpen?: boolean } = $props();

	// Manage open state of groups
	let openGroupIds = $state<Record<string, boolean>>({
		'civilization-history': true,
		'philosophy-thought': true,
		'tech-engineering': true,
		'wiki-ai': true
	});

	function toggleGroup(id: string) {
		openGroupIds[id] = !openGroupIds[id];
	}

	function isActive(slug: string): boolean {
		const currentPath = $page.url.pathname;
		return currentPath === `/${slug}` || currentPath === `/${slug}/`;
	}
</script>

<aside class="sidebar pad16 {isOpen ? 'is-open' : 'is-closed'}">
	<div class="sidebar-header row xbetween ycenter padbot16 marginbot16 bdr-bottom">
		<a href="/" class="row ycenter gap8 text-bold">
			<span class="logo-badge box pad4 text-xs radius4">FW</span>
			<span class="site-name">Fractalwiki</span>
		</a>
		<button class="mobile-close btn-icon pad4" onclick={() => (isOpen = false)} aria-label="Close menu">
			✕
		</button>
	</div>

	<nav class="sidebar-nav flex-col gap16">
		{#each navGroups as group (group.id)}
			<div class="nav-group flex-col gap4">
				<button
					class="group-header row xbetween ycenter pad8 radius4 text-sm text-secondary hover-bg"
					onclick={() => toggleGroup(group.id)}
				>
					<span class="row ycenter gap8 text-uppercase text-xs tracking-wider text-bold">
						{group.title}
					</span>
					<span class="chevron text-xs">{openGroupIds[group.id] ? '▼' : '▶'}</span>
				</button>

				{#if openGroupIds[group.id]}
					<div class="group-content flex-col gap12 padleft8">
						{#each group.sections as section (section.id)}
							<div class="nav-section flex-col gap4">
								<div class="section-title text-xs text-tertiary padleft8 padtop4">
									{section.title}
								</div>

								<div class="section-items flex-col gap2">
									{#each section.items as item (item.slug)}
										<a
											href="/{item.slug}"
											class="nav-link row ycenter gap8 pad6 padleft12 radius4 text-sm {isActive(item.slug) ? 'active' : ''}"
										>
											<span class="item-title truncate">{item.title}</span>
										</a>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</nav>
</aside>


