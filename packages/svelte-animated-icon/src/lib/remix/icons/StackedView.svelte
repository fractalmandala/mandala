<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		line: `<g fill="currentColor"><path d="M4 2C3.44772 2 3 2.44772 3 3V14C3 14.5523 3.44772 15 4 15H20C20.5523 15 21 14.5523 21 14V3C21 2.44772 20.5523 2 20 2H4ZM5 13V4H19V13H5ZM4 17C3.44772 17 3 17.4477 3 18V22H5V19H19V22H21V18C21 17.4477 20.5523 17 20 17H4Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
