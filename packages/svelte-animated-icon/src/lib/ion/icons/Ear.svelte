<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M335.72,330.76C381.73,299.5,416,251.34,416,192a160,160,0,0,0-320,0V398.57C96,442.83,131.74,480,176,480h0c44.26,0,66.83-25.94,77.29-40C268.06,420.19,295,358.44,335.72,330.76Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M160,304V184c0-48.4,43.2-88,96-88h0c52.8,0,96,39.6,96,88" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M160,239c25-18,79.82-15,79.82-15,26,0,41.17,29.42,26,50.6,0,0-36.86,42.4-41.86,61.4" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,16C159,16,80,95,80,192V398.57a97.59,97.59,0,0,0,28,68.49A94.51,94.51,0,0,0,176,496c36.86,0,67.18-15.62,90.12-46.42,4.48-6,9.55-14.74,15.42-24.85,15.32-26.37,36.29-62.47,63.17-80.74,25.77-17.51,47.23-39.54,62-63.72C423.51,252.94,432,223.24,432,192,432,95,353.05,16,256,16Zm96,184a16,16,0,0,1-16-16c0-39.7-35.89-72-80-72s-80,32.3-80,72v30.42c27.19-7.84,58.4-6.72,64.28-6.42a48,48,0,0,1,38.6,75.9c-.3.41-.61.81-.95,1.2-16.55,19-36,45.48-38.46,55a16,16,0,0,1-30.94-8.14c5.51-20.94,36.93-58.2,44.66-67.15A16,16,0,0,0,239.82,240l-.88,0c-16.6-.89-45.89.8-62.94,8.31V304a16,16,0,0,1-32,0V184c0-57.35,50.24-104,112-104s112,46.65,112,104A16,16,0,0,1,352,200Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
