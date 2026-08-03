<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M186.54,186.54c-43,43-102.66,39.55-131.35,34.69a24.92,24.92,0,0,1-20.42-20.42c-4.86-28.69-8.29-88.37,34.69-131.35S172.12,29.91,200.81,34.77a24.92,24.92,0,0,1,20.42,20.42C226.09,83.88,229.52,143.56,186.54,186.54Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="128" x2="128" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="128" y1="104" x2="152" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="160" y1="96" x2="96" y2="160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="145.45" y1="33.45" x2="222.55" y2="110.55" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="33.45" y1="145.45" x2="110.55" y2="222.55" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M186.54,186.54c-43,43-102.66,39.55-131.35,34.69a24.92,24.92,0,0,1-20.42-20.42c-4.86-28.69-8.29-88.37,34.69-131.35S172.12,29.91,200.81,34.77a24.92,24.92,0,0,1,20.42,20.42C226.09,83.88,229.52,143.56,186.54,186.54Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="104" y1="128" x2="128" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="128" y1="104" x2="152" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="160" y1="96" x2="96" y2="160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="145.45" y1="33.45" x2="222.55" y2="110.55" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="33.45" y1="145.45" x2="110.55" y2="222.55" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M229.06,53.89a32.92,32.92,0,0,0-26.95-26.95c-32.38-5.49-93.39-8-138.27,36.9s-42.39,105.9-36.9,138.27a32.92,32.92,0,0,0,27,26.95A206.58,206.58,0,0,0,88.27,232c32.09,0,72.05-8,103.89-39.84C237.05,147.28,234.55,86.26,229.06,53.89ZM56.56,213.3A16.94,16.94,0,0,1,42.7,199.44a180.27,180.27,0,0,1-2.11-46.9l62.87,62.87A180.27,180.27,0,0,1,56.56,213.3ZM165.64,101.67,151.3,116l6.34,6.34a8,8,0,1,1-11.31,11.3L140,127.31,127.31,140l6.34,6.34a8,8,0,1,1-11.3,11.31L116,151.3l-14.34,14.34a8,8,0,1,1-11.31-11.31L104.7,140l-6.34-6.34a8,8,0,0,1,11.31-11.3l6.34,6.34L128.69,116l-6.34-6.34a8,8,0,0,1,11.3-11.31L140,104.7l14.34-14.34a8,8,0,1,1,11.31,11.31Zm49.77,1.79L152.54,40.59c4.76-.44,9.72-.69,14.91-.69a192,192,0,0,1,32,2.8A16.94,16.94,0,0,1,213.3,56.56,180.27,180.27,0,0,1,215.41,103.46Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
