<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M12.0001 2.76001L21.9992 5.996L21.1001 15.464L12.0001 22.3235L2.90012 15.46L2.01074 6.00001L12.0001 2.76001ZM12.0001 3.58535L3.18898 6.43501L12.0001 20.7932L20.8058 6.43501L12.0001 3.58535Z"/></g>`,
		line: `<g fill="currentColor"><path d="M12 3L2 5.996L3 15.46L12 22.5L21 15.46L22 5.996L12 3ZM19.8367 7.43572L12 19.9608L4.16326 7.43572L12 5.08783L19.8367 7.43572Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
