<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M200,112v88.89a7.11,7.11,0,0,1-7.11,7.11H40a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8H85.33a8,8,0,0,1,4.8,1.6L120,104h72A8,8,0,0,1,200,112Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M200,112v88.89a7.11,7.11,0,0,1-7.11,7.11H40a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8H85.33a8,8,0,0,1,4.8,1.6L120,104h72A8,8,0,0,1,200,112Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M64,80V56a8,8,0,0,1,8-8h45.33a8,8,0,0,1,4.8,1.6L152,72h72a8,8,0,0,1,8,8v88.89a7.11,7.11,0,0,1-7.11,7.11H200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M200,112v88.89a7.11,7.11,0,0,1-7.11,7.11H40a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8H85.33a8,8,0,0,1,4.8,1.6L120,104h72A8,8,0,0,1,200,112Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M64,80V56a8,8,0,0,1,8-8h45.33a8,8,0,0,1,4.8,1.6L152,72h72a8,8,0,0,1,8,8v88.89a7.11,7.11,0,0,1-7.11,7.11H200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M224,64H154.67L126.93,43.2a16.12,16.12,0,0,0-9.6-3.2H72A16,16,0,0,0,56,56V72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H192.89A15.13,15.13,0,0,0,208,200.89V184h16.89A15.13,15.13,0,0,0,240,168.89V80A16,16,0,0,0,224,64Zm0,104H208V112a16,16,0,0,0-16-16H122.67L94.93,75.2a16.12,16.12,0,0,0-9.6-3.2H72V56h45.33L147.2,78.4A8,8,0,0,0,152,80h72Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
