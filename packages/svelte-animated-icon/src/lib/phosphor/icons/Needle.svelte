<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="184" y1="72" x2="168" y2="88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M182.63,118.63l24-24a32,32,0,0,0-45.26-45.26l-24,24C128,128,40,216,40,216S128,128,182.63,118.63Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="184" y1="72" x2="168" y2="88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M182.63,118.63l24-24a32,32,0,0,0-45.26-45.26l-24,24C128,128,40,216,40,216S128,128,182.63,118.63Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M212.28,43.72a40,40,0,0,0-56.56,0l-24,24a8,8,0,0,0-2.23,4.3C120.69,123.28,36,208.73,34.36,210.33h0a8,8,0,0,0,11.31,11.32h0c.86-.87,86.83-86.31,138.32-95.15a8,8,0,0,0,4.3-2.23l24-24a40,40,0,0,0,0-56.56ZM189.66,77.66l-16,16a8,8,0,0,1-11.32-11.32l16-16a8,8,0,0,1,11.32,11.32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
