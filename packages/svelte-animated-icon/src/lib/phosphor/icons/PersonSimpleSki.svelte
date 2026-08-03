<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="172" cy="60" r="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152.94" y1="112.94" x2="40" y2="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="200 120 160 120 128 88 114.32 101.68" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="88 128 144 144 104.52 183.48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M232,197.6a61.94,61.94,0,0,1-51.69,7.92L24,160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="172" cy="60" r="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="152.94" y1="112.94" x2="40" y2="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="200 120 160 120 128 88 114.32 101.68" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="88 128 144 144 104.52 183.48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M232,197.6a61.94,61.94,0,0,1-51.69,7.92L24,160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M144,60a28,28,0,1,1,28,28A28,28,0,0,1,144,60ZM37.76,87.68l111,32.36,5.61,5.61A8,8,0,0,0,160,128h40a8,8,0,0,0,0-16H163.31l-4.72-4.72,0,0-24.9-24.9a8,8,0,0,0-11.32,0L112,92.67,42.24,72.32a8,8,0,0,0-4.48,15.36Zm200.9,105.47a8,8,0,0,0-11.1-2.22,53.78,53.78,0,0,1-45,6.9l-62.79-18.28,29.9-29.9a8,8,0,0,0-3.46-13.35l-56-16a8,8,0,0,0-4.4,15.39L128.73,148l-26.5,26.49-76-22.13a8,8,0,1,0-4.48,15.36l156.31,45.52a69.78,69.78,0,0,0,58.37-8.95A8,8,0,0,0,238.66,193.15Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
