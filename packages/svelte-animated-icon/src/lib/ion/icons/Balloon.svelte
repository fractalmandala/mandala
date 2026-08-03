<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M414.11,153.82C429.66,264.4,345.85,357.09,282.54,366s-169.48-57.5-185-167.68a159.82,159.82,0,1,1,316.53-44.49Z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path d="M236.06,308.05c-32.83-13-67.08-43.1-82.27-85.46" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32"/><path d="M367.7,495.78c-32.83-13-63.31-40.06-78.5-82.41" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32"/><polygon points="266.71 368.21 257.54 417.82 320.85 408.92 298.36 363.76 266.71 368.21" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></g>`,
		filled: `<g fill="currentColor"><path d="M391,307.27c32.75-46.35,46.59-101.63,39-155.68A175.82,175.82,0,0,0,231.38,2c-96,13.49-163.14,102.58-149.65,198.58,7.57,53.89,36.12,103.16,80.37,138.74C186.68,359,214.41,372.82,240.72,379a8,8,0,0,1,6,9.22l-4.87,26.38a16.29,16.29,0,0,0,1.48,10.57,16,16,0,0,0,14.2,8.61,15.21,15.21,0,0,0,2.23-.16l17.81-2.5a2,2,0,0,1,2.09,1.14c16.72,36.31,45.46,63.85,82.15,78.36a16,16,0,0,0,21-9.65c2.83-8.18-1.64-17.07-9.68-20.28a118.57,118.57,0,0,1-59.3-51.88,2,2,0,0,1,1.45-3l7.4-1a16.54,16.54,0,0,0,10.08-5.23,16,16,0,0,0,2.39-17.8l-12.06-24.23A8,8,0,0,1,326.35,367C349.94,353.83,372.8,333,391,307.27Zm-154.9,16.78a16,16,0,0,1-5.88-1.12c-41.26-16.32-76.3-52.7-91.45-94.94a16,16,0,1,1,30.12-10.8c14.5,40.44,47.27,65.77,73.1,76a16,16,0,0,1-5.89,30.88Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
