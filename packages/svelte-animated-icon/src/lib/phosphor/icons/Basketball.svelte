<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M60,60.24A95.7,95.7,0,0,1,88,128a95.7,95.7,0,0,1-28,67.76" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M196,60.24a96,96,0,0,0,0,135.52" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="32" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M60,60.24A95.7,95.7,0,0,1,88,128a95.7,95.7,0,0,1-28,67.76" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M196,60.24a96,96,0,0,0,0,135.52" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="32" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M63.6,46.39a103.48,103.48,0,0,1,52-21.65,4,4,0,0,1,4.45,4V120H95.7A103.77,103.77,0,0,0,63.38,52.44,4,4,0,0,1,63.6,46.39ZM46,64.07a103.51,103.51,0,0,0-21.29,51.46,4,4,0,0,0,4,4.47H79.63A87.86,87.86,0,0,0,51.89,63.59,4,4,0,0,0,46,64.07ZM192.4,46.39a103.48,103.48,0,0,0-52-21.65,4,4,0,0,0-4.45,4V120h24.3a103.77,103.77,0,0,1,32.32-67.56A4,4,0,0,0,192.4,46.39Zm38.86,69.14A103.51,103.51,0,0,0,210,64.07a4,4,0,0,0-5.86-.48A87.86,87.86,0,0,0,176.37,120h50.91A4,4,0,0,0,231.26,115.53ZM24.74,140.47A103.51,103.51,0,0,0,46,191.93a4,4,0,0,0,5.86.48A87.86,87.86,0,0,0,79.63,136H28.72A4,4,0,0,0,24.74,140.47ZM210,191.93a103.51,103.51,0,0,0,21.29-51.46,4,4,0,0,0-4-4.47H176.37a87.86,87.86,0,0,0,27.74,56.41A4,4,0,0,0,210,191.93ZM63.6,209.61a103.48,103.48,0,0,0,52,21.65,4,4,0,0,0,4.45-4V136H95.7a103.77,103.77,0,0,1-32.32,67.56A4,4,0,0,0,63.6,209.61ZM160.3,136H136v91.28a4,4,0,0,0,4.45,4,103.48,103.48,0,0,0,52-21.65,4,4,0,0,0,.22-6.05A103.77,103.77,0,0,1,160.3,136Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
