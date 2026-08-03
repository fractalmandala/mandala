<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M212.57,173.46a96,96,0,0,0-121.79-134" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M63.42,57a96,96,0,0,0-18.53,119.1h0L32.42,213.46a8,8,0,0,0,10.12,10.12l37.39-12.47h0A96,96,0,0,0,192.58,199" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M212.57,173.46a96,96,0,0,0-121.79-134" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M63.42,57a96,96,0,0,0-18.53,119.1h0L32.42,213.46a8,8,0,0,0,10.12,10.12l37.39-12.47h0A96,96,0,0,0,192.58,199" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M213.92,210.62a8,8,0,1,1-11.84,10.76l-10.26-11.29a104,104,0,0,1-112.7,9.73L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104.06,104.06,0,0,1,52.33,56.66L42.08,45.38A8,8,0,1,1,53.92,34.62ZM128,24a103.39,103.39,0,0,0-40.33,8.11,8,8,0,0,0-2.81,12.75l121.8,134a8,8,0,0,0,13-1.59A104,104,0,0,0,128,24Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
