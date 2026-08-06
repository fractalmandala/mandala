<script lang="ts">
	import { page } from '$app/state';

	export type SidebarItem = { slug: string; title: string; href: string };
	export type SidebarSection = { key: string; title: string; items: SidebarItem[] };

	let {
		sections,
		onNavigate
	}: { sections: SidebarSection[]; onNavigate?: () => void } = $props();

	const currentPath = $derived(page.url.pathname.replace(/\/$/, '') || '/');
	const activeSection = $derived(
		sections.find((section) => section.items.some((item) => currentPath === item.href))?.key
	);
	// `openSection` is the single source of truth for which accordion is expanded.
	// It follows the active section on navigation, but an explicit toggle wins —
	// closing sets it to a definite `null` so it can't fall back to `activeSection`
	// and immediately re-open the section that owns the current page.
	let openSection = $state<string | null | undefined>();
	$effect(() => {
		// Re-sync whenever the route (and thus the active section) changes.
		openSection = activeSection;
	});

	function toggleSection(key: string, event: MouseEvent) {
		event.preventDefault();
		openSection = openSection === key ? null : key;
	}
</script>

{#each sections as section (section.key)}
	<details open={openSection === section.key}>
		<summary onclick={(event) => toggleSection(section.key, event)}>{section.title}</summary>
		<div class="sidebar-items">
			{#each section.items as item (item.slug)}
				<a
					href={item.href}
					aria-current={currentPath === item.href ? 'page' : undefined}
					onclick={onNavigate}
				>
					{item.title}
				</a>
			{/each}
		</div>
	</details>
{/each}

<style>
	details {
		margin: 0 0 0.35rem;
		border-bottom: 1px solid var(--line);
		padding-bottom: 0.35rem;
	}

	summary {
		padding: 0.55rem 0.5rem;
		color: var(--text);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary::after {
		float: right;
		content: '+';
		color: var(--text-dim);
	}

	details[open] summary::after {
		content: '−';
	}

	.sidebar-items {
		display: grid;
		gap: 0.1rem;
		padding: 0 0 0.35rem 0.45rem;
	}

	a {
		display: block;
		padding: 0.38rem 0.55rem;
		border-radius: 0.35rem;
		color: var(--text-soft);
		font-size: 0.84rem;
		text-decoration: none;
	}

	a:hover,
	a[aria-current='page'] {
		background: var(--bg-soft);
		color: var(--accent-strong);
	}
</style>
