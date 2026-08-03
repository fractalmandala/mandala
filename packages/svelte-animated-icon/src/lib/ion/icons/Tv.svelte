<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="32" y="96" width="448" height="272" rx="32.14" ry="32.14" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="128" y1="416" x2="384" y2="416" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M447.86,384H64.14A48.2,48.2,0,0,1,16,335.86V128.14A48.2,48.2,0,0,1,64.14,80H447.86A48.2,48.2,0,0,1,496,128.14V335.86A48.2,48.2,0,0,1,447.86,384Z"/><line x1="128" y1="416" x2="384" y2="416" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
