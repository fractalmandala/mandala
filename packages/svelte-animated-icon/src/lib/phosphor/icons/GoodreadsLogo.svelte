<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M72,88a56,56,0,0,1,112,0v24a56,56,0,0,1-112,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M184,32V168a56,56,0,0,1-56,56c-19,0-37.88-9.49-48-24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M72,88a56,56,0,0,1,112,0v24a56,56,0,0,1-112,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M184,32V168a56,56,0,0,1-56,56c-19,0-37.88-9.49-48-24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM176,160a48,48,0,0,1-86.4,28.8,8,8,0,1,1,12.8-9.6A32,32,0,0,0,160,160V147.74A48,48,0,0,1,80,112v-8a48,48,0,0,1,80-35.74V64a8,8,0,0,1,16,0Zm-16-56v8a32,32,0,0,1-64,0v-8a32,32,0,0,1,64,0Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
