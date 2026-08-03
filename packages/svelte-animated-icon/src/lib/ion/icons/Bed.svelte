<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M384,240H96V136a40.12,40.12,0,0,1,40-40H376a40.12,40.12,0,0,1,40,40V240Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M48,416V304a64.19,64.19,0,0,1,64-64H400a64.19,64.19,0,0,1,64,64V416" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M48,416v-8a24.07,24.07,0,0,1,24-24H440a24.07,24.07,0,0,1,24,24v8" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M112,240V224a32.09,32.09,0,0,1,32-32h80a32.09,32.09,0,0,1,32,32v16" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M256,240V224a32.09,32.09,0,0,1,32-32h80a32.09,32.09,0,0,1,32,32v16" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M432,230.7a79.44,79.44,0,0,0-32-6.7H112a79.51,79.51,0,0,0-32,6.69h0A80.09,80.09,0,0,0,32,304V416a16,16,0,0,0,32,0v-8a8.1,8.1,0,0,1,8-8H440a8.1,8.1,0,0,1,8,8v8a16,16,0,0,0,32,0V304A80.09,80.09,0,0,0,432,230.7Z"/><path d="M376,80H136a56,56,0,0,0-56,56v72a4,4,0,0,0,5.11,3.84A95.5,95.5,0,0,1,112,208h4.23a4,4,0,0,0,4-3.55A32,32,0,0,1,152,176h56a32,32,0,0,1,31.8,28.45,4,4,0,0,0,4,3.55h24.46a4,4,0,0,0,4-3.55A32,32,0,0,1,304,176h56a32,32,0,0,1,31.8,28.45,4,4,0,0,0,4,3.55H400a95.51,95.51,0,0,1,26.89,3.85A4,4,0,0,0,432,208V136A56,56,0,0,0,376,80Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
