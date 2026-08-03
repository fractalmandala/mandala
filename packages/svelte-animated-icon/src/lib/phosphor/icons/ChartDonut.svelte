<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="128" y1="168" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M44.85,80A96,96,0,1,0,128,32V88a40,40,0,1,1-34.65,20Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="89.35" y1="138.36" x2="35.25" y2="152.85" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="128" y1="168" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M44.85,80A96,96,0,1,0,128,32V88a40,40,0,1,1-34.65,20Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="89.35" y1="138.36" x2="35.25" y2="152.85" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M120,161.94v65.34a4,4,0,0,1-4.46,4,104.28,104.28,0,0,1-84-64.5,4,4,0,0,1,2.69-5.34L97.32,144.5a4,4,0,0,1,4.35,1.66,32.25,32.25,0,0,0,15.59,12A4,4,0,0,1,120,161.94ZM128.06,24A8,8,0,0,0,120,32V88a7.94,7.94,0,0,0,7.87,8,32,32,0,0,1,10.86,62.15,4,4,0,0,0-2.73,3.79v65.34a4,4,0,0,0,4.45,4A104,104,0,0,0,128.06,24Zm-32,101.49a32,32,0,0,1,4.15-13.42l0-.07a8,8,0,0,0-.57-8.87A8.36,8.36,0,0,0,97.18,101L48.85,73.06A8,8,0,0,0,37.92,76,104.12,104.12,0,0,0,25,142.68,4,4,0,0,0,30,146L93.22,129A3.94,3.94,0,0,0,96.1,125.49Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
