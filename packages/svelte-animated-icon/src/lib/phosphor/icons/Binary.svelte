<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><ellipse cx="94" cy="72" rx="30" ry="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><ellipse cx="166" cy="184" rx="30" ry="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="176 112 176 32 152 45.33" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="96 224 96 144 72 157.33" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><ellipse cx="94" cy="72" rx="30" ry="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><ellipse cx="166" cy="184" rx="30" ry="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="176 112 176 32 152 45.33" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="96 224 96 144 72 157.33" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M168,168c0,4.75-1.11,9.16-3.05,12.11A7.77,7.77,0,0,1,158,184c-9.72,0-10-14.36-10-16,0-4.74,1.11-9.16,3.05-12.11A7.77,7.77,0,0,1,158,152C167.72,152,168,166.36,168,168ZM224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM140.84,75.58a8,8,0,0,0,10.74,3.58L156,76.94V112a8,8,0,0,0,16,0V64a8,8,0,0,0-11.58-7.16l-16,8A8,8,0,0,0,140.84,75.58ZM112,144a8,8,0,0,0-11.58-7.16l-16,8a8,8,0,0,0,7.16,14.32L96,156.94V192a8,8,0,0,0,16,0Zm16-56c0-18.84-10.69-32-26-32S76,69.16,76,88s10.69,32,26,32S128,106.84,128,88Zm56,80c0-18.84-10.69-32-26-32s-26,13.16-26,32,10.69,32,26,32S184,186.84,184,168ZM102,72a7.77,7.77,0,0,0-7,3.89c-1.94,3-3,7.37-3,12.11,0,1.64.28,16,10,16a7.77,7.77,0,0,0,7-3.89c1.94-3,3-7.36,3-12.11C112,86.36,111.72,72,102,72Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
