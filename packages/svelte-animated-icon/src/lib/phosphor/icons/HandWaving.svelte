<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M96.65,62a20,20,0,0,1,34.64-20l30,52" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M69.32,94.67,55.08,70A20,20,0,0,1,89.73,50l31.17,54" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M158.87,160A40,40,0,0,1,168,105.58L161.32,94A20,20,0,0,1,196,74l17.31,30A80,80,0,0,1,74.7,184l-40-69.32a20,20,0,0,1,34.64-20L88.57,128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M192,33.78A51.84,51.84,0,0,1,223.67,58l.33.57" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M74.62,232A111.88,111.88,0,0,1,47,200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M96.65,62a20,20,0,0,1,34.64-20l30,52" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M69.32,94.67,55.08,70A20,20,0,0,1,89.73,50l31.17,54" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M158.87,160A40,40,0,0,1,168,105.58L161.32,94A20,20,0,0,1,196,74l17.31,30A80,80,0,0,1,74.7,184l-40-69.32a20,20,0,0,1,34.64-20L88.57,128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M192,33.78A51.84,51.84,0,0,1,223.67,58l.33.57" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M74.62,232A111.88,111.88,0,0,1,47,200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M219.31,98.46A88,88,0,1,1,67.08,186.77h0L26.15,115.88a16,16,0,0,1,27.69-16L72.4,132a8,8,0,0,0,13.86-8L47,56A16,16,0,0,1,74.69,40L114,108a8,8,0,1,0,13.85-8l-30-52a16,16,0,0,1,27.71-16L166,102.12A48.25,48.25,0,0,0,152,136a47.59,47.59,0,0,0,9.6,28.8,8,8,0,1,0,12.79-9.61A32,32,0,0,1,181,110.26a8,8,0,0,0,2.17-10.43L171.71,80a16,16,0,0,1,27.71-16l19.89,34.46Zm-29.37-57A43.74,43.74,0,0,1,216.74,62l.33.57a8,8,0,0,0,13.86-8L230.6,54a59.64,59.64,0,0,0-36.54-28,8,8,0,0,0-4.12,15.46ZM79.58,225.72A103.58,103.58,0,0,1,53.93,196a8,8,0,0,0-13.86,8,119.56,119.56,0,0,0,29.6,34.28,8,8,0,0,0,9.91-12.56Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
