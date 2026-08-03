<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M15.75 10.5L20.4697 5.78033C20.9421 5.30786 21.75 5.64248 21.75 6.31066V17.6893C21.75 18.3575 20.9421 18.6921 20.4697 18.2197L15.75 13.5M12 18.75H4.5C3.25736 18.75 2.25 17.7426 2.25 16.5V9M15.091 18.091L16.5 19.5M15.091 18.091C15.4982 17.6838 15.75 17.1213 15.75 16.5V7.5C15.75 6.25736 14.7426 5.25 13.5 5.25H4.5C3.87868 5.25 3.31618 5.50184 2.90901 5.90901M15.091 18.091L2.90901 5.90901M1.5 4.5L2.90901 5.90901" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path d="M0.96967 3.96967C1.26256 3.67678 1.73744 3.67678 2.03033 3.96967L17.0303 18.9697C17.3232 19.2626 17.3232 19.7374 17.0303 20.0303C16.7374 20.3232 16.2626 20.3232 15.9697 20.0303L0.96967 5.03033C0.676777 4.73744 0.676777 4.26256 0.96967 3.96967Z" fill="black"/>
<path d="M17.25 16.0606L19.9393 18.75C20.8843 19.6949 22.5 19.0257 22.5 17.6893V6.31063C22.5 4.97427 20.8843 4.30501 19.9393 5.24996L17.25 7.93931V16.0606Z" fill="black"/>
<path d="M15.75 7.5V15.568L4.68198 4.5H12.75C14.4069 4.5 15.75 5.84315 15.75 7.5Z" fill="black"/>
<path d="M1.5 16.5V7.68198L13.2727 19.4546C13.1029 19.4845 12.9283 19.5 12.75 19.5H4.5C2.84315 19.5 1.5 18.1569 1.5 16.5Z" fill="black"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
