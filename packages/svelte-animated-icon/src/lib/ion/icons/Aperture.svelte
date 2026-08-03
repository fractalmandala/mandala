<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><line x1="360" y1="94.59" x2="360" y2="296" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="443.13" y1="212.87" x2="296" y2="360" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="417.41" y1="360" x2="216" y2="360" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="299.13" y1="443.13" x2="155.13" y2="299.13" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="152" y1="416" x2="152" y2="216" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="68.87" y1="299.13" x2="212.87" y2="155.13" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="94.59" y1="152" x2="288" y2="152" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="212.87" y1="68.87" x2="360" y2="216" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M250.54,129.17l-67.8-67.8A209.65,209.65,0,0,0,86.32,136h161.4A4,4,0,0,0,250.54,129.17Z"/><path d="M167.72,168H67.63A207.34,207.34,0,0,0,51.48,293.9L170.54,174.83A4,4,0,0,0,167.72,168Z"/><path d="M344,167.72V67.56A207.82,207.82,0,0,0,218.11,51.48L337.17,170.54A4,4,0,0,0,344,167.72Z"/><path d="M460.52,218.1,341.46,337.17a4,4,0,0,0,2.82,6.83H444.37a207.34,207.34,0,0,0,16.15-125.9Z"/><path d="M382.83,250.54l67.83-67.82A209.08,209.08,0,0,0,376,86.2V247.72A4,4,0,0,0,382.83,250.54Z"/><path d="M221.68,341.77a8,8,0,0,0,5.54,2.23h59.66a8,8,0,0,0,5.7-2.39l49.18-50a8,8,0,0,0,2.3-5.62L344,225.18a8,8,0,0,0-2.38-5.69l-50-49.25a8,8,0,0,0-5.63-2.3l-60.84.06a8,8,0,0,0-5.69,2.38l-49.25,50a8,8,0,0,0-2.3,5.63l.06,60.78a8,8,0,0,0,2.45,5.76Z"/><path d="M261.46,382.83l67.8,67.8A209.65,209.65,0,0,0,425.68,376H264.28A4,4,0,0,0,261.46,382.83Z"/><path d="M168,344.28V444.44a207.82,207.82,0,0,0,125.89,16.08L174.83,341.46A4,4,0,0,0,168,344.28Z"/><path d="M129.17,261.46,61.34,329.29A209.1,209.1,0,0,0,136,425.8V264.28A4,4,0,0,0,129.17,261.46Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
