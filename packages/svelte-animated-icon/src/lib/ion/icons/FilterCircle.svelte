<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path fill="none" stroke="currentColor" stroke-width="32" stroke-miterlimit="10" d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z"/><line fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" x1="144" y1="208" x2="368" y2="208"/><line fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" x1="176" y1="272" x2="336" y2="272"/><line fill="none" stroke="currentColor" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" x1="224" y1="336" x2="288" y2="336"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm32,304H224a16,16,0,0,1,0-32h64a16,16,0,0,1,0,32Zm48-64H176a16,16,0,0,1,0-32H336a16,16,0,0,1,0,32Zm32-64H144a16,16,0,0,1,0-32H368a16,16,0,0,1,0,32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
