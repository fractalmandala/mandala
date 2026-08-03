<script lang="ts" module>
	import type { StreamdownProps } from 'streamdown-svelte';

	export type ResponseProps = StreamdownProps;
</script>

<script lang="ts">
	import { Streamdown } from 'streamdown-svelte';
	import { mode } from 'mode-watcher';
	import githubDarkDefault from '@shikijs/themes/github-dark-default';
	import githubLightDefault from '@shikijs/themes/github-light-default';

	let { content, ...restProps }: ResponseProps = $props();

	const currentTheme = $derived(
		mode.current === 'dark' ? 'github-dark-default' : 'github-light-default'
	);
</script>

<div data-slot="ai-response">
	<Streamdown
		{content}
		baseTheme="shadcn"
		shikiTheme={currentTheme}
		shikiThemes={{
			'github-light-default': githubLightDefault,
			'github-dark-default': githubDarkDefault
		}}
		{...restProps}
	/>
</div>
