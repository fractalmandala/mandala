<script lang="ts">
	import type { NavigationLink } from '../types';
	import AppLogo from './AppLogo.svelte';
	import Nav from './Nav.svelte';

	interface Props {
		links?: NavigationLink[];
	}
	let { links }: Props = $props();
</script>

<header>
<a class="logo" href="/">
	<img src="/images/fractalagentic.png" alt="" />
	<span>fractalagentic</span>
</a>
	<Nav {links} />
</header>

<style>
	header {
		display: flex;
		position: relative;
		z-index: 10;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 56px;
		padding: 8px 32px;
		border-bottom: 1px solid var(--shell-border);
		background: #fff;
	}
	@media (max-width: 640px) {
		header {
			padding-inline: 16px;
		}
	}
	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #000;
		text-decoration: none;
	}
	img {
		width: 32px;
		height: 32px;
		object-fit: cover;
	}
</style>
