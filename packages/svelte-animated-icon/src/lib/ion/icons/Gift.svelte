<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M256,104v56h56a56,56,0,1,0-56-56Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M256,104c0,15.46,0,56,0,56H200a56,56,0,1,1,56-56Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><rect x="64" y="160" width="384" height="112" rx="32" ry="32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M416,272V416a48,48,0,0,1-48,48H144a48,48,0,0,1-48-48V272" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="160" x2="256" y2="464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M200,144h40V104a40,40,0,1,0-40,40Z" style="fill:none"/><path d="M352,104a40,40,0,0,0-80,0v40h40A40,40,0,0,0,352,104Z" style="fill:none"/><path d="M80,416a64,64,0,0,0,64,64h92a4,4,0,0,0,4-4V292a4,4,0,0,0-4-4H88a8,8,0,0,0-8,8Z"/><path d="M240,252V144h32V252a4,4,0,0,0,4,4H416a47.93,47.93,0,0,0,16-2.75h0A48.09,48.09,0,0,0,464,208V192a48,48,0,0,0-48-48H375.46a2,2,0,0,1-1.7-3A72,72,0,0,0,256,58.82,72,72,0,0,0,138.24,141a2,2,0,0,1-1.7,3H96a48,48,0,0,0-48,48v16a48.09,48.09,0,0,0,32,45.25h0A47.93,47.93,0,0,0,96,256H236A4,4,0,0,0,240,252Zm32-148a40,40,0,1,1,40,40H272ZM197.14,64.1A40,40,0,0,1,240,104v40H200a40,40,0,0,1-2.86-79.89Z"/><path d="M276,480h92a64,64,0,0,0,64-64V296a8,8,0,0,0-8-8H276a4,4,0,0,0-4,4V476A4,4,0,0,0,276,480Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
