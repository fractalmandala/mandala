<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><circle cx="128" cy="128" r="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="32" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><circle cx="128" cy="128" r="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="32" y1="128" x2="224" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M120,199.54v27.74a4,4,0,0,1-4.46,4,104.22,104.22,0,0,1-90.8-90.8,4,4,0,0,1,4-4.46H56.46A72.11,72.11,0,0,0,120,199.54ZM183.42,136H136v47.42A56.11,56.11,0,0,0,183.42,136ZM136,72.58V120h47.42A56.11,56.11,0,0,0,136,72.58ZM227.28,136H199.54A72.11,72.11,0,0,1,136,199.54v27.74a4,4,0,0,0,4.46,4,104.22,104.22,0,0,0,90.8-90.8A4,4,0,0,0,227.28,136Zm-27.74-16h27.74a4,4,0,0,0,4-4.46,104.22,104.22,0,0,0-90.8-90.8,4,4,0,0,0-4.46,4V56.46A72.11,72.11,0,0,1,199.54,120Zm-84-95.26a104.22,104.22,0,0,0-90.8,90.8,4,4,0,0,0,4,4.46H56.46A72.11,72.11,0,0,1,120,56.46V28.72A4,4,0,0,0,115.54,24.74ZM72.58,120H120V72.58A56.11,56.11,0,0,0,72.58,120ZM120,183.42V136H72.58A56.11,56.11,0,0,0,120,183.42Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
