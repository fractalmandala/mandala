<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="176" cy="48" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M160,168a56,56,0,1,1-56-56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M48,100.11a88,88,0,0,1,104-5.88L128,136h72l-16,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="176" cy="48" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M160,168a56,56,0,1,1-56-56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M48,100.11a88,88,0,0,1,104-5.88L128,136h72l-16,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M144,48a32,32,0,1,1,32,32A32,32,0,0,1,144,48Zm16,112a8,8,0,0,0-8,8,48,48,0,1,1-48-48,8,8,0,0,0,0-16,64,64,0,1,0,64,64A8,8,0,0,0,160,160Zm40-32H141.82l17.12-29.78a8,8,0,0,0-2.57-10.69A96,96,0,0,0,42.91,94a8,8,0,1,0,10.18,12.33,80.09,80.09,0,0,1,88-9.17L121.06,132A8,8,0,0,0,128,144h62.24l-14.08,70.43a8,8,0,0,0,6.27,9.41A7.77,7.77,0,0,0,184,224a8,8,0,0,0,7.83-6.43l16-80A8,8,0,0,0,200,128Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
