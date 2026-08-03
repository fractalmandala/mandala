<script lang="ts" module>
	export type LoaderIconProps = {
		/** SVG width/height in CSS pixels. Default `16`. */
		size?: number;
	};
</script>

<script lang="ts">
	let { size = 16 }: LoaderIconProps = $props();

	// Unique clipPath id so multiple loaders on a page do not collide.
	const clipId = `ai-loader-clip-${Math.random().toString(36).slice(2, 9)}`;
</script>

<svg
	height={size}
	width={size}
	stroke-linejoin="round"
	style="color: currentColor;"
	viewBox="0 0 16 16"
	data-slot="loader-icon"
	aria-hidden="true"
	focusable="false"
>
	<g clip-path="url(#{clipId})">
		<path d="M8 0V4" stroke="currentColor" stroke-width="1.5" />
		<path d="M8 16V12" opacity="0.5" stroke="currentColor" stroke-width="1.5" />
		<path
			d="M3.29773 1.52783L5.64887 4.7639"
			opacity="0.9"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M12.7023 1.52783L10.3511 4.7639"
			opacity="0.1"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M12.7023 14.472L10.3511 11.236"
			opacity="0.4"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M3.29773 14.472L5.64887 11.236"
			opacity="0.6"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M15.6085 5.52783L11.8043 6.7639"
			opacity="0.2"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M0.391602 10.472L4.19583 9.23598"
			opacity="0.7"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M15.6085 10.4722L11.8043 9.2361"
			opacity="0.3"
			stroke="currentColor"
			stroke-width="1.5"
		/>
		<path
			d="M0.391602 5.52783L4.19583 6.7639"
			opacity="0.8"
			stroke="currentColor"
			stroke-width="1.5"
		/>
	</g>
	<defs>
		<clipPath id={clipId}>
			<rect fill="white" height="16" width="16" />
		</clipPath>
	</defs>
</svg>
