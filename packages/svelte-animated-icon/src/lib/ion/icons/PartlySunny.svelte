<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M90.61,306.85A16.07,16.07,0,0,0,104,293.6C116.09,220.17,169.63,176,232,176c57.93,0,96.62,37.75,112.2,77.74a15.84,15.84,0,0,0,12.2,9.87c50,8.15,91.6,41.54,91.6,99.59C448,422.6,399.4,464,340,464H106c-49.5,0-90-24.7-90-79.2C16,336.33,54.67,312.58,90.61,306.85Z" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><path d="M384.8,271.4a80,80,0,1,0-123.55-92" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="464" y1="208" x2="496" y2="208" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="336" y1="48" x2="336" y2="80" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="222.86" y1="94.86" x2="245.49" y2="117.49" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="449.14" y1="94.86" x2="426.51" y2="117.49" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M340,480H106c-29.5,0-54.92-7.83-73.53-22.64C11.23,440.44,0,415.35,0,384.8c0-26.66,10.08-49.8,29.14-66.91,15.24-13.68,36.17-23.21,59-26.84h0c.06,0,.08,0,.09-.05,6.44-39,23.83-72.09,50.31-95.68A140.24,140.24,0,0,1,232,160c30.23,0,58.48,9.39,81.71,27.17a142.24,142.24,0,0,1,42.19,53.21,16,16,0,0,0,11.19,9c26,5.61,48.4,17.29,65.17,34C453,304.11,464,331.71,464,363.2c0,32.85-13.13,62.87-37,84.52C404.11,468.54,373.2,480,340,480Zm19-232.18Z"/><path d="M387.89,221.68a168.8,168.8,0,0,1,34.76,14.71,4,4,0,0,0,5.82-2.44A97,97,0,0,0,432,207.27c-.39-52.43-43.48-95.22-95.91-95.27A95.46,95.46,0,0,0,281,129.33l-.06,0a3.38,3.38,0,0,0,1,6,162.45,162.45,0,0,1,51.28,26.4,173.92,173.92,0,0,1,45.32,52.51A16,16,0,0,0,387.89,221.68Z"/><path d="M496,224H464a16,16,0,0,1,0-32h32a16,16,0,0,1,0,32Z"/><path d="M336,96a16,16,0,0,1-16-16V48a16,16,0,0,1,32,0V80A16,16,0,0,1,336,96Z"/><path d="M245.49,133.49a15.92,15.92,0,0,1-11.31-4.69l-22.63-22.62a16,16,0,0,1,22.63-22.63l22.62,22.63a16,16,0,0,1-11.31,27.31Z"/><path d="M426.51,133.49a16,16,0,0,1-11.31-27.31l22.62-22.63a16,16,0,0,1,22.63,22.63L437.82,128.8A15.92,15.92,0,0,1,426.51,133.49Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
