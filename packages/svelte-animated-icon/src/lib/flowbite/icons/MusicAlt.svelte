<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16.5c0 1.3807-1.1193 2.5-2.5 2.5C8.11929 19 7 17.8807 7 16.5S8.11929 14 9.5 14c1.3807 0 2.5 1.1193 2.5 2.5Zm0 0V5c2.5 0 6 2.5 4.5 7"/></g>`,
		solid: `<g fill="currentColor"><path d="M9.5 13C7.567 13 6 14.567 6 16.5S7.567 20 9.5 20s3.5-1.567 3.5-3.5S11.433 13 9.5 13Z"/>
  <path fill-rule="evenodd" d="M11 5c0-.55228.4477-1 1-1 1.5438 0 3.3242.75435 4.5149 2.16836 1.2348 1.46632 1.7886 3.5834.9338 6.14784-.1747.524-.741.8071-1.2649.6325-.524-.1747-.8071-.741-.6325-1.2649.6452-1.93556.199-3.31848-.5662-4.22716C14.4407 6.8102 13.7107 6.37433 13 6.15825V16.5c0 .5523-.4477 1-1 1s-1-.4477-1-1V5Z" clip-rule="evenodd"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
