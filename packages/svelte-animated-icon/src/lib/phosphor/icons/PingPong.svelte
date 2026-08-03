<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M134.58,206.59A31.78,31.78,0,0,1,106,215.41C63.4,207,31.38,167.92,32,122.69c.69-49.55,41.13-90,90.68-90.68,45.23-.63,84.27,31.39,92.72,74a31.78,31.78,0,0,1-8.82,28.58L183,158.21l45.69,32.64a8,8,0,0,1,1,12.16L203,229.66a8,8,0,0,1-12.16-1L158.21,183Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="206.6" y1="81.4" x2="81.4" y2="206.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M134.58,206.59A31.78,31.78,0,0,1,106,215.41C63.4,207,31.38,167.92,32,122.69c.69-49.55,41.13-90,90.68-90.68,45.23-.63,84.27,31.39,92.72,74a31.78,31.78,0,0,1-8.82,28.58L183,158.21l45.69,32.64a8,8,0,0,1,1,12.16L203,229.66a8,8,0,0,1-12.16-1L158.21,183Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="206.6" y1="81.4" x2="81.4" y2="206.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M240,196a16,16,0,0,0-6.65-11.7l-38-27.15,17-16.95a39.67,39.67,0,0,0,11-35.79,99.52,99.52,0,0,0-35.4-57.89A101.93,101.93,0,0,0,122.58,24,100.29,100.29,0,0,0,24,122.58a102.12,102.12,0,0,0,22.55,65.28,99.52,99.52,0,0,0,57.89,35.4,39.68,39.68,0,0,0,35.79-11l16.95-17,27.15,38A16,16,0,0,0,196,240c.44,0,.88.05,1.32.05a16,16,0,0,0,11.31-4.69l26.64-26.64A16,16,0,0,0,240,196Zm-42.6,28-32.63-45.69a8,8,0,0,0-5.85-3.32q-.33,0-.66,0a8,8,0,0,0-5.66,2.34l-23.63,23.63a23.68,23.68,0,0,1-21.36,6.63,80.3,80.3,0,0,1-12.3-3.5l108.8-108.8a80.63,80.63,0,0,1,3.5,12.3,23.67,23.67,0,0,1-6.63,21.36L177.3,152.55a8,8,0,0,0,1,12.17L224,197.36Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
