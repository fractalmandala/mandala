<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M48.07,96a8,8,0,0,1-7.89-9.72C46.68,55.55,83.52,32,128,32s81.32,23.55,87.82,54.28A8,8,0,0,1,207.93,96Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="24 176 68 160 108 176 148 160 188 176 232 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="24" y1="128" x2="232" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M208,168.73V184a32,32,0,0,1-32,32H80a32,32,0,0,1-32-32V167.27" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M48.07,96a8,8,0,0,1-7.89-9.72C46.68,55.55,83.52,32,128,32s81.32,23.55,87.82,54.28A8,8,0,0,1,207.93,96Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="24 176 68 160 108 176 148 160 188 176 232 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="24" y1="128" x2="232" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M208,168.73V184a32,32,0,0,1-32,32H80a32,32,0,0,1-32-32V167.27" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M35.58,98.06a16,16,0,0,1-3.23-13.44C39.78,49.5,80,24,128,24s88.22,25.5,95.65,60.62A16,16,0,0,1,207.93,104H48.07A16,16,0,0,1,35.58,98.06Zm193.68,54.42-41.13,15L151,152.57a8,8,0,0,0-5.94,0l-37,14.81L71,152.57a8,8,0,0,0-5.7-.09l-44,16a8,8,0,0,0,5.47,15L40,178.69V184a40,40,0,0,0,40,40h96a40,40,0,0,0,40-40v-9.67l18.73-6.81a8,8,0,1,0-5.47-15ZM24,136H232a8,8,0,0,0,0-16H24a8,8,0,0,0,0,16Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
