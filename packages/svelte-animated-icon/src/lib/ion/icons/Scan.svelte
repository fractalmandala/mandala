<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M336,448h56a56,56,0,0,0,56-56V336" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M448,176V120a56,56,0,0,0-56-56H336" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M176,448H120a56,56,0,0,1-56-56V336" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M64,176V120a56,56,0,0,1,56-56h56" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M342,444h46a56,56,0,0,0,56-56V342" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:44"/><path d="M444,170V124a56,56,0,0,0-56-56H342" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:44"/><path d="M170,444H124a56,56,0,0,1-56-56V342" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:44"/><path d="M68,170V124a56,56,0,0,1,56-56h46" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:44"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
