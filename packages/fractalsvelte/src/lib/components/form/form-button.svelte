<script lang="ts" module>
	import { type ButtonProps } from '$lib/components/button/index.js';
</script>

<script lang="ts">
	import { Button } from '$lib/components/button/index.js';

	let { ref = $bindable(null), type = 'submit', ...restProps }: ButtonProps = $props();
</script>

<Button bind:ref {type} {...restProps} />
