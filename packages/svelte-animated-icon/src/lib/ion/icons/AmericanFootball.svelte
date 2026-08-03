<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><ellipse cx="256" cy="256" rx="267.57" ry="173.44" transform="translate(-106.04 256) rotate(-45)" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="334.04" y1="177.96" x2="177.96" y2="334.04" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="278.3" y1="278.3" x2="233.7" y2="233.7" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="322.89" y1="233.7" x2="278.3" y2="189.11" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="456.68" y1="211.4" x2="300.6" y2="55.32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="211.4" y1="456.68" x2="55.32" y2="300.6" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="233.7" y1="322.89" x2="189.11" y2="278.3" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M122.06,122.06c-44.37,44.37-66.71,100.61-78,145.28L244.66,467.9c44.67-11.25,100.91-33.59,145.28-78s66.71-100.61,78-145.28L267.34,44.1C222.67,55.35,166.43,77.69,122.06,122.06ZM378.79,378.78h0ZM300.65,189,323,166.71A15.78,15.78,0,0,1,345.29,189L323,211.35l11.16,11.17a15.78,15.78,0,0,1-22.32,22.32l-11.16-11.16L278.32,256l11.16,11.16a15.78,15.78,0,1,1-22.32,22.32L256,278.32l-22.32,22.33,11.16,11.16a15.78,15.78,0,1,1-22.32,22.32L211.35,323,189,345.29A15.78,15.78,0,0,1,166.71,323L189,300.65l-11.16-11.17a15.78,15.78,0,0,1,22.32-22.32l11.16,11.16L233.68,256l-11.16-11.16a15.78,15.78,0,1,1,22.32-22.32L256,233.68l22.32-22.33-11.16-11.16a15.78,15.78,0,0,1,22.32-22.32Z"/><path d="M476.57,199.63c7.31-54.53,4-120.26-20-144.21s-89.68-27.3-144.21-20c-2.51.34-5.16.72-7.91,1.15l171,171C475.85,204.79,476.23,202.14,476.57,199.63Z"/><path d="M35.43,312.37c-7.31,54.53-4,120.26,20,144.21C72.17,473.33,109.34,480,148.84,480a387,387,0,0,0,50.79-3.43c2.51-.34,5.16-.72,7.91-1.15l-171-171C36.15,307.21,35.77,309.86,35.43,312.37Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
