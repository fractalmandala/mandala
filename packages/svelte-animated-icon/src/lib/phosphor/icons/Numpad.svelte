<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="64" cy="48" r="16"/><circle cx="128" cy="48" r="16"/><circle cx="192" cy="48" r="16"/><circle cx="64" cy="104" r="16"/><circle cx="128" cy="104" r="16"/><circle cx="192" cy="104" r="16"/><circle cx="64" cy="160" r="16"/><circle cx="128" cy="160" r="16"/><circle cx="128" cy="216" r="16"/><circle cx="192" cy="160" r="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="64" cy="48" r="14"/><circle cx="128" cy="48" r="14"/><circle cx="192" cy="48" r="14"/><circle cx="64" cy="104" r="14"/><circle cx="128" cy="104" r="14"/><circle cx="192" cy="104" r="14"/><circle cx="64" cy="160" r="14"/><circle cx="128" cy="160" r="14"/><circle cx="128" cy="216" r="14"/><circle cx="192" cy="160" r="14"/></g>`,
		fill: `<g fill="currentColor"><path d="M200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM80,164a12,12,0,1,1,12-12A12,12,0,0,1,80,164Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,80,124Zm0-40A12,12,0,1,1,92,72,12,12,0,0,1,80,84Zm48,120a12,12,0,1,1,12-12A12,12,0,0,1,128,204Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,128,164Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,128,124Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,128,84Zm48,80a12,12,0,1,1,12-12A12,12,0,0,1,176,164Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,176,124Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,176,84Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
