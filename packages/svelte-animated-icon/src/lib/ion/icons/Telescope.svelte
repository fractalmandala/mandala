<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M39.93,327.56l-4.71-8.13A24,24,0,0,1,44,286.64l86.87-50.07a16,16,0,0,1,21.89,5.86l12.71,22a16,16,0,0,1-5.86,21.85L72.76,336.35A24.06,24.06,0,0,1,39.93,327.56Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M170.68,273.72,147.12,233a24,24,0,0,1,8.8-32.78l124.46-71.75a16,16,0,0,1,21.89,5.86l31.57,54.59A16,16,0,0,1,328,210.76L203.51,282.5A24,24,0,0,1,170.68,273.72Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M341.85,202.21l-46.51-80.43A24,24,0,0,1,304.14,89l93.29-53.78A24.07,24.07,0,0,1,430.27,44l46.51,80.43a24,24,0,0,1-8.8,32.79L374.69,211A24.06,24.06,0,0,1,341.85,202.21Z"/><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" x1="127.59" y1="480" x2="223.73" y2="272.01"/><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" x1="271.8" y1="256.02" x2="368.55" y2="448"/></g>`,
		filled: `<g fill="currentColor"><path d="M107.56,250a16,16,0,0,0-21.85-5.86L36,272.81A39.71,39.71,0,0,0,17.2,297.72a40.9,40.9,0,0,0,4.55,30.35l4.36,7.54a40,40,0,0,0,54.62,14.62L130.4,321.6a16,16,0,0,0,5.87-21.86Z"/><path d="M382.84,440.8,288.72,254a2,2,0,0,1,.79-2.63l8.3-4.79a16,16,0,0,0,5.86-21.86l-47.53-82.33a16,16,0,0,0-21.86-5.87l-86.38,49.8a39.73,39.73,0,0,0-18.65,24.28,34.82,34.82,0,0,0-1.37,9.76c.06,7.6,9.2,22.7,18.12,38.28,9.59,16.75,19.24,33.88,26.34,38.15,4.52,2.72,12.5,4.9,19.21,4.9l.84,0L113.07,473.29a16,16,0,1,0,29.05,13.42L235.8,284.06a7.94,7.94,0,0,1,3.26-3.57l19.21-11.08a2,2,0,0,1,2.78.84l93.21,185a16,16,0,0,0,28.58-14.4Z"/><path d="M490.21,115.74,444.09,36a40.08,40.08,0,0,0-54.63-14.62L296.12,75.16a39.69,39.69,0,0,0-18.65,24.28,32.76,32.76,0,0,0-1.27,13.25c1.74,12.62,13,30.4,26.41,53.89,13.58,23.73,28.91,50.48,36.93,56.27a40.18,40.18,0,0,0,23.18,7.37,39.77,39.77,0,0,0,19.92-5.34L476,171.07a39.72,39.72,0,0,0,18.79-24.84A41,41,0,0,0,490.21,115.74Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
