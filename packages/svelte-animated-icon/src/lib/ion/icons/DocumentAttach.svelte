<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M208,64h66.75a32,32,0,0,1,22.62,9.37L438.63,214.63A32,32,0,0,1,448,237.25V432a48,48,0,0,1-48,48H192a48,48,0,0,1-48-48V304" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M288,72V192a32,32,0,0,0,32,32H440" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M160,80V232a23.69,23.69,0,0,1-24,24c-12,0-24-9.1-24-24V88c0-30.59,16.57-56,48-56s48,24.8,48,55.38V226.13c0,43-27.82,77.87-72,77.87s-72-34.86-72-77.87V144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M460,240H320a48,48,0,0,1-48-48V52a4,4,0,0,0-4-4H214.75a65.42,65.42,0,0,0-6.5-9.81C196.72,23.88,179.59,16,160,16c-37.68,0-64,29.61-64,72V232c0,25,20.34,40,40,40a39.57,39.57,0,0,0,40-40V80a16,16,0,0,0-32,0V232a7.75,7.75,0,0,1-8,8c-2.23,0-8-1.44-8-8V88c0-19.34,8.41-40,32-40,29.69,0,32,30.15,32,39.38V226.13c0,17.45-5.47,33.23-15.41,44.46C166.5,282,152.47,288,136,288s-30.5-6-40.59-17.41C85.47,259.36,80,243.58,80,226.13V144a16,16,0,0,0-32,0v82.13c0,51.51,33.19,89.63,80,93.53V432a64,64,0,0,0,64,64H400a64,64,0,0,0,64-64V244A4,4,0,0,0,460,240Z"/><path d="M320,208H449.81a2,2,0,0,0,1.41-3.41L307.41,60.78A2,2,0,0,0,304,62.19V192A16,16,0,0,0,320,208Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
