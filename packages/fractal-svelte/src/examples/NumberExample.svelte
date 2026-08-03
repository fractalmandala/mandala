<script lang="ts">
	import { Number as AnimatedNumber } from '$lib/components/motion/number/index.js';
	let value = $state(1240);
	function increment() {
		value += 125;
	}
</script>

<div class="fixture-preview">
	<strong
		><AnimatedNumber {value} prefix="$" format={(amount) => amount.toLocaleString()} /></strong
	>
	<button type="button" onclick={increment}>Add revenue</button>
</div>
