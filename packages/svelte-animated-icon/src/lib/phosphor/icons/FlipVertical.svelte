<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M59.12,32.64A8,8,0,0,0,48,40v64a8,8,0,0,0,8,8H216c8.72,0,11.15-12,3.12-15.37Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M219.11,159.37c8-3.4,5.6-15.37-3.12-15.37H56a8,8,0,0,0-8,8v64a8,8,0,0,0,11.12,7.37Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M59.12,32.64A8,8,0,0,0,48,40v64a8,8,0,0,0,8,8H216c8.72,0,11.15-12,3.12-15.37Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M219.11,159.37c8-3.4,5.6-15.37-3.12-15.37H56a8,8,0,0,0-8,8v64a8,8,0,0,0,11.12,7.37Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M56,120H216a16,16,0,0,0,6.23-30.74l-.14-.06-159.93-64A16,16,0,0,0,40,40v64A16,16,0,0,0,56,120Zm0-80,.15.06L216,104H56l0-64ZM231.67,148.82a15.85,15.85,0,0,1-9.45,17.92l-.14.06-159.93,64A16,16,0,0,1,40,216V152a16,16,0,0,1,16-16H216A15.85,15.85,0,0,1,231.67,148.82Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
