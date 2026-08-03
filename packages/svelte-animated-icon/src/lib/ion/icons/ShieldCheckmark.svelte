<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><polyline points="336 176 225.2 304 176 255.8" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M463.1,112.37C373.68,96.33,336.71,84.45,256,48,175.29,84.45,138.32,96.33,48.9,112.37,32.7,369.13,240.58,457.79,256,464,271.42,457.79,479.3,369.13,463.1,112.37Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M479.07,111.36a16,16,0,0,0-13.15-14.74c-86.5-15.52-122.61-26.74-203.33-63.2a16,16,0,0,0-13.18,0C168.69,69.88,132.58,81.1,46.08,96.62a16,16,0,0,0-13.15,14.74c-3.85,61.11,4.36,118.05,24.43,169.24A349.47,349.47,0,0,0,129,393.11c53.47,56.73,110.24,81.37,121.07,85.73a16,16,0,0,0,12,0c10.83-4.36,67.6-29,121.07-85.73A349.47,349.47,0,0,0,454.64,280.6C474.71,229.41,482.92,172.47,479.07,111.36Zm-131,75.11-110.8,128A16,16,0,0,1,225.86,320h-.66a16,16,0,0,1-11.2-4.57l-49.2-48.2a16,16,0,1,1,22.4-22.86l37,36.29L323.9,165.53a16,16,0,0,1,24.2,20.94Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
