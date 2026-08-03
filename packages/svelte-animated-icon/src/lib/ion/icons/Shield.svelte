<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M463.1,112.37C373.68,96.33,336.71,84.45,256,48,175.29,84.45,138.32,96.33,48.9,112.37,32.7,369.13,240.58,457.79,256,464,271.42,457.79,479.3,369.13,463.1,112.37Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M479.07,111.35A16,16,0,0,0,465.92,96.6C379.89,81.18,343.69,69.12,266,34.16c-7.76-2.89-12.57-2.84-20,0-77.69,35-113.89,47-199.92,62.44a16,16,0,0,0-13.15,14.75c-3.85,61.1,4.34,118,24.36,169.15a348.86,348.86,0,0,0,71.43,112.41c44.67,47.43,94.2,75.12,119.74,85.6a20,20,0,0,0,15.11,0c27-10.92,74.69-37.82,119.71-85.62A348.86,348.86,0,0,0,454.71,280.5C474.73,229.36,482.92,172.45,479.07,111.35Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
