<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M12 5V2H10V5H4C3.44772 5 3 5.44772 3 6V14C3 14.5523 3.44772 15 4 15H17.4142L21.7071 10.7071C22.0976 10.3166 22.0976 9.68342 21.7071 9.29289L17.4142 5H12ZM12 17H10V22H12V17Z"/></g>`,
		line: `<g fill="currentColor"><path d="M12 5H17.4142L21.7071 9.29289C22.0976 9.68342 22.0976 10.3166 21.7071 10.7071L17.4142 15H12V22H10V15H4C3.44772 15 3 14.5523 3 14V6C3 5.44772 3.44772 5 4 5H10V2H12V5ZM16.5858 13L19.5858 10L16.5858 7H5V13H16.5858Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
