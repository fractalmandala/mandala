<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><line x1="256" y1="232" x2="256" y2="152" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="88" x2="256" y2="72" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><line x1="132" y1="132" x2="120" y2="120" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:48"/><circle cx="256" cy="272" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M256,96A176,176,0,1,0,432,272,176,176,0,0,0,256,96Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><circle cx="256" cy="272" r="16"/><path d="M280,81.5V72a24,24,0,0,0-48,0v9.5a191,191,0,0,0-84.43,32.13L137,103A24,24,0,0,0,103,137l8.6,8.6A191.17,191.17,0,0,0,64,272c0,105.87,86.13,192,192,192s192-86.13,192-192C448,174.26,374.58,93.34,280,81.5ZM256,320a48,48,0,0,1-16-93.25V152a16,16,0,0,1,32,0v74.75A48,48,0,0,1,256,320Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
