<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M152,206.4a88,88,0,0,1,0-156.8,88,88,0,1,0,0,156.8Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polygon points="177.46 128 160 98.33 192.59 106.4 214.39 80 217.06 114.65 248 128 217.06 141.35 214.39 176 192.59 149.6 160 157.67 177.46 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M152,206.4a88,88,0,0,1,0-156.8,88,88,0,1,0,0,156.8Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polygon points="177.46 128 160 98.33 192.59 106.4 214.39 80 217.06 114.65 248 128 217.06 141.35 214.39 176 192.59 149.6 160 157.67 177.46 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M160,206.4a8,8,0,0,1-4.36,7.13A94.93,94.93,0,0,1,112,224a96,96,0,0,1,0-192,94.93,94.93,0,0,1,43.64,10.47,8,8,0,0,1,0,14.25,80,80,0,0,0,0,142.56A8,8,0,0,1,160,206.4Zm91.17-85.75-26.5-11.43-2.31-29.84a8,8,0,0,0-14.14-4.47L189.63,97.42l-27.71-6.85a8,8,0,0,0-8.81,11.82L168.18,128l-15.07,25.61a8,8,0,0,0,8.81,11.82l27.71-6.85,18.59,22.51a8,8,0,0,0,14.14-4.47l2.31-29.84,26.5-11.43a8,8,0,0,0,0-14.7Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
