<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="48" y="80" width="416" height="272" rx="32" ry="32" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="416" x2="256" y2="352" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="80" x2="256" y2="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="400" y1="464" x2="368" y2="352" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="112" y1="464" x2="144" y2="352" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><rect x="80" y="112" width="352" height="208" rx="12" ry="12"/><path d="M432,64H272V48a16,16,0,0,0-32,0V64H80a48.05,48.05,0,0,0-48,48V320a48.05,48.05,0,0,0,48,48h42.79L96.62,459.6a16,16,0,1,0,30.76,8.8L156.07,368H240v48a16,16,0,0,0,32,0V368h83.93l28.69,100.4a16,16,0,1,0,30.76-8.8L389.21,368H432a48.05,48.05,0,0,0,48-48V112A48.05,48.05,0,0,0,432,64Zm16,256a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V112A16,16,0,0,1,80,96H432a16,16,0,0,1,16,16Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
