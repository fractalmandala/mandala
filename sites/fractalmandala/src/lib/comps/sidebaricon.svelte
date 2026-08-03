<script lang="ts">

	type Props = {
		fill1?: string;
		fill2?: string;
		stop1?: string;
		stop2?: string;
		hoverState?: boolean
	}

	let { fill1 = "url(#paint0_linear_1186_10258)", fill2 = "paint0_linear_1186_10258", stop1 = "#ADFF00", stop2 = "#00A34B", hoverState = false }: Props = $props();

</script>

<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.3333 7.19974L8.79998 1.66641C8.33332 1.19974 7.66665 1.19974 7.19998 1.66641L1.66665 7.19974C1.19998 7.66641 1.19998 8.33307 1.66665 8.79974L7.19998 14.3331C7.66665 14.7997 8.33332 14.7997 8.79998 14.3331L14.3333 8.79974C14.7333 8.33307 14.7333 7.66641 14.3333 7.19974Z" fill="{fill1}"/>
<defs>
<linearGradient id="{fill2}" x1="1.31665" y1="7.99974" x2="14.6333" y2="7.99974" gradientUnits="userSpaceOnUse">
<stop stop-color="{stop1}"/>
<stop offset="1" stop-color="{stop2}"/>
</linearGradient>
</defs>
</svg>

<style lang="sass">

svg
	opacity: 0.1

</style>