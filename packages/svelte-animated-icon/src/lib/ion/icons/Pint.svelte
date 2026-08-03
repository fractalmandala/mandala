<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M132.43,162c-6.24-34-4.49-45.55-3.07-68.39L132.27,47a16,16,0,0,1,15.94-15H363.78a16,16,0,0,1,15.94,15l2.91,46.61c1.43,22.86,3.19,34.39-3.06,68.45-5.93,32.29-43.71,133.27-43.71,238.32V472a8,8,0,0,1-8,8H184.12a8,8,0,0,1-8-8V400.37C176.13,307.9,138.66,196.07,132.43,162Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="135.21" y1="96" x2="376.79" y2="96" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M399,99.29c-.15-2.13-.3-4.35-.44-6.68L395.69,46a32,32,0,0,0-31.91-30H148.21A32,32,0,0,0,116.3,46l-2.91,46.63c-.14,2.31-.29,4.51-.43,6.62-1.29,19.24-2.23,33.14,3.73,65.66,1.67,9.11,5.22,22.66,9.73,39.82,12.61,48,33.71,128.36,33.71,195.63V472a24,24,0,0,0,24,24H327.87a24,24,0,0,0,24-24V400.38c0-77.09,21.31-153.29,34-198.81,4.38-15.63,7.83-28,9.41-36.62C401.27,132.44,400.33,118.53,399,99.29ZM364,51.75l1.5,24a4,4,0,0,1-4,4.25h-211a4,4,0,0,1-4-4.25l1.48-24A4,4,0,0,1,152,48H360A4,4,0,0,1,364,51.75Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
