<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M248,88A120,120,0,0,1,8,88Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M216,88A88,88,0,0,1,40,88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="88" x2="128" y2="176" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="88" x2="190.23" y2="150.23" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="88" x2="65.77" y2="150.23" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M248,88A120,120,0,0,1,8,88Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M216,88A88,88,0,0,1,40,88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="128" y1="88" x2="128" y2="176" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="128" y1="88" x2="190.23" y2="150.23" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="128" y1="88" x2="65.77" y2="150.23" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M51.18,145.51A95.5,95.5,0,0,1,32,88c0-1.41,0-2.81.09-4.21a4,4,0,0,1,4-3.79H107a4,4,0,0,1,2.83,6.83ZM120,183.66V99.31L61.83,157.49A95.68,95.68,0,0,0,120,183.66Zm84.82-38.15A95.5,95.5,0,0,0,224,88c0-1.41,0-2.81-.09-4.21a4,4,0,0,0-4-3.79H149a4,4,0,0,0-2.83,6.83ZM248,80h-4.08a4,4,0,0,0-4,4.14c0,1.28.07,2.57.07,3.86A112,112,0,0,1,16,88c0-1.29,0-2.58.07-3.86a4,4,0,0,0-4-4.14H8a8,8,0,0,0-8,8,128,128,0,1,0,256,0A8,8,0,0,0,248,80ZM136,99.31v84.35a95.68,95.68,0,0,0,58.17-26.17Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
