<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M144,88h40a8,8,0,0,1,8,8v72a56,56,0,0,1-56,56h0a56,56,0,0,1-53.68-40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="104" x2="72" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="88" y1="152" x2="88" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M184,88h35.26A4.74,4.74,0,0,1,224,92.74V152a32,32,0,0,1-32,32h0c-.77,0-1.54,0-2.3-.08" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M108.28,72A32,32,0,1,1,144,87" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M166.79,47.27A24,24,0,1,1,184,88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M144,88h40a8,8,0,0,1,8,8v72a56,56,0,0,1-56,56h0a56,56,0,0,1-53.68-40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="104" y1="104" x2="72" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="88" y1="152" x2="88" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M184,88h35.26A4.74,4.74,0,0,1,224,92.74V152a32,32,0,0,1-32,32h0c-.77,0-1.54,0-2.3-.08" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M108.28,72A32,32,0,1,1,144,87" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M166.79,47.27A24,24,0,1,1,184,88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M219.26,80h-7.57A31.71,31.71,0,0,0,216,64a32,32,0,0,0-45.88-28.85A40,40,0,0,0,96.81,64H40A16,16,0,0,0,24,80v96a16,16,0,0,0,16,16H76.67a64,64,0,0,0,118.7-.15A40,40,0,0,0,232,152V92.74A12.76,12.76,0,0,0,219.26,80ZM136,32a24,24,0,0,1,15.07,42.68A16,16,0,0,0,136,64H113.38A24,24,0,0,1,136,32ZM88,160a8,8,0,0,1-8-8V112H72a8,8,0,0,1,0-16h32a8,8,0,0,1,0,16H96v40A8,8,0,0,1,88,160Zm96,8a48,48,0,0,1-89.56,24H136a16,16,0,0,0,16-16V96h32Zm0-88H168a39.89,39.89,0,0,0,7.6-29.6A16,16,0,1,1,184,80Zm32,72a24,24,0,0,1-16.36,22.75A62.76,62.76,0,0,0,200,168V96h16Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
