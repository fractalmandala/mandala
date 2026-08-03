<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M416.07,272a160,160,0,1,0-160,160A160,160,0,0,0,416.07,272Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M142.12,91.21A46.67,46.67,0,0,0,112,80l-2.79.08C83.66,81.62,64,104,64.07,131c0,13.21,4.66,19.37,10.88,27.23A4.55,4.55,0,0,0,78.19,160h.88a3.23,3.23,0,0,0,2.54-1.31L142.38,99a5.38,5.38,0,0,0,1.55-4A5.26,5.26,0,0,0,142.12,91.21Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M369.88,91.21A46.67,46.67,0,0,1,400,80l2.79.08C428.34,81.62,448,104,447.93,131c0,13.21-4.66,19.37-10.88,27.23a4.55,4.55,0,0,1-3.24,1.76h-.88a3.23,3.23,0,0,1-2.54-1.31L369.62,99a5.38,5.38,0,0,1-1.55-4A5.26,5.26,0,0,1,369.88,91.21Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><polyline points="256.07 160 256.07 272 176.07 272" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="416.07" y1="432" x2="376.07" y2="392" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="96.07" y1="432" x2="136.07" y2="392" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M153.59,110.46A21.41,21.41,0,0,0,152.48,79h0A62.67,62.67,0,0,0,112,64l-3.27.09-.48,0C74.4,66.15,48,95.55,48.07,131c0,19,8,29.06,14.32,37.11a20.61,20.61,0,0,0,14.7,7.8c.26,0,.7.05,2,.05a19.06,19.06,0,0,0,13.75-5.89Z"/><path d="M403.79,64.11l-3.27-.1H400a62.67,62.67,0,0,0-40.52,15,21.41,21.41,0,0,0-1.11,31.44l60.77,59.65A19.06,19.06,0,0,0,432.93,176c1.28,0,1.72,0,2-.05a20.61,20.61,0,0,0,14.69-7.8c6.36-8.05,14.28-18.08,14.32-37.11C464,95.55,437.6,66.15,403.79,64.11Z"/><path d="M256.07,96c-97,0-176,78.95-176,176a175.23,175.23,0,0,0,40.81,112.56L84.76,420.69a16,16,0,1,0,22.63,22.62l36.12-36.12a175.63,175.63,0,0,0,225.12,0l36.13,36.12a16,16,0,1,0,22.63-22.62l-36.13-36.13A175.17,175.17,0,0,0,432.07,272C432.07,175,353.12,96,256.07,96Zm16,176a16,16,0,0,1-16,16h-80a16,16,0,0,1,0-32h64V160a16,16,0,0,1,32,0Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
