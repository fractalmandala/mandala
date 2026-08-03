<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M421.83,293.82A144,144,0,0,0,218.18,90.17" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M353.94,225.94a48,48,0,0,0-67.88-67.88" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><line x1="192" y1="464" x2="192" y2="416" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="90.18" y1="421.82" x2="124.12" y2="387.88" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="48" y1="320" x2="96" y2="320" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M286.06,158.06,172.92,271.19a32,32,0,0,1-45.25,0L105,248.57a32,32,0,0,1,0-45.26L218.18,90.17" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><path d="M421.83,293.82,308.69,407a32,32,0,0,1-45.26,0l-22.62-22.63a32,32,0,0,1,0-45.26L353.94,225.94" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="139.6" y1="169.98" x2="207.48" y2="237.87" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="275.36" y1="305.75" x2="343.25" y2="373.63" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><line x1="191.98" y1="463.79" x2="191.98" y2="415.79" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="90.16" y1="421.61" x2="124.1" y2="387.67" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="47.98" y1="319.79" x2="95.98" y2="319.79" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M267.56,312.32l-31.11,31.11a16,16,0,0,0,0,22.63l45.26,45.25a16,16,0,0,0,22.62,0l31.12-31.11a4,4,0,0,0,0-5.66l-62.23-62.22A4,4,0,0,0,267.56,312.32Z"/><path d="M131.8,176.55l-31.11,31.12a16,16,0,0,0,0,22.62l45.25,45.26a16,16,0,0,0,22.63,0l31.11-31.11a4,4,0,0,0,0-5.66l-62.22-62.23A4,4,0,0,0,131.8,176.55Z"/><path d="M428.85,83.28a144,144,0,0,0-203.71-.06l-65.06,65.05a4,4,0,0,0,0,5.66l62.23,62.22a4,4,0,0,0,5.66,0l65-65.05a48,48,0,0,1,68.46.59c18.3,18.92,17.47,49.24-1.14,67.85L295.85,284a4,4,0,0,0,0,5.66l62.22,62.23a4,4,0,0,0,5.66,0l64.08-64.08C484.18,231.47,485.18,139.68,428.85,83.28Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
