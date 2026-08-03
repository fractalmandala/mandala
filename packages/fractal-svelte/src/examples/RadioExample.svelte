<script lang="ts">
	import { RadioGroup } from '$lib/components/motion/radio/index.js';
	const items = [
		{ value: 'daily', label: 'Daily digest' },
		{ value: 'weekly', label: 'Weekly digest' },
		{ value: 'never', label: 'No email' }
	];
	let value = $state('daily');
</script>

<div class="fixture-preview">
	<RadioGroup {items} bind:value name="digest-frequency" />
	<p>Preference: {value}</p>
</div>
