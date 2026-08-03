<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><polyline points="32 415.5 152 95.5 272 415.5" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="230" y1="303.5" x2="74" y2="303.5" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M326,239.5c12.19-28.69,41-48,74-48h0c46,0,80,32,80,80v144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M320,358.5c0,36,26.86,58,60,58,54,0,100-27,100-106v-15c-20,0-58,1-92,5C355.23,304.36,320,319.5,320,358.5Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M292.6,407.78l-120-320a22,22,0,0,0-41.2,0l-120,320a22,22,0,0,0,41.2,15.44L88.76,326.8a2,2,0,0,1,1.87-1.3H213.37a2,2,0,0,1,1.87,1.3l36.16,96.42a22,22,0,0,0,41.2-15.44Zm-185.84-129,43.37-115.65a2,2,0,0,1,3.74,0L197.24,278.8a2,2,0,0,1-1.87,2.7H108.63A2,2,0,0,1,106.76,278.8Z"/><path d="M400.77,169.5c-41.72-.3-79.08,23.87-95,61.4a22,22,0,0,0,40.5,17.2c8.88-20.89,29.77-34.44,53.32-34.6C431.91,213.28,458,240,458,272.35h0a1.5,1.5,0,0,1-1.45,1.5c-21.92.61-47.92,2.07-71.12,4.8C330.68,285.09,298,314.94,298,358.5c0,23.19,8.76,44,24.67,58.68C337.6,430.93,358,438.5,380,438.5c31,0,57.69-8,77.94-23.22,0,0,.06,0,.06,0h0a22,22,0,1,0,44,.19v-143C502,216.29,457,169.91,400.77,169.5ZM380,394.5c-17.53,0-38-9.43-38-36,0-10.67,3.83-18.14,12.43-24.23,8.37-5.93,21.2-10.16,36.14-11.92,21.12-2.49,44.82-3.86,65.14-4.47a2,2,0,0,1,2,2.1C455,370.1,429.46,394.5,380,394.5Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
