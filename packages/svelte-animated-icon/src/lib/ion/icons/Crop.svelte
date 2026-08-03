<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M144,48V320a48,48,0,0,0,48,48H464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M368,304V192a48,48,0,0,0-48-48H208" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="368" y1="368" x2="368" y2="464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="144" y1="144" x2="48" y2="144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M458,346H192a26,26,0,0,1-26-26V54a22,22,0,0,0-44,0v68H54a22,22,0,0,0,0,44h68V320a70.08,70.08,0,0,0,70,70H346v68a22,22,0,0,0,44,0V390h68a22,22,0,0,0,0-44Z"/><path d="M214,166H320a26,26,0,0,1,26,26V298a22,22,0,0,0,44,0V192a70.08,70.08,0,0,0-70-70H214a22,22,0,0,0,0,44Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
