<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M307.72,302.27a8,8,0,0,1-3.72-6.75V80a48,48,0,0,0-48-48h0a48,48,0,0,0-48,48V295.52a8,8,0,0,1-3.71,6.74,97.51,97.51,0,0,0-44.19,86.07A96,96,0,0,0,352,384,97.49,97.49,0,0,0,307.72,302.27Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="256" y1="112" x2="256" y2="384" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><circle cx="256" cy="384" r="48"/></g>`,
		filled: `<g fill="currentColor"><path d="M320,287.18V81c0-35.12-27.89-64.42-63-64.95a64.08,64.08,0,0,0-65,64V287.18a8,8,0,0,1-3.18,6.37A113.48,113.48,0,0,0,144,384a112,112,0,0,0,224,0,113.48,113.48,0,0,0-44.82-90.45A8,8,0,0,1,320,287.18ZM254.07,432a48,48,0,0,1-22-89.54,16,16,0,0,0,8-13.84V112.45c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,272,112V328.58a16.18,16.18,0,0,0,8.15,13.94A48,48,0,0,1,254.07,432Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
