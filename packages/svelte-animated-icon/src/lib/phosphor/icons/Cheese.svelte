<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M24,160h7.46c13.45,0,24.79-11,24.54-24.46A24,24,0,0,0,32,112H24V88H232v96a8,8,0,0,1-8,8H24Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M24,88,184,40a48,48,0,0,1,48,48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M80,192v-8a32,32,0,0,1,64,0v8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M195.72,88a32,32,0,1,1-55.44,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M24,160h7.46c13.45,0,24.79-11,24.54-24.46A24,24,0,0,0,32,112H24V88H232v96a8,8,0,0,1-8,8H24Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M24,88,184,40a48,48,0,0,1,48,48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M80,192v-8a32,32,0,0,1,64,0v8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M195.72,88a32,32,0,1,1-55.44,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M184,32a7.81,7.81,0,0,0-2.3.34l-160,48h0A8,8,0,0,0,16,88v16a8,8,0,0,0,8,8h7.46c13.45,0,24.79,11,24.54,24.46A24,24,0,0,1,32,160H24a8,8,0,0,0-8,8v24a8,8,0,0,0,8,8H224a16,16,0,0,0,16-16V88A56.06,56.06,0,0,0,184,32ZM80,184a32,32,0,0,1,64,0Zm88-48a32,32,0,0,1-31-40h62a32,32,0,0,1-31,40ZM78.51,80,185.12,48a40.06,40.06,0,0,1,38.07,32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
