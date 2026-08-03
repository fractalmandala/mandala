<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M452.37,59.63h0a40.49,40.49,0,0,0-57.26,0L184,294.74c23.08,4.7,46.12,27.29,49.26,49.26L452.37,116.89A40.49,40.49,0,0,0,452.37,59.63Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M138,336c-29.88,0-54,24.5-54,54.86,0,23.95-20.88,36.57-36,36.57C64.56,449.74,92.82,464,120,464c39.78,0,72-32.73,72-73.14C192,360.5,167.88,336,138,336Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M233.15,360.11a15.7,15.7,0,0,1-4.92-.77,16,16,0,0,1-10.92-13c-2.15-15-19.95-32.46-36.62-35.85A16,16,0,0,1,172,284.16L383.09,49.06c.19-.22.39-.43.59-.63a56.57,56.57,0,0,1,79.89,0h0a56.51,56.51,0,0,1,.11,79.78l-219,227A16,16,0,0,1,233.15,360.11Z"/><path d="M119.89,480.11c-32.14,0-65.45-16.89-84.85-43a16,16,0,0,1,12.85-25.54c5.34,0,20-4.87,20-20.57,0-39.07,31.4-70.86,70-70.86s70,31.79,70,70.86C207.89,440.12,168.41,480.11,119.89,480.11Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
