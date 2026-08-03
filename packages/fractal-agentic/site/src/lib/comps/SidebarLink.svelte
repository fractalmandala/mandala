<script lang="ts">
	interface Props {
		label?: string;
		href?: string;
		active?: boolean;
	}

	let { label = 'Header 1', href = '#', active = false }: Props = $props();
</script>

<a class:active {href}>{label}</a>

<style>
	a {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 24px;
		color: #1d1d1d;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: -0.14px;
		line-height: 19px;
		text-decoration: none;
	}
	a:hover,
	a.active {
		color: var(--shell-accent);
	}
</style>
