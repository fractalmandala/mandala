<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="60" cy="60" r="12"/><circle cx="128" cy="60" r="12"/><circle cx="196" cy="60" r="12"/><circle cx="60" cy="128" r="12"/><circle cx="128" cy="128" r="12"/><circle cx="196" cy="128" r="12"/><circle cx="60" cy="196" r="12"/><circle cx="128" cy="196" r="12"/><circle cx="196" cy="196" r="12"/></g>`,
		light: `<g fill="currentColor"><circle cx="60" cy="60" r="10"/><circle cx="128" cy="60" r="10"/><circle cx="196" cy="60" r="10"/><circle cx="60" cy="128" r="10"/><circle cx="128" cy="128" r="10"/><circle cx="196" cy="128" r="10"/><circle cx="60" cy="196" r="10"/><circle cx="128" cy="196" r="10"/><circle cx="196" cy="196" r="10"/></g>`,
		fill: `<g fill="currentColor"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM76,192a12,12,0,1,1,12-12A12,12,0,0,1,76,192Zm0-52a12,12,0,1,1,12-12A12,12,0,0,1,76,140Zm0-52A12,12,0,1,1,88,76,12,12,0,0,1,76,88Zm52,104a12,12,0,1,1,12-12A12,12,0,0,1,128,192Zm0-52a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm0-52a12,12,0,1,1,12-12A12,12,0,0,1,128,88Zm52,104a12,12,0,1,1,12-12A12,12,0,0,1,180,192Zm0-52a12,12,0,1,1,12-12A12,12,0,0,1,180,140Zm0-52a12,12,0,1,1,12-12A12,12,0,0,1,180,88Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
