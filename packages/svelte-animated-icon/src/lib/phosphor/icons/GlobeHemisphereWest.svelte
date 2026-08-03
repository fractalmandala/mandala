<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M75.88,123.26,89.2,100a8,8,0,0,1,6.94-4h16.71a7.9,7.9,0,0,0,3.86-1L129,88.24a7.12,7.12,0,0,0,1.49-1.07l26.92-24.33A8,8,0,0,0,159,53l-10.5-18.81" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M67.78,53.23,56,81.08A8,8,0,0,0,55.88,87l11.5,30.67a8,8,0,0,0,5.81,5l21.43,4.61a8,8,0,0,1,5.52,4.33l3.8,7.87a8,8,0,0,0,7.2,4.51h13.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M213.09,172.48l-52.38-32.22a8.11,8.11,0,0,0-3.12-1.11l-22.82-3.08a8,8,0,0,0-8.38,4.67l-13.7,30.74a8,8,0,0,0,1.44,8.69l19.74,20.33a8,8,0,0,1,2,6.95l-3.17,16.44" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M75.88,123.26,89.2,100a8,8,0,0,1,6.94-4h16.71a7.9,7.9,0,0,0,3.86-1L129,88.24a7.12,7.12,0,0,0,1.49-1.07l26.92-24.33A8,8,0,0,0,159,53l-10.5-18.81" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M67.78,53.23,56,81.08A8,8,0,0,0,55.88,87l11.5,30.67a8,8,0,0,0,5.81,5l21.43,4.61a8,8,0,0,1,5.52,4.33l3.8,7.87a8,8,0,0,0,7.2,4.51h13.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M213.09,172.48l-52.38-32.22a8.11,8.11,0,0,0-3.12-1.11l-22.82-3.08a8,8,0,0,0-8.38,4.67l-13.7,30.74a8,8,0,0,0,1.44,8.69l19.74,20.33a8,8,0,0,1,2,6.95l-3.17,16.44" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
