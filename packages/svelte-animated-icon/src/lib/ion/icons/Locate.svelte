<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><line x1="256" y1="96" x2="256" y2="56" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><line x1="256" y1="456" x2="256" y2="416" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><path d="M256,112A144,144,0,1,0,400,256,144,144,0,0,0,256,112Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><line x1="416" y1="256" x2="456" y2="256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><line x1="56" y1="256" x2="96" y2="256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/></g>`,
		filled: `<g fill="currentColor"><line x1="256" y1="96" x2="256" y2="56" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><line x1="256" y1="456" x2="256" y2="416" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><path d="M256,112A144,144,0,1,0,400,256,144,144,0,0,0,256,112Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><line x1="416" y1="256" x2="456" y2="256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><line x1="56" y1="256" x2="96" y2="256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
