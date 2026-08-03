<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M216,152V48a16,16,0,0,0-16-16h0a16,16,0,0,0-16,16V216a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V48A16,16,0,0,1,72,32H200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="56" y1="192" x2="184" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M216,152V48a16,16,0,0,0-16-16h0a16,16,0,0,0-16,16V216a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V48A16,16,0,0,1,72,32H200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="56" y1="192" x2="184" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M224,48V152a8,8,0,0,1-8.53,8,8.17,8.17,0,0,1-7.47-8.25V48a8,8,0,0,0-8.55-8A8.19,8.19,0,0,0,192,48.28V180a4,4,0,0,1-4,4H52a4,4,0,0,1-4-4V48A24,24,0,0,1,72,24H200A24,24,0,0,1,224,48ZM188,200H52a4,4,0,0,0-4,4v12a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V204A4,4,0,0,0,188,200Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
