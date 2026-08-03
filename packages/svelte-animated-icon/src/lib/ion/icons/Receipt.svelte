<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><polyline points="160 336 160 48 192 64 224 48 255.94 64 288.31 48 320 64 351.79 48 383.72 64 416 48 448.01 64 480 48 480 272" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><path d="M480,272V384a80,80,0,0,1-80,80h0a80,80,0,0,1-80-80V336H48a15.86,15.86,0,0,0-16,16c0,64,6.74,112,80,112H400" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="224" y1="144" x2="416" y2="144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="288" y1="224" x2="416" y2="224" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M483.82,32.45a16.28,16.28,0,0,0-11.23,1.37L448,46.1h0l-24.8-12.4a16,16,0,0,0-14.31,0L383.78,46.11h0L359,33.7a16,16,0,0,0-14.36,0L320,46.07H320L295.55,33.73a16,16,0,0,0-14.35-.06L256,46.12h0l-24.8-12.43a16.05,16.05,0,0,0-14.33,0L192,46.1h0L167.16,33.69a16,16,0,0,0-19.36,3.94A16.25,16.25,0,0,0,144,48.28V288a0,0,0,0,0,.05.05H336a32,32,0,0,1,32,32V424c0,30.93,33.07,56,64,56h12a52,52,0,0,0,52-52V48A16,16,0,0,0,483.82,32.45ZM416,240H288.5c-8.64,0-16.1-6.64-16.48-15.28A16,16,0,0,1,288,208H415.5c8.64,0,16.1,6.64,16.48,15.28A16,16,0,0,1,416,240Zm0-80H224.5c-8.64,0-16.1-6.64-16.48-15.28A16,16,0,0,1,224,128H415.5c8.64,0,16.1,6.64,16.48,15.28A16,16,0,0,1,416,160Z"/><path d="M336,424V336a16,16,0,0,0-16-16H48a32.1,32.1,0,0,0-32,32.05c0,50.55,5.78,71.57,14.46,87.57C45.19,466.79,71.86,480,112,480H357.68a4,4,0,0,0,2.85-6.81C351.07,463.7,336,451,336,424Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
