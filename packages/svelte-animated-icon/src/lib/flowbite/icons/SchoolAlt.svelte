<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="m7.14284 11 4.99996-6 5 6m-9.99996 0h-3v8H20.1428v-8h-3m-9.99996 0H3.14285l3-4h4.33735l-3.33736 4Zm9.99996 0h4l-3-4h-4.3374l3.3374 4Zm-3 2c0 1.1046-.8954 2-2 2-1.1045 0-2-.8954-2-2s.8955-2 2-2c1.1046 0 2 .8954 2 2Z"/></g>`,
		solid: `<g fill="currentColor"><path d="M12 12c-.5523 0-1 .4477-1 1s.4477 1 1 1 1-.4477 1-1-.4477-1-1-1Z"/>
  <path fill-rule="evenodd" d="M6.65111 11.6306 12 5.04736l5.3489 6.58324c.1899.2337.475.3694.7761.3694H21v7c0 .5523-.4477 1-1 1H4c-.55228 0-1-.4477-1-1v-7h2.87499c.30113 0 .58623-.1357.77612-.3694ZM8.99999 13c0-1.6568 1.34311-3 3.00001-3 1.6568 0 3 1.3432 3 3 0 1.6569-1.3432 3-3 3-1.6569 0-3.00001-1.3431-3.00001-3Z" clip-rule="evenodd"/>
  <path d="m2.5 10 2.7-3.59999c.18885-.2518.48524-.4.8-.4h2.64902L5.39902 10H2.5Zm12.851-3.99999L18.601 10H21.5l-2.7-3.59999c-.1888-.2518-.4852-.4-.8-.4h-2.649Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
