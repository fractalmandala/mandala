<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><ellipse cx="168" cy="128" rx="16" ry="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><ellipse cx="164" cy="128" rx="52" ry="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M232,224H92c-28.72,0-52-43-52-96S63.28,32,92,32h72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="40.38 116.3 80 88 112.77 111.41" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="46.85 175.68 80 152 120.65 181.03" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><ellipse cx="168" cy="128" rx="16" ry="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><ellipse cx="164" cy="128" rx="52" ry="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M232,224H92c-28.72,0-52-43-52-96S63.28,32,92,32h72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="40.38 116.3 80 88 112.77 111.41" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="46.85 175.68 80 152 120.65 181.03" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M184,128c0,22.09-7.16,40-16,40s-16-17.91-16-40,7.16-40,16-40S184,105.91,184,128Zm56,96a8,8,0,0,1-8,8H92c-33.64,0-60-45.68-60-104S58.36,24,92,24h72c33.64,0,60,45.68,60,104,0,37.47-10.88,69.73-27.59,88H232A8,8,0,0,1,240,224ZM57.87,111.81a7.93,7.93,0,0,0,4.64-1.49L80,97.83l13.28,9.49a8,8,0,0,0,9.3-13L84.65,81.49a8,8,0,0,0-9.3,0L53.21,97.3a8,8,0,0,0,4.66,14.51Zm46.67,47.89L84.65,145.49a8,8,0,0,0-9.3,0L56,159.29a8,8,0,1,0,9.3,13L80,161.83l15.24,10.88a8,8,0,1,0,9.3-13Zm89.2,32.37c9.19-17,14.26-39.74,14.26-64.07s-5.07-47.09-14.26-64.07C185.38,48.5,174.82,40,164,40s-21.38,8.5-29.74,23.93C125.07,80.91,120,103.67,120,128s5.07,47.09,14.26,64.07C142.62,207.5,153.18,216,164,216S185.38,207.5,193.74,192.07Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
