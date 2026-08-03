<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M384,400.33l35.13-.33A29,29,0,0,0,448,371.13V140.87A29,29,0,0,0,419.13,112l-35.13.33" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M128,112l-36.8.33c-15.88,0-27.2,13-27.2,28.87V371.47c0,15.87,11.32,28.86,27.2,28.86L128,400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="384" y1="192" x2="384" y2="320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="320" y1="160" x2="320" y2="352" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="176" x2="256" y2="336" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="192" y1="160" x2="192" y2="352" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="128" y1="192" x2="128" y2="320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M419.13,96H419l-35.05.33L128,96h-.16l-36.74.33C66.93,96.38,48,116.07,48,141.2V371.47c0,25.15,19,44.86,43.2,44.86h.15l36.71-.33,255.92.33h.17l35.07-.33A44.91,44.91,0,0,0,464,371.13V140.87A44.92,44.92,0,0,0,419.13,96ZM144,320a16,16,0,0,1-32,0V192a16,16,0,0,1,32,0Zm64,32a16,16,0,0,1-32,0V160a16,16,0,0,1,32,0Zm64-16a16,16,0,0,1-32,0V176a16,16,0,0,1,32,0Zm64,16a16,16,0,0,1-32,0V160a16,16,0,0,1,32,0Zm64-32a16,16,0,0,1-32,0V192a16,16,0,0,1,32,0Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
