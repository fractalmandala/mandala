<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="256" cy="352" r="112" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="256" cy="352" r="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M147,323,41.84,159.32a32,32,0,0,1-1.7-31.61l31-62A32,32,0,0,1,99.78,48H412.22a32,32,0,0,1,28.62,17.69l31,62a32,32,0,0,1-1.7,31.61L365,323" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="371" y1="144" x2="37" y2="144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="428.74" y1="52.6" x2="305" y2="250" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="140.55" y1="144" x2="207" y2="250" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><circle cx="256" cy="352" r="32"/><path d="M99.78,32A48,48,0,0,0,56.84,58.53l-31,62A48.26,48.26,0,0,0,24.28,160h278.2a4,4,0,0,0,3.39-1.87l75.5-120A4,4,0,0,0,378,32Z"/><path d="M486.17,120.56l-31-62a47.7,47.7,0,0,0-32.79-25.46L342.5,160h0L298,231.08a128,128,0,0,0-84,0l-23.32-37.2a4,4,0,0,0-3.39-1.88H51.14a4,4,0,0,0-3.36,6.16l82.7,128.73a128,128,0,1,0,251,0L483.62,168A48.22,48.22,0,0,0,486.17,120.56Zm-226,295.31a64,64,0,1,1,59.69-59.69A64.08,64.08,0,0,1,260.18,415.87Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
