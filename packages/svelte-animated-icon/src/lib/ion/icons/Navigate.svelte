<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M448,64,64,240.14H264a8,8,0,0,1,8,8V448Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M272,464a16,16,0,0,1-16-16.42V264.13a8,8,0,0,0-8-8H64.41a16.31,16.31,0,0,1-15.49-10.65,16,16,0,0,1,8.41-19.87l384-176.15a16,16,0,0,1,21.22,21.19l-176,384A16,16,0,0,1,272,464Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
