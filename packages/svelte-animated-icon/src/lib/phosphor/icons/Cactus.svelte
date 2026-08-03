<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="40" y1="216" x2="216" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M96,216V136H84A60,60,0,0,1,24,76h0A20,20,0,0,1,44,56h0A20,20,0,0,1,64,76h0A20,20,0,0,0,84,96H96V56a32,32,0,0,1,32-32h0a32,32,0,0,1,32,32v80h12a20,20,0,0,0,20-20h0a20,20,0,0,1,20-20h0a20,20,0,0,1,20,20h0a60,60,0,0,1-60,60H160v40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="40" y1="216" x2="216" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M96,216V136H84A60,60,0,0,1,24,76h0A20,20,0,0,1,44,56h0A20,20,0,0,1,64,76h0A20,20,0,0,0,84,96H96V56a32,32,0,0,1,32-32h0a32,32,0,0,1,32,32v80h12a20,20,0,0,0,20-20h0a20,20,0,0,1,20-20h0a20,20,0,0,1,20,20h0a60,60,0,0,1-60,60H160v40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M224,216a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H88V136H80A64.07,64.07,0,0,1,16,72,24.07,24.07,0,0,1,40.08,48h.4A23.55,23.55,0,0,1,64,71.52V72h0A16,16,0,0,0,80,88h8V56a40,40,0,0,1,80,0v72h8a16,16,0,0,0,16-16h0v-.48A23.55,23.55,0,0,1,215.52,88h.4A24.07,24.07,0,0,1,240,112a64.07,64.07,0,0,1-64,64h-8v32h48A8,8,0,0,1,224,216Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
