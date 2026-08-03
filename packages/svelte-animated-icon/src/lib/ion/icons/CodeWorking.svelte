<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="256" cy="256" r="26"/><circle cx="346" cy="256" r="26"/><circle cx="166" cy="256" r="26"/><polyline points="160 368 32 256 160 144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><polyline points="352 368 480 256 352 144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><circle cx="256" cy="256" r="26" style="stroke:currentColor;stroke-miterlimit:10;stroke-width:10"/><circle cx="346" cy="256" r="26" style="stroke:currentColor;stroke-miterlimit:10;stroke-width:10"/><circle cx="166" cy="256" r="26" style="stroke:currentColor;stroke-miterlimit:10;stroke-width:10"/><polyline points="160 368 32 256 160 144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:42"/><polyline points="352 368 480 256 352 144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:42"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
