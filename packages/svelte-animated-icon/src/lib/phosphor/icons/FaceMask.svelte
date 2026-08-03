<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M40,77.09a8,8,0,0,1,5.27-7.52l80-29.09a8,8,0,0,1,5.46,0l80,29.09A8,8,0,0,1,216,77.09V136c0,56-88,72-88,72s-88-16-88-72Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="88" y1="104" x2="168" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="88" y1="136" x2="168" y2="136" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M213.41,152H224a24,24,0,0,0,24-24V104a24,24,0,0,0-24-24h-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M42.59,152H32A24,24,0,0,1,8,128V104A24,24,0,0,1,32,80h8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M40,77.09a8,8,0,0,1,5.27-7.52l80-29.09a8,8,0,0,1,5.46,0l80,29.09A8,8,0,0,1,216,77.09V136c0,56-88,72-88,72s-88-16-88-72Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="88" y1="104" x2="168" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="88" y1="136" x2="168" y2="136" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M213.41,152H224a24,24,0,0,0,24-24V104a24,24,0,0,0-24-24h-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M42.59,152H32A24,24,0,0,1,8,128V104A24,24,0,0,1,32,80h8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M224,72h-.85a16,16,0,0,0-9.68-10L133.47,33a16.06,16.06,0,0,0-10.94,0l-80,29.09a16,16,0,0,0-9.68,10H32A32,32,0,0,0,0,104v24a32,32,0,0,0,32,32h5.19c7.19,15.8,21.79,29.43,43.23,40.16a191.16,191.16,0,0,0,46.15,15.71,7.93,7.93,0,0,0,2.86,0,191.16,191.16,0,0,0,46.15-15.71c21.44-10.73,36-24.36,43.23-40.16H224a32,32,0,0,0,32-32V104A32,32,0,0,0,224,72ZM32,144a16,16,0,0,1-16-16V104A16,16,0,0,1,32,88v48a58.74,58.74,0,0,0,.55,8Zm136,0H88a8,8,0,0,1,0-16h80a8,8,0,0,1,0,16Zm0-32H88a8,8,0,0,1,0-16h80a8,8,0,0,1,0,16Zm72,16a16,16,0,0,1-16,16h-.55a58.74,58.74,0,0,0,.55-8V88a16,16,0,0,1,16,16Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
