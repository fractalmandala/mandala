<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M208,208V472a23.73,23.73,0,0,0,24,24h0a23.73,23.73,0,0,0,24-24" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M256,336V472a23.73,23.73,0,0,0,24,24h0a23.73,23.73,0,0,0,24-24V208" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M208,192v88a23.72,23.72,0,0,1-24,24h0a23.72,23.72,0,0,1-24-24V192a48,48,0,0,1,48-48h96a48,48,0,0,1,48,48v88a23.72,23.72,0,0,1-24,24h0a23.72,23.72,0,0,1-24-24V192" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><circle cx="256" cy="56" r="40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><circle cx="256" cy="56" r="56"/><path d="M304,128H208a64.19,64.19,0,0,0-64,64V299.52c0,10.85,8.43,20.08,19.27,20.47A20,20,0,0,0,184,300V200.27a8.18,8.18,0,0,1,7.47-8.25,8,8,0,0,1,8.53,8V489a23,23,0,0,0,23,23h0a23,23,0,0,0,23-23V346.34A10.24,10.24,0,0,1,255.33,336,10,10,0,0,1,266,346V489a23,23,0,0,0,23,23h0a23,23,0,0,0,23-23V200.27a8.18,8.18,0,0,1,7.47-8.25,8,8,0,0,1,8.53,8v99.52c0,10.85,8.43,20.08,19.27,20.47A20,20,0,0,0,368,300V192A64.19,64.19,0,0,0,304,128Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
