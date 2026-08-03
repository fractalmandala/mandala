<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M256,272V432a32,32,0,0,1-32,32h0a32,32,0,0,1-32-32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M464,272c0-114.88-93.12-208-208-208S48,157.12,48,272h0a67.88,67.88,0,0,1,96,0h0a78.28,78.28,0,0,1,102.31-7.27L256,272l9.69-7.27A78.28,78.28,0,0,1,368,272h0a67.88,67.88,0,0,1,96,0Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="64" x2="256" y2="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M414.39,113.61A222.26,222.26,0,0,0,278.06,49.07a8.09,8.09,0,0,1-6.88-5.62,15.79,15.79,0,0,0-30.36,0,8.09,8.09,0,0,1-6.88,5.62A224,224,0,0,0,32,271.52a16.41,16.41,0,0,0,7.24,13.87,16,16,0,0,0,20.07-2.08,51.89,51.89,0,0,1,73.31-.06,15.94,15.94,0,0,0,22.6.15,62.59,62.59,0,0,1,81.49-5.87h0a8.24,8.24,0,0,1,3.29,6.59V431.54c0,8.6-6.6,16-15.19,16.44A16,16,0,0,1,208,432a16,16,0,0,0-16.29-16c-9,.16-15.9,8.11-15.7,17.1A48.06,48.06,0,0,0,223.38,480c26.88.34,48.62-21.93,48.62-48.81V284.12a8.24,8.24,0,0,1,3.29-6.59h0a62.59,62.59,0,0,1,81.4,5.78,16,16,0,0,0,22.62,0,51.91,51.91,0,0,1,73.38,0,16,16,0,0,0,19.54,2.41A16.4,16.4,0,0,0,480,271.51,222.54,222.54,0,0,0,414.39,113.61Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
