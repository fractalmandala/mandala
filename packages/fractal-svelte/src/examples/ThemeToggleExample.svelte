<script lang="ts">
	import { ThemeToggle } from '$lib/components/blocks/theme-toggle/index.js';
	let theme = $state<'light' | 'dark'>('light');
</script>

<div class="fixture-preview">
	<ThemeToggle bind:theme variant="circle-blur" start="center" />
	<p>Preview theme: {theme}</p>
</div>
