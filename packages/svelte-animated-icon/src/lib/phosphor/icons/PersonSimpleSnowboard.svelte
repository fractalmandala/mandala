<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="164" cy="52" r="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M28.44,177.67,185.88,223.3A17.25,17.25,0,0,0,208,206.82h0a17.19,17.19,0,0,0-12.44-16.49L38.12,144.7A17.25,17.25,0,0,0,16,161.18h0A17.19,17.19,0,0,0,28.44,177.67Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="80" y1="80" x2="216" y2="120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="131.28" y1="95.08" x2="88.47" y2="159.29" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="114.18 120.73 160 134 134.15 172.53" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="164" cy="52" r="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M28.44,177.67,185.88,223.3A17.25,17.25,0,0,0,208,206.82h0a17.19,17.19,0,0,0-12.44-16.49L38.12,144.7A17.25,17.25,0,0,0,16,161.18h0A17.19,17.19,0,0,0,28.44,177.67Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="80" y1="80" x2="216" y2="120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="131.28" y1="95.08" x2="88.47" y2="159.29" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="114.18 120.73 160 134 134.15 172.53" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M136,52a28,28,0,1,1,28,28A28,28,0,0,1,136,52Zm87.67,70.25a8,8,0,0,1-9.93,5.42l-79.07-23.26-7.78,11.67,35.33,10.23a8,8,0,0,1,4.42,12.14l-19.75,29.44,50.89,14.75A25.32,25.32,0,0,1,216,206.81,25.28,25.28,0,0,1,190.79,232a25.88,25.88,0,0,1-7.14-1L26.21,185.35A25.32,25.32,0,0,1,8,161.18,25.25,25.25,0,0,1,40.34,137l44.73,13,33.52-50.28-40.85-12a8,8,0,1,1,4.52-15.35l136,40A8,8,0,0,1,223.67,122.25ZM117.58,130l-16.4,24.6,29.58,8.58,16.49-24.59Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
