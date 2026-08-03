<script lang="ts">
	import { onMount } from 'svelte';
	import {
		applyTheme,
		getDocumentTheme,
		getStoredTheme,
		resolveTheme,
		toggleTheme,
		type Theme
	} from '$lib/theme';
	import { RiSunFill, RiMoonFill } from 'svelte-remixicon'

	let theme = $state<Theme>('dark');

	onMount(() => {
		theme = resolveTheme(getStoredTheme());
		applyTheme(theme);

		const media = window.matchMedia('(prefers-color-scheme: light)');
		const onSystemChange = () => {
			// Only follow system when the user has not pinned a preference.
			if (getStoredTheme() !== null) return;
			theme = resolveTheme(null);
			applyTheme(theme);
		};
		media.addEventListener('change', onSystemChange);
		return () => media.removeEventListener('change', onSystemChange);
	});

	function onToggle() {
		theme = toggleTheme(getDocumentTheme());
	}

	const label = $derived(
		theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
	);
</script>

<button
	type="button"
	class="btn-icon"
	onclick={onToggle}
	aria-label={label}
	title={label}
>
	{#if theme === 'dark'}
		<RiSunFill size={"20"}/>
			{:else}
		<RiMoonFill size={"20"}/>
		{/if}
</button>
