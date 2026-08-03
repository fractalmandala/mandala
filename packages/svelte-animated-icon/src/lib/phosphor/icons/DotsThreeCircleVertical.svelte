<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="16"/><circle cx="128" cy="128" r="12"/><circle cx="128" cy="84" r="12"/><circle cx="128" cy="172" r="12"/></g>`,
		light: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><circle cx="128" cy="84" r="10"/><circle cx="128" cy="128" r="10"/><circle cx="128" cy="172" r="10"/></g>`,
		fill: `<g fill="currentColor"><path d="M232,128A104,104,0,1,0,128,232,104.13,104.13,0,0,0,232,128ZM116,84a12,12,0,1,1,12,12A12,12,0,0,1,116,84Zm0,44a12,12,0,1,1,12,12A12,12,0,0,1,116,128Zm0,44a12,12,0,1,1,12,12A12,12,0,0,1,116,172Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
