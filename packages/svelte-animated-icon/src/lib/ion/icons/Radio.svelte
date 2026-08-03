<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="256" cy="256.02" r="32"/><path d="M184.25,192.25a96,96,0,0,0,0,127.52" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M327.77,319.77a96,96,0,0,0,0-127.52" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M133.28,141.28a168,168,0,0,0,0,229.44" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M378.72,370.72a168,168,0,0,0,0-229.44" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M435,416a240.34,240.34,0,0,0,0-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M77,96a240.34,240.34,0,0,0,0,320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><circle cx="256" cy="256" r="36"/><path d="M190.24,341.77a22,22,0,0,1-16.46-7.38,118,118,0,0,1,0-156.76,22,22,0,1,1,32.87,29.24,74,74,0,0,0,0,98.29,22,22,0,0,1-16.43,36.61Z"/><path d="M321.76,341.77a22,22,0,0,1-16.43-36.61,74,74,0,0,0,0-98.29,22,22,0,1,1,32.87-29.24,118,118,0,0,1,0,156.76A22,22,0,0,1,321.76,341.77Z"/><path d="M139.29,392.72a21.92,21.92,0,0,1-16.08-7,190,190,0,0,1,0-259.49,22,22,0,1,1,32.13,30.06,146,146,0,0,0,0,199.38,22,22,0,0,1-16.06,37Z"/><path d="M372.71,392.72a22,22,0,0,1-16.06-37,146,146,0,0,0,0-199.38,22,22,0,1,1,32.13-30.06,190,190,0,0,1,0,259.49A21.92,21.92,0,0,1,372.71,392.72Z"/><path d="M429,438a22,22,0,0,1-16.39-36.67,218.34,218.34,0,0,0,0-290.66,22,22,0,0,1,32.78-29.34,262.34,262.34,0,0,1,0,349.34A22,22,0,0,1,429,438Z"/><path d="M83,438a21.94,21.94,0,0,1-16.41-7.33,262.34,262.34,0,0,1,0-349.34,22,22,0,0,1,32.78,29.34,218.34,218.34,0,0,0,0,290.66A22,22,0,0,1,83,438Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
