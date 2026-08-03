<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M448,225.64v99a64,64,0,0,1-40.23,59.42l-23.68,9.47A32,32,0,0,0,364.6,417l-10,50.14A16,16,0,0,1,338.88,480H173.12a16,16,0,0,1-15.69-12.86L147.4,417a32,32,0,0,0-19.49-23.44l-23.68-9.47A64,64,0,0,1,64,324.67V224C64,118.08,149.77,32.19,255.65,32S448,119.85,448,225.64Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><circle cx="168" cy="280" r="40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><circle cx="344" cy="280" r="40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><polygon points="256 336 240 384 272 384 256 336" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="448" x2="256" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="208" y1="448" x2="208" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="304" y1="448" x2="304" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M402,76.94C362.61,37.63,310.78,16,256,16h-.37A208,208,0,0,0,48,224V324.67A79.62,79.62,0,0,0,98.29,399L122,408.42a15.92,15.92,0,0,1,9.75,11.72l10,50.13A32.09,32.09,0,0,0,173.12,496H184a8,8,0,0,0,8-8V448.45c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,224,448v40a8,8,0,0,0,8,8h0a8,8,0,0,0,8-8V448.45c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,272,448v40a8,8,0,0,0,8,8h0a8,8,0,0,0,8-8V448.45c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,320,448v40a8,8,0,0,0,8,8h10.88a32.09,32.09,0,0,0,31.38-25.72l10-50.14A16,16,0,0,1,390,408.42L413.71,399A79.62,79.62,0,0,0,464,324.67v-99C464,169.67,442,116.86,402,76.94ZM171.66,335.88a56,56,0,1,1,52.22-52.22A56,56,0,0,1,171.66,335.88ZM281,397.25A16.37,16.37,0,0,1,271.7,400H240.3a16.37,16.37,0,0,1-9.28-2.75,16,16,0,0,1-6.6-16.9l15.91-47.6C243,326,247.25,321,254,320.13c8.26-1,14,2.87,17.61,12.22l16,48A16,16,0,0,1,281,397.25Zm66.68-61.37a56,56,0,1,1,52.22-52.22A56,56,0,0,1,347.66,335.88Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
