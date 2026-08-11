<script lang="ts">
	import { page } from '$app/state';
	import { DEFAULT_NAV, isPathActive } from './Navigation';
	import ThemeToggle from '$lib/components/ThemeToggle/ThemeToggle.svelte';
	import './Navigation.sass';

	const appName = '{{AppName}}';
	let mobileOpen = $state(false);

	const currentPath = $derived(page.url.pathname);
</script>

<nav class="nav" aria-label="Primary">
	<div class="nav-inner">
		<a href="/" class="nav-brand" onclick={() => (mobileOpen = false)}>
			<span class="nav-brand-mark">{appName.charAt(0)}</span>
			<span class="nav-brand-text">{appName}</span>
		</a>

		<div class="nav-links">
			{#each DEFAULT_NAV as item (item.href)}
				<a
					href={item.href}
					class="nav-link"
					class:nav-link-active={isPathActive(currentPath, item.href)}
				>
					{item.label}
				</a>
			{/each}
		</div>

		<div class="nav-actions">
			<ThemeToggle />
			<button
				type="button"
				class="nav-menu-btn"
				aria-expanded={mobileOpen}
				aria-label="Toggle menu"
				onclick={() => (mobileOpen = !mobileOpen)}
			>
				<svg
					aria-hidden="true"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				>
					{#if mobileOpen}
						<path d="M6 6l12 12M6 18L18 6" />
					{:else}
						<path d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<div class="nav-mobile">
			{#each DEFAULT_NAV as item (item.href)}
				<a
					href={item.href}
					class="nav-mobile-link"
					class:nav-link-active={isPathActive(currentPath, item.href)}
					onclick={() => (mobileOpen = false)}
				>
					{item.label}
				</a>
			{/each}
		</div>
	{/if}
</nav>
