<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M152,184c-7.6-5.05-14.19-8-24-8s-16.4,2.95-24,8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M216,48a8,8,0,0,0-10.89-7.47C190,46.41,160.89,55.71,128,55.71s-62-9.3-77.11-15.16A8,8,0,0,0,40,48v55.77C40,174.6,79.4,232,128,232s88-57.4,88-128.21Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M144,120c4.39,4.91,12.89,8,20,8s15.61-3.09,20-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M72,120c4.39,4.91,12.89,8,20,8s15.61-3.09,20-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M152,184c-7.6-5.05-14.19-8-24-8s-16.4,2.95-24,8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M144,120c4.39,4.91,12.89,8,20,8s15.61-3.09,20-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M216,48a8,8,0,0,0-10.89-7.47C190,46.41,160.89,55.71,128,55.71s-62-9.3-77.11-15.16A8,8,0,0,0,40,48v55.77C40,174.6,79.4,232,128,232s88-57.4,88-128.21Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M72,120c4.39,4.91,12.89,8,20,8s15.61-3.09,20-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M217,34.8a15.94,15.94,0,0,0-14.82-1.71C188.15,38.55,159.82,47.71,128,47.71S67.84,38.55,53.79,33.09A16,16,0,0,0,32,48v55.77c0,35.84,9.65,69.65,27.18,95.18,18.16,26.46,42.6,41,68.82,41s50.66-14.57,68.82-41C214.35,173.44,224,139.63,224,103.79V48A16,16,0,0,0,217,34.8ZM66,125.33A8,8,0,0,1,78,114.66c2.68,3,8.85,5.34,14,5.34s11.36-2.35,14-5.34A8,8,0,0,1,118,125.33C112.25,131.71,101.82,136,92,136S71.75,131.71,66,125.33Zm92.62,63.1A8,8,0,0,1,152,192a7.92,7.92,0,0,1-4.42-1.34C141.07,186.34,136,184,128,184s-13.07,2.34-19.57,6.66a8,8,0,0,1-8.86-13.32C108,171.73,116.06,168,128,168s20,3.73,28.43,9.34A8,8,0,0,1,158.66,188.43Zm31.3-63.1c-5.71,6.38-16.14,10.67-26,10.67s-20.25-4.29-26-10.67A8,8,0,0,1,150,114.66c2.68,3,8.85,5.34,14,5.34s11.36-2.35,14-5.34A8,8,0,0,1,190,125.33Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
