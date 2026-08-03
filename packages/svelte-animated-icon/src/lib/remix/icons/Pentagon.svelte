<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M12.0001 0.700195L22.7471 8.5083L18.6421 21.1421H5.35814L1.25317 8.5083L12.0001 0.700195Z"/></g>`,
		line: `<g fill="currentColor"><path d="M12.0001 3.03043L20.5306 9.22822L17.2723 19.2564H6.72796L3.4696 9.22822L12.0001 3.03043ZM22.7471 8.50806L12.0001 0.699951L1.25317 8.50806L5.35814 21.1418H18.6421L22.7471 8.50806Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
