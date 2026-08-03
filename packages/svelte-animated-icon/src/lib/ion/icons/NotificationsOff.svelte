<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M128.51,204.59q-.37,6.15-.37,12.76C128.14,304,110,320,84.33,351.43,73.69,364.45,83,384,101.62,384H320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M414.5,335.3c-18.48-23.45-30.62-47.05-30.62-118C383.88,138,343.36,109.73,310,96c-4.43-1.82-8.6-6-9.95-10.55C294.21,65.54,277.82,48,256,48S217.8,65.55,212,85.47c-1.35,4.6-5.52,8.71-10,10.53a149.57,149.57,0,0,0-18,8.79" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M320,384v16a64,64,0,0,1-128,0V384" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="448" y1="448" x2="64" y2="64" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M448,464a15.92,15.92,0,0,1-11.31-4.69l-384-384A16,16,0,0,1,75.31,52.69l384,384A16,16,0,0,1,448,464Z"/><path d="M440.08,341.31c-1.66-2-3.29-4-4.89-5.93-22-26.61-35.31-42.67-35.31-118,0-39-9.33-71-27.72-95-13.56-17.73-31.89-31.18-56.05-41.12a3,3,0,0,1-.82-.67C306.6,51.49,282.82,32,256,32s-50.59,19.49-59.28,48.56a3.13,3.13,0,0,1-.81.65,157.88,157.88,0,0,0-21.88,11,8,8,0,0,0-1.49,12.49L434.32,366.44a8,8,0,0,0,13.6-6.63A35.39,35.39,0,0,0,440.08,341.31Z"/><path d="M112.14,217.35c0,75.36-13.29,91.42-35.31,118-1.6,1.93-3.23,3.89-4.89,5.93a35.16,35.16,0,0,0-4.65,37.62c6.17,13,19.32,21.07,34.33,21.07H312.8a8,8,0,0,0,5.66-13.66l-192-192a8,8,0,0,0-13.62,5Q112.14,208,112.14,217.35Z"/><path d="M256,480a80.06,80.06,0,0,0,70.44-42.13A4,4,0,0,0,322.9,432H189.12a4,4,0,0,0-3.55,5.87A80.06,80.06,0,0,0,256,480Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
