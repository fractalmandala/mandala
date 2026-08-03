<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M208,368V472a23.73,23.73,0,0,0,24,24h0a23.73,23.73,0,0,0,24-24" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M256,368V472a23.73,23.73,0,0,0,24,24h0a23.73,23.73,0,0,0,24-24V368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M183,274a23.73,23.73,0,0,1-29.84,16.18h0a23.72,23.72,0,0,1-16.17-29.84l25-84.28A44.85,44.85,0,0,1,205,144H307a44.85,44.85,0,0,1,43,32.08l25,84.28a23.72,23.72,0,0,1-16.17,29.84h0A23.73,23.73,0,0,1,329.05,274" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><circle cx="256" cy="56" r="40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><polyline points="208 192 160 352 352 352 304 192" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><circle cx="255.75" cy="56" r="56"/><path d="M394.63,277.9,384.3,243.49s0-.07,0-.11l-22.46-74.86h-.05l-2.51-8.45a44.87,44.87,0,0,0-43-32.08h-120a44.84,44.84,0,0,0-43,32.08l-2.51,8.45h-.06l-22.46,74.86s0,.07,0,.11L117.88,277.9c-3.12,10.39,2.3,21.66,12.57,25.14a20,20,0,0,0,25.6-13.18l25.58-85.25h0l2.17-7.23A8,8,0,0,1,199.33,200a7.78,7.78,0,0,1-.17,1.61v0L155.43,347.4A16,16,0,0,0,170.75,368h29V482.69c0,16.46,10.53,29.31,24,29.31s24-12.85,24-29.31V368h16V482.69c0,16.46,10.53,29.31,24,29.31s24-12.85,24-29.31V368h30a16,16,0,0,0,15.33-20.6L313.34,201.59a7.52,7.52,0,0,1-.16-1.59,8,8,0,0,1,15.54-2.63l2.17,7.23h0l25.57,85.25A20,20,0,0,0,382.05,303C392.32,299.56,397.74,288.29,394.63,277.9Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
