<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M68.4,192A20.38,20.38,0,0,0,48,212.2a17.87,17.87,0,0,0,.8,5.5L100.5,400a40.46,40.46,0,0,0,39.1,29.5H372.4A40.88,40.88,0,0,0,411.7,400l51.7-182.3.6-5.5A20.38,20.38,0,0,0,443.6,192H68.4ZM261.72,352.07A42.07,42.07,0,1,1,304,310,42.27,42.27,0,0,1,261.72,352.07Z" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><polyline points="160 192 256 64 352 192" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M424.11,192H360L268.8,70.4a16,16,0,0,0-25.6,0L152,192H87.89a32.57,32.57,0,0,0-32.62,32.44,30.3,30.3,0,0,0,1.31,9l46.27,163.14a50.72,50.72,0,0,0,48.84,36.91H360.31a51.21,51.21,0,0,0,49-36.86l46.33-163.36a15.62,15.62,0,0,0,.46-2.36l.53-4.93a13.3,13.3,0,0,0,.09-1.55A32.57,32.57,0,0,0,424.11,192ZM256,106.67,320,192H192Zm0,245a37.7,37.7,0,1,1,37.88-37.7A37.87,37.87,0,0,1,256,351.63Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
