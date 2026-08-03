<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="152" y1="104" x2="184" y2="72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="72" y1="184" x2="104" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="152" x2="184" y2="184" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="72" y1="72" x2="104" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M146.05,64A36,36,0,1,1,192,110" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M192,146.05A36,36,0,1,1,146.05,192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M110,192A36,36,0,1,1,64,146.05" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M64,110A36,36,0,1,1,110,64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="152" y1="104" x2="184" y2="72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="72" y1="184" x2="104" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="152" y1="152" x2="184" y2="184" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="72" y1="72" x2="104" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M146.05,64A36,36,0,1,1,192,110" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M192,146.05A36,36,0,1,1,146.05,192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M110,192A36,36,0,1,1,64,146.05" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M64,110A36,36,0,1,1,110,64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M189.66,77.66,160,107.31v41.38l29.66,29.65a8,8,0,0,1-11.32,11.32L148.69,160H107.31L77.66,189.66a8,8,0,0,1-11.32-11.32L96,148.69V107.31L66.34,77.66A8,8,0,0,1,77.66,66.34L107.31,96h41.38l29.65-29.66a8,8,0,0,1,11.32,11.32Zm-46.28-6.12a8,8,0,0,0,10.21-4.87,28,28,0,1,1,35.74,35.74A8,8,0,0,0,192,118a7.86,7.86,0,0,0,2.67-.46,44,44,0,1,0-56.16-56.16A8,8,0,0,0,143.38,71.54Zm51.29,67a8,8,0,0,0-5.34,15.08,28,28,0,1,1-35.74,35.74,8,8,0,0,0-15.08,5.34,44,44,0,1,0,56.16-56.16Zm-82,46a8,8,0,0,0-10.21,4.87,28,28,0,1,1-35.74-35.74,8,8,0,0,0-5.34-15.08,44,44,0,1,0,56.16,56.16A8,8,0,0,0,112.62,184.46Zm-51.29-67A7.86,7.86,0,0,0,64,118a8,8,0,0,0,2.67-15.54,28,28,0,1,1,35.74-35.74,8,8,0,1,0,15.08-5.34,44,44,0,1,0-56.16,56.16Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
