<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="180" cy="116" r="12"/><line x1="112" y1="72" x2="152" y2="72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="216" y1="40" x2="144" y2="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M8,144a24,24,0,0,1,24-24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M220.34,96H224a16,16,0,0,1,16,16v32a16,16,0,0,1-16,16h-8l-18.1,50.69a8,8,0,0,1-7.54,5.31H177.64a8,8,0,0,1-7.54-5.31L166.29,200H97.71L93.9,210.69A8,8,0,0,1,86.36,216H73.64a8,8,0,0,1-7.54-5.31L53,174a79.7,79.7,0,0,1-21-54h0a80,80,0,0,1,80-80h32a80,80,0,0,1,73.44,48.22,82.22,82.22,0,0,1,2.9,7.78" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="180" cy="116" r="10"/><line x1="112" y1="72" x2="152" y2="72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="216" y1="40" x2="144" y2="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M8,144a24,24,0,0,1,24-24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M220.34,96H224a16,16,0,0,1,16,16v32a16,16,0,0,1-16,16h-8l-18.1,50.69a8,8,0,0,1-7.54,5.31H177.64a8,8,0,0,1-7.54-5.31L166.29,200H97.71L93.9,210.69A8,8,0,0,1,86.36,216H73.64a8,8,0,0,1-7.54-5.31L53,174a79.7,79.7,0,0,1-21-54h0a80,80,0,0,1,80-80h32a80,80,0,0,1,73.44,48.22,82.22,82.22,0,0,1,2.9,7.78" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M226,88.08c-.4-1-.82-2-1.25-3a87.93,87.93,0,0,0-30.17-37H216a8,8,0,0,0,0-16H112a88.12,88.12,0,0,0-87.72,81A32,32,0,0,0,0,144a8,8,0,0,0,16,0,16,16,0,0,1,8.57-14.16A87.69,87.69,0,0,0,46,178.22l12.56,35.16A16,16,0,0,0,73.64,224H86.36a16,16,0,0,0,15.07-10.62l1.92-5.38h57.3l1.92,5.38A16,16,0,0,0,177.64,224h12.72a16,16,0,0,0,15.07-10.62L221.64,168H224a24,24,0,0,0,24-24V112A24,24,0,0,0,226,88.08ZM152,72H112a8,8,0,0,1,0-16h40a8,8,0,0,1,0,16Zm28,56a12,12,0,1,1,12-12A12,12,0,0,1,180,128Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
