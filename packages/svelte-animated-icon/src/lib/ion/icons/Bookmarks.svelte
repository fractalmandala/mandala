<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M128,80V64a48.14,48.14,0,0,1,48-48H400a48.14,48.14,0,0,1,48,48V432l-80-64" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><path d="M320,96H112a48.14,48.14,0,0,0-48,48V496L216,368,368,496V144A48.14,48.14,0,0,0,320,96Z" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M400,0H176a64.11,64.11,0,0,0-62,48H342a74,74,0,0,1,74,74V426.89l22,17.6a16,16,0,0,0,19.34.5A16.41,16.41,0,0,0,464,431.57V64A64,64,0,0,0,400,0Z"/><path d="M320,80H112a64,64,0,0,0-64,64V495.62A16.36,16.36,0,0,0,54.6,509a16,16,0,0,0,19.71-.71L216,388.92,357.69,508.24a16,16,0,0,0,19.6.79A16.4,16.4,0,0,0,384,495.59V144A64,64,0,0,0,320,80Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
