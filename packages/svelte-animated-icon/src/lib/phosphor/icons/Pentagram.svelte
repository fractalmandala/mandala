<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M60.75,205.49a8,8,0,0,0,12.31,8.95l155.63-112A8,8,0,0,0,224,88H32a8,8,0,0,0-4.71,14.47l155.63,112a8,8,0,0,0,12.31-8.95L135.61,21.68a7.94,7.94,0,0,0-15.22,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M60.75,205.49a8,8,0,0,0,12.31,8.95l155.63-112A8,8,0,0,0,224,88H32a8,8,0,0,0-4.71,14.47l155.63,112a8,8,0,0,0,12.31-8.95L135.61,21.68a7.94,7.94,0,0,0-15.22,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M60.18,129.52a4,4,0,0,1-6.15,2L22.66,109a15.78,15.78,0,0,1-5.82-18A16.33,16.33,0,0,1,32.43,80H70.74a4,4,0,0,1,3.81,5.24Zm-7,73.48A15.75,15.75,0,0,0,59,220.88a15.74,15.74,0,0,0,18.77,0l32.05-23.06a4,4,0,0,0,0-6.5L71.38,163.72a4,4,0,0,0-6.14,2ZM143.23,19.26a15.93,15.93,0,0,0-30.45-.05L100,58.76A4,4,0,0,0,103.76,64h48.48a4,4,0,0,0,3.81-5.23ZM160,80H96a4,4,0,0,0-3.8,2.77L73,141.77a4,4,0,0,0,1.47,4.48l51.17,36.82a4,4,0,0,0,4.68,0l51.17-36.82a4,4,0,0,0,1.47-4.48l-19.15-59A4,4,0,0,0,160,80Zm79.13,11a16.33,16.33,0,0,0-15.59-11H185.26a4,4,0,0,0-3.81,5.24l14.37,44.29a4,4,0,0,0,6.14,2l31.41-22.6A15.75,15.75,0,0,0,239.16,91Zm-54.55,72.75-38.4,27.63a4,4,0,0,0,0,6.5l32,23A16,16,0,0,0,202.85,203l-12.09-37.27A4,4,0,0,0,184.61,163.72Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
