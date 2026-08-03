<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="256" cy="256" r="208" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M461.43,271.44c-5.09.37-8.24.56-13.43.56-114.88,0-208-93.12-208-208,0-5.37.2-8.69.6-14" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M49.65,240.56S58.84,240,64,240c114.88,0,208,93.12,208,208,0,5.38-.61,14-.61,14" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M448,256a192.55,192.55,0,0,0,32-2.68A224,224,0,0,0,258.68,32,192.55,192.55,0,0,0,256,64C256,169.87,342.13,256,448,256Z"/><path d="M253.35,480c.94-5.67,1.65-11.4,2.09-17.18.37-4.88.56-9.86.56-14.79,0-105.87-86.13-192-192-192a192.55,192.55,0,0,0-32,2.68A224,224,0,0,0,253.35,480Z"/><path d="M289.61,222.39A222.53,222.53,0,0,1,224,64a226.07,226.07,0,0,1,2-30A224.1,224.1,0,0,0,34,226a226.07,226.07,0,0,1,30-2,222.53,222.53,0,0,1,158.39,65.61A222.53,222.53,0,0,1,288,448c0,5.74-.22,11.53-.65,17.22q-.5,6.42-1.36,12.79A224.12,224.12,0,0,0,478,286a226.07,226.07,0,0,1-30,2A222.53,222.53,0,0,1,289.61,222.39Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
