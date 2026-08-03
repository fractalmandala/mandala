<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M378,108a191.41,191.41,0,0,1,70,148c0,106-86,192-192,192S64,362,64,256a192,192,0,0,1,69-148" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="64" x2="256" y2="256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,464C141.31,464,48,370.53,48,255.65c0-62.45,27.25-121,74.76-160.55a22,22,0,1,1,28.17,33.8C113.48,160.1,92,206.3,92,255.65,92,346.27,165.57,420,256,420s164-73.73,164-164.35A164,164,0,0,0,360.17,129a22,22,0,1,1,28-33.92A207.88,207.88,0,0,1,464,255.65C464,370.53,370.69,464,256,464Z"/><path d="M256,272a22,22,0,0,1-22-22V70a22,22,0,0,1,44,0V250A22,22,0,0,1,256,272Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
