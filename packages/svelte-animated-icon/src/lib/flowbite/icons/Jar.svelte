<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 6H8m8 0s3 2.5 3 5m-3-5V3H8v3m0 0s-3 2.5-3 5v8.002C5 20.6589 6.34315 22 8 22h8c1.6569 0 3-1.3411 3-2.998V11m0 0h-8v7h8v-7ZM6 6h12"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" d="M7 3c0-.55228.44772-1 1-1h8c.5523 0 1 .44772 1 1v2h1c.5523 0 1 .44772 1 1 0 .44954-.2966.8298-.7048.95572.6113.76712 1.3165 1.84205 1.589 3.04428H11c-.5523 0-1 .4477-1 1v7c0 .5523.4477 1 1 1h9v.002C20 21.2121 18.2083 23 16 23H8c-2.20825 0-4-1.7879-4-3.998V11c0-1.59816.92812-3.06965 1.70483-4.04428C5.29662 6.82979 5 6.44954 5 6c0-.55228.44772-1 1-1h1V3Z"/>
  <path fill="currentColor" d="M20 17v-5h-8v5h8Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
