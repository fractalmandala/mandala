<script lang="ts">
	import Magnetic from './magnetic.svelte';
	import Button from './button.svelte';
	import type { MagneticButtonProps } from './button.types.js';

	let { strength = 0.25, magneticClass, children, ...rest }: MagneticButtonProps = $props();
</script>

<Magnetic {strength} class={magneticClass}>
	<Button {...rest}>{@render children?.()}</Button>
</Magnetic>
