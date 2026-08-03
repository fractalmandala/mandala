<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M44,192H60a20,20,0,0,0,0-40H44v56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M48,112V40a8,8,0,0,1,8-8h96l56,56v24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="152 32 152 88 208 88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M208,184h8v16.87A22.12,22.12,0,0,1,200,208c-13.25,0-24-12.54-24-28s10.75-28,24-28a21.28,21.28,0,0,1,12,3.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="108 208 108 152 148 208 148 152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M48,112V40a8,8,0,0,1,8-8h96l56,56v24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="152 32 152 88 208 88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M44,192H60a20,20,0,0,0,0-40H44v56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M208,184h8v16.87A22.12,22.12,0,0,1,200,208c-13.25,0-24-12.54-24-28s10.75-28,24-28a21.28,21.28,0,0,1,12,3.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="108 208 108 152 148 208 148 152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M44,120H212a4,4,0,0,0,4-4V88a8,8,0,0,0-2.34-5.66l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40v76A4,4,0,0,0,44,120ZM152,44l44,44H152ZM60,144H44a8,8,0,0,0-8,8v55.72A8.17,8.17,0,0,0,43.47,216,8,8,0,0,0,52,208v-8h7.4c15.24,0,28.14-11.92,28.59-27.15A28,28,0,0,0,60,144Zm-.35,40H52V160h8a12,12,0,0,1,12,13.16A12.25,12.25,0,0,1,59.65,184ZM224,200.87a8,8,0,0,1-2.26,5.57A30.07,30.07,0,0,1,200,216c-17.64,0-32-16.15-32-36s14.36-36,32-36a29.36,29.36,0,0,1,16.09,4.86,8.21,8.21,0,0,1,3,10.64,8,8,0,0,1-11.55,2.88A13.21,13.21,0,0,0,200,160c-8.82,0-16,9-16,20s7.18,20,16,20a13.57,13.57,0,0,0,8-2.72V192a8,8,0,0,1-8-8.53,8.17,8.17,0,0,1,8.25-7.47H216a8,8,0,0,1,8,8ZM156,152v55.76a8.22,8.22,0,0,1-4.12,7.24,8,8,0,0,1-10.39-2.35L116,177v30.76a8.17,8.17,0,0,1-7.47,8.26,8,8,0,0,1-8.53-8V152.31a8.27,8.27,0,0,1,4.53-7.52,8,8,0,0,1,10,2.56L140,183V152.27a8.17,8.17,0,0,1,7.47-8.25A8,8,0,0,1,156,152Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
