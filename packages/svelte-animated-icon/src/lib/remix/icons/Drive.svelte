<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M7.94037 4.14596L11.4217 10.1759L5.48201 20.4688L2 14.44L7.94037 4.14596ZM10.1161 14.44H22L18.518 20.4688H6.63537L10.1161 14.44ZM14.4589 13.4399L8.51799 3.14502H15.482L21.4229 13.4399H14.4589Z"/></g>`,
		line: `<g fill="currentColor"><path d="M9.09742 6.15015L4.31009 14.4431L6.06471 17.4746L10.8502 9.18597L9.09742 6.15015ZM7.79701 18.4742H17.3651L19.1162 15.44H9.54877L7.79701 18.4742ZM19.1109 13.44L14.3252 5.15002H10.8294L15.6156 13.44H19.1109ZM8.52 3.15002H15.48L22 14.4444L18.52 20.4742H5.49L2 14.4444L8.52 3.15002ZM12.0049 11.186L10.7035 13.44H13.3062L12.0049 11.186Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
