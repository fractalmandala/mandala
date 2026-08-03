<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM9.86885 15H14.1311L14.9508 17H17.1667L13 7H11L6.83333 17H9.04918L9.86885 15ZM10.6885 13L12 9.8L13.3115 13H10.6885Z"/></g>`,
		line: `<g fill="currentColor"><path d="M5 5V19H19V5H5ZM4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM9.86885 15L9.04918 17H6.83333L11 7H13L17.1667 17H14.9508L14.1311 15H9.86885ZM10.6885 13H13.3115L12 9.8L10.6885 13Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
