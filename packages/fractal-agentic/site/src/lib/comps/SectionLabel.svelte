<script lang="ts">
	interface Props {
		label?: string;
	}

	let { label = 'GROUP 1 LABEL' }: Props = $props();
</script>

<div class="section-label">{label}</div>

<style>
	.section-label {
		width: 100%;
		padding-left: 6px;
		color: var(--shell-muted);
		font-size: 10px;
		font-weight: 500;
		line-height: 13px;
	}
</style>
