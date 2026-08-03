<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M32,208H88l96-104h40a8,8,0,0,0,8-8V56a8,8,0,0,0-8-8H168L72,152H32a8,8,0,0,0-8,8v40A8,8,0,0,0,32,208Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="176 176 200 152 224 176" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="200" y1="152" x2="200" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M32,208H88l96-104h40a8,8,0,0,0,8-8V56a8,8,0,0,0-8-8H168L72,152H32a8,8,0,0,0-8,8v40A8,8,0,0,0,32,208Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="176 176 200 152 224 176" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="200" y1="152" x2="200" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M240,56V96a16,16,0,0,1-16,16H187.5L93.88,213.43A8,8,0,0,1,88,216H32a16,16,0,0,1-16-16V160a16,16,0,0,1,16-16H68.5L162.12,42.57A8,8,0,0,1,168,40h56A16,16,0,0,1,240,56Zm-34.34,90.34a8,8,0,0,0-11.32,0l-24,24a8,8,0,0,0,11.32,11.32L192,171.31V208a8,8,0,0,0,16,0V171.31l10.34,10.35a8,8,0,0,0,11.32-11.32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
