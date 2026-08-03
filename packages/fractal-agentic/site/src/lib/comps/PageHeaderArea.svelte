<script lang="ts">
	import Box from './Box.svelte';
	import IconTextButton from './IconTextButton.svelte';
	import Row from './Row.svelte';

	interface Props {
		title?: string;
		tag?: string;
		description?: string;
	}

	let {
		title = 'Page Title',
		tag = 'ECC Skills',
		description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
	}: Props = $props();
</script>

<div class="page-header-area">
	<div class="headline">
		<Box>
			<Row>
				<h1>{title}</h1>
				<IconTextButton label={tag} icon="arrow" reverse accent />
			</Row>
			<p>{description}</p>
		</Box>
	</div>
	<div class="actions">
		<IconTextButton label="" icon="github" /><IconTextButton label="" icon="share" />
	</div>
</div>

<style>
	.page-header-area {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 108px;
	}
	.headline {
		display: flex;
		width: 100%;
		min-height: 78px;
	}
	.headline :global(.box) {
		flex: 1 1 auto;
	}
	h1 {
		margin: 0;
		color: #000;
		font-size: 36px;
		font-weight: 600;
		letter-spacing: -1.31px;
		line-height: 43px;
	}
	p {
		width: min(432px, 100%);
		margin: 0;
		color: var(--shell-subtle);
		font-size: 11px;
		letter-spacing: -0.1px;
		line-height: 15px;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 16px;
	}
	@media (max-width: 600px) {
		h1 {
			font-size: 30px;
			line-height: 38px;
		}
	}
</style>
