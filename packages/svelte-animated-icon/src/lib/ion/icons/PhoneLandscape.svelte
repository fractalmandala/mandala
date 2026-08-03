<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="128" y="16" width="256" height="480" rx="48" ry="48" transform="translate(0 512) rotate(-90)" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M16,336V312a8,8,0,0,1,8-8h0a16,16,0,0,0,16-16V224a16,16,0,0,0-16-16h0a8,8,0,0,1-8-8V176" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M0,176V336a64,64,0,0,0,64,64H448a64,64,0,0,0,64-64V176a64,64,0,0,0-64-64H64A64,64,0,0,0,0,176Zm448-32a32,32,0,0,1,32,32V336a32,32,0,0,1-32,32H64a32,32,0,0,1-32-32V324.65a7.94,7.94,0,0,1,4.75-7.3A32,32,0,0,0,56,288V224a32,32,0,0,0-19.25-29.35,7.94,7.94,0,0,1-4.75-7.3V176a32,32,0,0,1,32-32Z"/><path d="M48,176h0a11.88,11.88,0,0,0,4.69,9.53A48,48,0,0,1,72,224v64a48,48,0,0,1-19.31,38.47A11.88,11.88,0,0,0,48,336h0a16,16,0,0,0,16,16H448a16,16,0,0,0,16-16V176a16,16,0,0,0-16-16H64A16,16,0,0,0,48,176Z"/><path d="M0,176V336a64,64,0,0,0,64,64H448a64,64,0,0,0,64-64V176a64,64,0,0,0-64-64H64A64,64,0,0,0,0,176Zm448-32a32,32,0,0,1,32,32V336a32,32,0,0,1-32,32H64a32,32,0,0,1-32-32V324.65a7.94,7.94,0,0,1,4.75-7.3A32,32,0,0,0,56,288V224a32,32,0,0,0-19.25-29.35,7.94,7.94,0,0,1-4.75-7.3V176a32,32,0,0,1,32-32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
