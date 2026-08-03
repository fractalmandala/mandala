<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M11.9901 16.4996L8.23975 20.2495M8.23975 20.2495L4.48939 16.4996M8.23975 20.2495L8.23975 3.75L19.4907 3.75" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.2397 3.75001C20.2397 4.16423 19.9039 4.50002 19.4897 4.50002L8.98877 4.50002L8.98877 18.4389L11.4588 15.9693C11.7517 15.6764 12.2266 15.6764 12.5195 15.9693C12.8124 16.2622 12.8123 16.7371 12.5194 17.03L8.76906 20.7799C8.47616 21.0727 8.00131 21.0727 7.7084 20.7799L3.95804 17.03C3.66512 16.7371 3.6651 16.2622 3.95799 15.9693C4.25089 15.6764 4.72578 15.6764 5.0187 15.9693L7.4887 18.4389L7.4887 3.75001C7.4887 3.33579 7.8245 3 8.23873 3L19.4897 3C19.9039 3 20.2397 3.33579 20.2397 3.75001Z" fill="black"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
