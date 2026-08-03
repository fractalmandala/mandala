<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M154.14,156.75a36,36,0,1,1-48.3-53.12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M94,43l2-3h64l16,24h32a16,16,0,0,1,16,16V186" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M200.73,208H48a16,16,0,0,1-16-16V80A16,16,0,0,1,48,64H69.82" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M154.14,156.75a36,36,0,1,1-48.3-53.12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M94,43l2-3h64l16,24h32a16,16,0,0,1,16,16V186" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M200.73,208H48a16,16,0,0,1-16-16V80A16,16,0,0,1,48,64H69.82" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M232,80V192a24.52,24.52,0,0,1-.45,4.65,4,4,0,0,1-6.9,2L86,46.08a4,4,0,0,1-.37-4.91l3.74-5.61A8,8,0,0,1,96,32h64a8,8,0,0,1,6.66,3.56L180.28,56H208A24,24,0,0,1,232,80ZM213.92,210.62a8,8,0,1,1-11.84,10.76L197.19,216H48a24,24,0,0,1-24-24V80A24,24,0,0,1,48,56h3.73L42.08,45.38A8,8,0,1,1,53.92,34.62ZM148,161.92l-47.88-52.68A36,36,0,0,0,148,161.92Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
