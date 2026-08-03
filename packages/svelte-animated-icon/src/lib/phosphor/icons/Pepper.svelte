<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M216,104a56,56,0,0,0-112,0c0,48.1-25.64,84-82.27,100.7-8.11,2.39-7.43,14.11.9,15.58C88,231.84,216,222.48,216,104Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="105.17 92.58 128 104 160 88 192 104 214.84 92.58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M128,16a32,32,0,0,1,32,32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M216,104a56,56,0,0,0-112,0c0,48.1-25.64,84-82.27,100.7-8.11,2.39-7.43,14.11.9,15.58C88,231.84,216,222.48,216,104Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="105.17 92.58 128 104 160 88 192 104 214.84 92.58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M128,16a32,32,0,0,1,32,32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M167.27,40.42A40.06,40.06,0,0,0,128,8a8,8,0,0,0,0,16,24,24,0,0,1,22.85,16.66A64.08,64.08,0,0,0,96,104c0,46.75-25.75,78-76.53,93a16,16,0,0,0,1.77,31.13A264.8,264.8,0,0,0,66.75,232c40.78,0,86.16-9.15,117.53-35.46C210.64,174.44,224,143.3,224,104h0A64.07,64.07,0,0,0,167.27,40.42ZM192,95,163.58,80.83a8,8,0,0,0-7.16,0L128,95l-13.37-6.68a48,48,0,0,1,90.74,0Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
