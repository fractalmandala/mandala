<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><polyline points="368 192 256.13 320 208.18 272" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="191.95" y1="320" x2="144" y2="272" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="305.71" y1="192" x2="254.16" y2="251" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M258.9,48C141.92,46.42,46.42,141.92,48,258.9,49.56,371.09,140.91,462.44,253.1,464c117,1.6,212.48-93.9,210.88-210.88C462.44,140.91,371.09,49.56,258.9,48ZM242.11,240.47l51.55-59a16,16,0,0,1,24.1,21.06l-51.55,59a16,16,0,1,1-24.1-21.06Zm-38.86,90.85a16,16,0,0,1-22.62,0l-47.95-48a16,16,0,1,1,22.64-22.62l48,48A16,16,0,0,1,203.25,331.32Zm176.8-128.79-111.88,128A16,16,0,0,1,256.66,336h-.54a16,16,0,0,1-11.32-4.69l-47.94-48a16,16,0,1,1,22.64-22.62l29.8,29.83a8,8,0,0,0,11.68-.39l95-108.66a16,16,0,0,1,24.1,21.06Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
