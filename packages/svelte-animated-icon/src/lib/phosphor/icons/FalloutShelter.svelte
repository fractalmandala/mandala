<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polygon points="96 80 160 80 128 128 96 80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polygon points="128 128 192 128 160 176 128 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polygon points="64 128 128 128 96 176 64 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polygon points="96 80 160 80 128 128 96 80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polygon points="128 128 192 128 160 176 128 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polygon points="64 128 128 128 96 176 64 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M231.94,124.55c-1.77-54.49-46-98.72-100.49-100.49A104.09,104.09,0,0,0,24.06,131.45c1.77,54.49,46,98.72,100.49,100.49A104.09,104.09,0,0,0,231.94,124.55Zm-33.56,16.92L174.93,174.3a8.52,8.52,0,0,1-13.86,0L128,128,94.93,174.3a8.52,8.52,0,0,1-13.86,0L57.62,141.47A8.52,8.52,0,0,1,64.55,128H128L97.62,85.47A8.52,8.52,0,0,1,104.55,72h46.9a8.52,8.52,0,0,1,6.93,13.47L128,128h63.45A8.52,8.52,0,0,1,198.38,141.47Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
