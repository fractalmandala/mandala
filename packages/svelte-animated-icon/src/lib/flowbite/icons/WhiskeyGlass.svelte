<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 14h10M6 7l.84717 10.1661C6.93356 18.2027 7.80009 19 8.84027 19h6.31943c1.0402 0 1.9067-.7973 1.9931-1.8339L18 7H6Z"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" fill-rule="evenodd" d="M6 6c-.27965 0-.54652.1171-.73588.32289-.18935.20579-.28389.48147-.26066.76016l.84717 10.16605C5.9802 18.804 7.28 20 8.84027 20h6.31943c1.5603 0 2.8601-1.196 2.9897-2.7509l.8471-10.16605c.0233-.27869-.0713-.55437-.2606-.76016C18.5465 6.1171 18.2797 6 18 6H6Zm1.50347 7L7.0868 8h9.8264l-.4167 5H7.50347Z" clip-rule="evenodd"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
