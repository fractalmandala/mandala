<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="256" cy="184" r="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><line x1="256" y1="336" x2="256" y2="480" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><line x1="314" y1="416" x2="198" y2="416" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></g>`,
		filled: `<g fill="currentColor"><path d="M430,190c0-95.94-78.06-174-174-174S82,94.06,82,190c0,88.49,66.4,161.77,152,172.61V394H198a22,22,0,0,0,0,44h36v36a22,22,0,0,0,44,0V438h36a22,22,0,0,0,0-44H278V362.61C363.6,351.77,430,278.49,430,190Zm-304,0c0-71.68,58.32-130,130-130s130,58.32,130,130S327.68,320,256,320,126,261.68,126,190Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
