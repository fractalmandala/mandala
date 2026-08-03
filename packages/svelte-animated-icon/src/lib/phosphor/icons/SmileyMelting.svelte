<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="164" cy="140" r="12"/><circle cx="116" cy="92" r="12"/><path d="M56.44,192A95.67,95.67,0,0,1,32,126.06C33,74.58,75.15,32.73,126.63,32a96,96,0,0,1,72.93,160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M96,240a16,16,0,0,1,0-32h56a16,16,0,0,0,0-32H136c-26.51,0-56-21.49-56-48a49,49,0,0,1,.66-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="164" cy="140" r="10"/><circle cx="116" cy="92" r="10"/><path d="M56.44,192A95.67,95.67,0,0,1,32,126.06C33,74.58,75.15,32.73,126.63,32a96,96,0,0,1,72.93,160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M96,240a16,16,0,0,1,0-32h56a16,16,0,0,0,0-32H136c-26.51,0-56-21.49-56-48a49,49,0,0,1,.66-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M235.6,176H220.24a104,104,0,1,0-184.52,0H20.4A12.26,12.26,0,0,0,8,187.78,12,12,0,0,0,20,200H80a8,8,0,0,1,0,16H72.16a8.2,8.2,0,0,0-8,6.33A8,8,0,0,0,72,232H199.73a8.18,8.18,0,0,0,8.25-7.47,8,8,0,0,0-8-8.53H144a8,8,0,0,1,0-16h7.79a8.28,8.28,0,0,0,8.15-7.05A8,8,0,0,0,152,184H136c-14.93,0-30.59-5.78-43-15.85-13.55-11-21-25.27-21-40.15a57,57,0,0,1,.71-9,8.21,8.21,0,0,1,8.85-7,8,8,0,0,1,7,9.27A41.33,41.33,0,0,0,88,128c0,22.16,26.26,40,48,40h15.44c13.5,0,24.86,11.05,24.55,24.55a24,24,0,0,1-.23,2.83,4,4,0,0,0,4,4.62H236a12,12,0,0,0,12-12.22A12.26,12.26,0,0,0,235.6,176ZM127.9,93.56A12,12,0,1,1,114.44,80.1,12,12,0,0,1,127.9,93.56Zm48,48a12,12,0,1,1-13.46-13.46A12,12,0,0,1,175.9,141.56Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
