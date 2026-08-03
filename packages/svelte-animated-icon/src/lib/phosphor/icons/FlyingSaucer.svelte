<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="168" y1="192" x2="176" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="192" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="88" y1="192" x2="80" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M177,68.82C214.29,76.61,240,93,240,112c0,26.51-50.14,48-112,48S16,138.51,16,112c0-19,25.86-35.49,63.35-43.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M72,99.9a15.94,15.94,0,0,0,12.34,15.52A195.87,195.87,0,0,0,128,120a195.71,195.71,0,0,0,43.64-4.58A16,16,0,0,0,184,99.9V96a56,56,0,0,0-56.74-56C96.48,40.4,72,66.06,72,96.83Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="168" y1="192" x2="176" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="128" y1="192" x2="128" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="88" y1="192" x2="80" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M177,68.82C214.29,76.61,240,93,240,112c0,26.51-50.14,48-112,48S16,138.51,16,112c0-19,25.86-35.49,63.35-43.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M72,99.9a15.94,15.94,0,0,0,12.34,15.52A195.87,195.87,0,0,0,128,120a195.71,195.71,0,0,0,43.64-4.58A16,16,0,0,0,184,99.9V96a56,56,0,0,0-56.74-56C96.48,40.4,72,66.06,72,96.83Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M183.59,213.47a8,8,0,0,1-15.18,5.06l-8-24a8,8,0,0,1,15.18-5.06ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184Zm-37.47.41a8,8,0,0,0-10.12,5.06l-8,24a8,8,0,0,0,15.18,5.06l8-24A8,8,0,0,0,90.53,184.41ZM248,112c0,16.22-13.37,30.89-37.65,41.29C188.22,162.78,159,168,128,168s-60.22-5.22-82.35-14.71C21.37,142.89,8,128.22,8,112c0-8.37,3.67-20.79,21.17-32.5,11.37-7.61,26.94-13.76,45.18-17.85A63.64,63.64,0,0,1,173,50.45a64.84,64.84,0,0,1,9.11,11.3C223.43,71.09,248,89.74,248,112ZM176,96a47.66,47.66,0,0,0-6.06-23.35l-.06-.09A48.07,48.07,0,0,0,127.36,48C101.25,48.34,80,70.25,80,96.83v3a7.92,7.92,0,0,0,6.13,7.76A188.24,188.24,0,0,0,128,112a188.09,188.09,0,0,0,41.85-4.37A7.93,7.93,0,0,0,176,99.87Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
