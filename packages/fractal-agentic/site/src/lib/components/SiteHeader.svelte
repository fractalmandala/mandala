<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import { RiGithubFill } from 'svelte-remixicon';

	interface Props {
		statsLabel?: string;
	}

	let { statsLabel = '' }: Props = $props();

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
		if (href === '/docs/bosses') return path.startsWith('/docs/bosses') || path === '/bosses';
		if (href === '/docs/wiki') return path.startsWith('/docs/wiki');
		return path === href || path.startsWith(`${href}/`);
	}
</script>

<div class="row xbetween ycenter w100 padleft32 padright32">
	<div class="row ycenter gap16">
		<a class="blank gap0 row ycenter gap8" href="/">
			<img class="sz36 site-logo" src="/images/fractalagentic.png" alt="logo" />
			<p class="bold text-lg lstightx">fractal<span class="accented">agentic</span></p>
		</a>
		{#if statsLabel}
			<span class="text-xs muted">{statsLabel}</span>
		{/if}
	</div>
	<nav class="row gap32 ycenter" aria-label="Primary">
		{#each links as link (link.href)}
			<a class="nav-link" href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>
				{link.label}
			</a>
		{/each}
		<div class="row gap16 ycenter">
			<a
				class="btn-icon"
				href="https://github.com/fractalmandala/fractal-agentic"
				rel="noopener noreferrer"
				target="_blank"
			>
				<RiGithubFill size={'20'} />
			</a>
			<ThemeToggle />
		</div>
	</nav>
</div>
