<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="60" cy="92" r="12"/><circle cx="128" cy="92" r="12"/><circle cx="196" cy="92" r="12"/><circle cx="60" cy="164" r="12"/><circle cx="128" cy="164" r="12"/><circle cx="196" cy="164" r="12"/></g>`,
		light: `<g fill="currentColor"><circle cx="60" cy="92" r="10"/><circle cx="128" cy="92" r="10"/><circle cx="196" cy="92" r="10"/><circle cx="60" cy="164" r="10"/><circle cx="128" cy="164" r="10"/><circle cx="196" cy="164" r="10"/></g>`,
		fill: `<g fill="currentColor"><path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM68,168a12,12,0,1,1,12-12A12,12,0,0,1,68,168Zm0-56a12,12,0,1,1,12-12A12,12,0,0,1,68,112Zm60,56a12,12,0,1,1,12-12A12,12,0,0,1,128,168Zm0-56a12,12,0,1,1,12-12A12,12,0,0,1,128,112Zm60,56a12,12,0,1,1,12-12A12,12,0,0,1,188,168Zm0-56a12,12,0,1,1,12-12A12,12,0,0,1,188,112Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
