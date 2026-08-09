<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';

	let {
		tone = 'info',
		label,
	}: {
		tone?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
		label: string;
	} = $props();

	const icon = $derived(
		tone === 'success'
			? 'check-circle'
			: tone === 'warning' || tone === 'error'
				? 'alert-triangle'
				: 'info',
	);
</script>

<span class="status-badge" data-tone={tone}>
	<Icon name={icon} size={12} />
	<span>{label}</span>
</span>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.status-badge
		display: inline-flex
		align-items: center
		gap: 4px
		border-radius: t.$radius-pill
		padding: 2px 8px
		font-size: t.$font-size-xs
		font-weight: 700
		line-height: 1.4
		border: 1px solid var(--ok-line)
		background: var(--ok-panel)
		color: var(--ok-muted)

		&[data-tone='success']
			color: var(--ok-success)
			border-color: var(--ok-success)
			background: var(--ok-diff-added)

		&[data-tone='warning']
			color: var(--ok-warn)
			border-color: var(--ok-warn)
			background: var(--ok-diff-modified)

		&[data-tone='error']
			color: var(--ok-danger)
			border-color: var(--ok-danger)
			background: var(--ok-diff-removed)

		&[data-tone='info']
			color: var(--ok-accent)
			border-color: var(--ok-accent)
			background: var(--ok-highlight)
</style>
