<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="80" y="16" width="352" height="480" rx="48" ry="48" transform="translate(0 512) rotate(-90)" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M512,128V384a64.07,64.07,0,0,1-64,64H64A64.07,64.07,0,0,1,0,384V128A64.07,64.07,0,0,1,64,64H448A64.07,64.07,0,0,1,512,128ZM32,384a32,32,0,0,0,32,32H448a32,32,0,0,0,32-32V128a32,32,0,0,0-32-32H64a32,32,0,0,0-32,32Z"/><path d="M0,128A64.07,64.07,0,0,1,64,64H448a64.07,64.07,0,0,1,64,64V384a64.07,64.07,0,0,1-64,64H64A64.07,64.07,0,0,1,0,384V128M480,384V128a32,32,0,0,0-32-32H64a32,32,0,0,0-32,32V384a32,32,0,0,0,32,32H448a32,32,0,0,0,32-32m-16,0a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V128a16,16,0,0,1,16-16H448a16,16,0,0,1,16,16V384Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
