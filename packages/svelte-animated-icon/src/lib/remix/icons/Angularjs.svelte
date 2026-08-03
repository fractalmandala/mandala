<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M12.0002 2L21.3002 5.32L19.8817 17.63L12.0002 22L4.11867 17.63L2.7002 5.32L12.0002 2ZM12.0002 4.21L6.18645 17.26H8.35412L9.52286 14.34H14.4576L15.6263 17.26H17.794L12.0002 4.21ZM13.6984 12.54H10.302L12.0002 8.45L13.6984 12.54Z"/></g>`,
		line: `<g fill="currentColor"><path d="M17.5235 16.6507L18.0126 16.3795L19.1315 6.66941L12.0002 4.12362L4.86892 6.66941L5.98781 16.3795L6.46166 16.6422L12.0002 4.21L17.5235 16.6507ZM16.4246 17.26H15.6263L14.4576 14.34H9.52286L8.35412 17.26H7.57582L12.0002 19.7131L16.4246 17.26ZM12.0002 2L21.3002 5.32L19.8817 17.63L12.0002 22L4.11867 17.63L2.7002 5.32L12.0002 2ZM13.6984 12.54L12.0002 8.45L10.302 12.54H13.6984Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
