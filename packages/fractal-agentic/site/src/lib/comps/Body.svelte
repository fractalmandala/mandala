<script lang="ts">
	import ButtonAccent from './ButtonAccent.svelte';
	import ButtonPlain from './ButtonPlain.svelte';

	interface Props {
		paragraphs?: string[];
	}

	let {
		paragraphs = [
			'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
		]
	}: Props = $props();
</script>

<section class="body">
	{#each paragraphs as paragraph}<p>{paragraph}</p>{/each}
	<div class="buttons"><ButtonAccent /><ButtonPlain /></div>
</section>

<style>
	.body {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
	}
	p {
		margin: 0;
		color: #000;
		font-size: 15px;
		letter-spacing: -0.3px;
		line-height: 24px;
	}
	.buttons {
		display: flex;
		align-items: center;
		gap: 16px;
	}
</style>
