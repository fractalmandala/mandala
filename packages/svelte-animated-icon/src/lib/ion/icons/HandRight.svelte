<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M432,320V144a32,32,0,0,0-32-32h0a32,32,0,0,0-32,32V256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M368,256V80a32,32,0,0,0-32-32h0a32,32,0,0,0-32,32V240" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M240,241V96a32,32,0,0,0-32-32h0a32,32,0,0,0-32,32V320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M304,240V48a32,32,0,0,0-32-32h0a32,32,0,0,0-32,32V240" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M432,320c0,117.4-64,176-152,176s-123.71-39.6-144-88L83.33,264c-6.66-18.05-3.64-34.79,11.87-43.6h0c15.52-8.82,35.91-4.28,44.31,11.68L176,320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M79.2,211.44h0c15.52-8.82,34.91-2.28,43.31,13.68l41.38,84.41a7,7,0,0,0,8.93,3.43h0a7,7,0,0,0,4.41-6.52V72c0-13.91,12.85-24,26.77-24s26,10.09,26,24V228.64A11.24,11.24,0,0,0,240.79,240,11,11,0,0,0,252,229V24c0-13.91,10.94-24,24.86-24S302,10.09,302,24V228.64A11.24,11.24,0,0,0,312.79,240,11,11,0,0,0,324,229V56c0-13.91,12.08-24,26-24s26,11.09,26,25V244.64A11.24,11.24,0,0,0,386.79,256,11,11,0,0,0,398,245V120c0-13.91,11.08-24,25-24s25.12,10.22,25,24V336c0,117.41-72,176-160,176H272c-88,0-115.71-39.6-136-88L67.33,255C60.67,237,63.69,220.25,79.2,211.44Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
