<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 19v-9c-1.5 0-2-1.5-2-2.49997 0-.99997.5-2 2-2.50003 2.36416-.64329 4.2009-.97557 6-.98904 1.7991.01347 3.6358.34575 6 .98904 1.5.50003 2 1.50006 2 2.50003C20 8.5 19.5 10 18 10v9c0 .5523-.4477 1-1 1H7c-.55228 0-1-.4477-1-1Z"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" d="M11.9925 3.01102c-1.9214.01439-3.85188.37019-6.25505 1.0241-.01805.00491-.03595.01032-.05369.01624-.91244.30416-1.60323.7905-2.06 1.42998C3.16866 6.1185 3 6.83191 3 7.50006c0 .63697.15395 1.45811.5895 2.15498.31425.50276.78203.94286 1.4105 1.17356V19c0 1.1046.89543 2 2 2h10c1.1046 0 2-.8954 2-2v-8.1714c.6285-.2307 1.0962-.6708 1.4105-1.17356C20.846 8.95817 21 8.13703 21 7.50006c0-.66815-.1687-1.38156-.6238-2.01872-.4567-.63948-1.1475-1.12582-2.06-1.42998-.0177-.00592-.0356-.01133-.0536-.01624-2.4032-.65391-4.3337-1.00971-6.2551-1.0241h-.015Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
