<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M35.27,93.93a8,8,0,0,0-2.88,8.9l32,107.62A8,8,0,0,0,72,216H184a8,8,0,0,0,7.62-5.55l32-107.62a8,8,0,0,0-2.88-8.9l-88-68.38a8,8,0,0,0-9.46,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M35.27,93.93a8,8,0,0,0-2.88,8.9l32,107.62A8,8,0,0,0,72,216H184a8,8,0,0,0,7.62-5.55l32-107.62a8,8,0,0,0-2.88-8.9l-88-68.38a8,8,0,0,0-9.46,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M231.26,105.19l-32,107.54-.06.17A15.94,15.94,0,0,1,184,224H72A15.94,15.94,0,0,1,56.8,212.9l-.06-.17-32-107.54a16,16,0,0,1,5.7-17.63l87.92-68.31.18-.14a15.93,15.93,0,0,1,18.92,0l.18.14,87.92,68.31A16,16,0,0,1,231.26,105.19Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
