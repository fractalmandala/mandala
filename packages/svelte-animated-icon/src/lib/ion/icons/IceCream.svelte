<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><polyline points="352 256 256 480 194 335" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M299.42,223.48C291.74,239.75,275.18,252,256,252c-13.1,0-27-5-33.63-9.76C216.27,237.87,208,240,208,250v62a24.07,24.07,0,0,1-24,24h0a24.07,24.07,0,0,1-24-24V256h-2c-35.35,0-62-28.65-62-64a64,64,0,0,1,64-64h8v-8a88,88,0,0,1,176,0v8h8a64,64,0,0,1,0,128c-21.78,0-42-13-52.59-32.51Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M183,352c-21.84-.52-39-18.9-39-40.74V277.19a8,8,0,0,0-6-7.74C104.25,260.6,80,229.74,80,192a80.14,80.14,0,0,1,66.27-78.82,8,8,0,0,0,6.62-6.83,104,104,0,0,1,206.22,0,8,8,0,0,0,6.62,6.83A80,80,0,0,1,352,272a74.33,74.33,0,0,1-47.45-17.41,7.93,7.93,0,0,0-9.92-.14A62.89,62.89,0,0,1,256,268a80.47,80.47,0,0,1-21.8-3.18,8,8,0,0,0-10.2,7.69V312A40,40,0,0,1,183,352Z"/><path d="M263.39,299.7a8,8,0,0,0-7.39,7.91V312a72.11,72.11,0,0,1-50.69,68.76,8,8,0,0,0-4.91,10.78l40.91,94.8A16,16,0,0,0,256,496h0a16,16,0,0,0,14.69-9.7l73.78-172.15a8,8,0,0,0-6.2-11.07,106.31,106.31,0,0,1-35.9-11.59,8,8,0,0,0-7.13-.2A95,95,0,0,1,263.39,299.7Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
