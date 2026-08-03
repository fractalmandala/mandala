<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="92" cy="92" r="12"/><circle cx="164" cy="92" r="12"/><circle cx="92" cy="164" r="12"/><circle cx="128" cy="128" r="12"/><circle cx="164" cy="164" r="12"/></g>`,
		light: `<g fill="currentColor"><circle cx="92" cy="92" r="10"/><circle cx="128" cy="128" r="10"/><circle cx="164" cy="92" r="10"/><circle cx="92" cy="164" r="10"/><circle cx="164" cy="164" r="10"/></g>`,
		fill: `<g fill="currentColor"><path d="M192,32H64A32,32,0,0,0,32,64V192a32,32,0,0,0,32,32H192a32,32,0,0,0,32-32V64A32,32,0,0,0,192,32ZM92,176a12,12,0,1,1,12-12A12,12,0,0,1,92,176Zm0-72a12,12,0,1,1,12-12A12,12,0,0,1,92,104Zm36,36a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm36,36a12,12,0,1,1,12-12A12,12,0,0,1,164,176Zm0-72a12,12,0,1,1,12-12A12,12,0,0,1,164,104Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
