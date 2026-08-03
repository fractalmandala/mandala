<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M53.12,199.94l400-151.39a8,8,0,0,1,10.33,10.33l-151.39,400a8,8,0,0,1-15-.34L229.66,292.45a16,16,0,0,0-10.11-10.11L53.46,215A8,8,0,0,1,53.12,199.94Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="460" y1="52" x2="227" y2="285" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M473,39.05a24,24,0,0,0-25.5-5.46L47.47,185l-.08,0a24,24,0,0,0,1,45.16l.41.13,137.3,58.63a16,16,0,0,0,15.54-3.59L422,80a7.07,7.07,0,0,1,10,10L226.66,310.26a16,16,0,0,0-3.59,15.54l58.65,137.38c.06.2.12.38.19.57,3.2,9.27,11.3,15.81,21.09,16.25.43,0,.58,0,1,0a24.63,24.63,0,0,0,23-15.46L478.39,64.62A24,24,0,0,0,473,39.05Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
