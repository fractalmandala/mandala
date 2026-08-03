<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="112" y="48" width="288" height="416" rx="32" ry="32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><rect x="160.01" y="112" width="191.99" height="64" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="168" cy="248" r="24"/><circle cx="256" cy="248" r="24"/><circle cx="344" cy="248" r="24"/><circle cx="168" cy="328" r="24"/><circle cx="256" cy="328" r="24"/><circle cx="168" cy="408" r="24"/><circle cx="256" cy="408" r="24"/><rect x="320" y="304" width="48" height="128" rx="24" ry="24"/></g>`,
		filled: `<g fill="currentColor"><path d="M416,80a48.05,48.05,0,0,0-48-48H144A48.05,48.05,0,0,0,96,80V432a48.05,48.05,0,0,0,48,48H368a48.05,48.05,0,0,0,48-48ZM168,432a24,24,0,1,1,24-24A24,24,0,0,1,168,432Zm0-80a24,24,0,1,1,24-24A24,24,0,0,1,168,352Zm0-80a24,24,0,1,1,24-24A24,24,0,0,1,168,272Zm88,160a24,24,0,1,1,24-24A24,24,0,0,1,256,432Zm0-80a24,24,0,1,1,24-24A24,24,0,0,1,256,352Zm0-80a24,24,0,1,1,24-24A24,24,0,0,1,256,272ZM368,408a24,24,0,0,1-48,0V328a24,24,0,0,1,48,0ZM344,272a24,24,0,1,1,24-24A24,24,0,0,1,344,272Zm19.31-100.69A16,16,0,0,1,352,176H160a16,16,0,0,1-16-16V96a16,16,0,0,1,16-16H352a16,16,0,0,1,16,16v64A16,16,0,0,1,363.31,171.31Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
