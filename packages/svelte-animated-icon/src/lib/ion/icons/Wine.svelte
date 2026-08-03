<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M398.57,80H113.43V96S87.51,272,256,272,398.57,96,398.57,96Z" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="272" x2="256" y2="432" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="352" y1="432" x2="160" y2="432" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="112" y1="160" x2="400" y2="160" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M414.56,94.92V80a16,16,0,0,0-16-16H113.44a16,16,0,0,0-16,16V94.92c-1.46,11.37-9.65,90.74,36.93,144.69,24.87,28.8,60.36,44.85,105.63,47.86V416H160a16,16,0,0,0,0,32H352a16,16,0,0,0,0-32H272V287.47c45.27-3,80.76-19.06,105.63-47.86C424.21,185.66,416,106.29,414.56,94.92Zm-285.3,3.41a15.14,15.14,0,0,0,.18-2.33H382.56a15.14,15.14,0,0,0,.18,2.33,201.91,201.91,0,0,1,0,45.67H129.32A204.29,204.29,0,0,1,129.26,98.33Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
