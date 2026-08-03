<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/docs/guide', label: 'Docs' },
		{ href: '/docs/bosses', label: 'Bosses' },
		{ href: '/skills', label: 'Skills' },
		{ href: '/agents', label: 'Agents' },
		{ href: '/commands', label: 'Commands' },
		{ href: '/docs/wiki', label: 'Wiki' }
	] as const;

	function isCurrent(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/docs/guide') return path === '/' || path.startsWith('/docs');
		return path === href || path.startsWith(`${href}/`);
	}
</script>

<nav class="mobile-nav" aria-label="Mobile primary">
	{#each links as link (link.href)}
		<a
			class="mobile-nav__link"
			href={link.href}
			aria-current={isCurrent(link.href) ? 'page' : undefined}
		>
			{link.label}
		</a>
	{/each}
</nav>
