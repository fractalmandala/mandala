<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14c2.7614 0 5-2.6679 5-5.42928C17 7.18458 15.8809 4.06255 15.5 3h-7C8.15198 4.02095 7 7.17202 7 8.57072 7 11.3321 9.23858 14 12 14Zm0 0v7m-3 0h6"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" d="M8.5 2c-.42794 0-.80845.2723-.94652.67736-.03443.10101-.07815.2268-.12882.3726-.1952.56172-.4936 1.42039-.76192 2.30283C6.33766 6.42192 6 7.69926 6 8.57072c0 2.88418 2.09201 5.78348 5 6.33548V20H9c-.55228 0-1 .4477-1 1s.44772 1 1 1h6c.5523 0 1-.4477 1-1s-.4477-1-1-1h-2v-5.0938c2.908-.552 5-3.4513 5-6.33548 0-.86275-.3278-2.12695-.6497-3.1952-.3348-1.11124-.7167-2.17674-.9075-2.70901l-.0015-.00395C16.2989 2.26514 15.9222 2 15.5 2h-7Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
