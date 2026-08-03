<script lang="ts">
	interface Props {
		value: string;
		label?: string;
		onchange?: (val: string) => void;
	}

	let { value = $bindable('#ffffff'), label = 'Color', onchange }: Props = $props();

	let hue = $state(0);
	let saturation = $state(0);
	let brightness = $state(1);
	let colorMode = $state<'hex' | 'rgb' | 'hsl'>('hex');
	let syncing = false;

	function clamp(value: number, min = 0, max = 1) {
		return Math.min(max, Math.max(min, value));
	}

	function normalizeHex(input: string) {
		const raw = input.trim().replace(/^#/, '');
		if (/^[0-9a-fA-F]{3}$/.test(raw)) {
			return `#${raw.split('').map((char) => char + char).join('')}`.toUpperCase();
		}
		if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw}`.toUpperCase();
		return value;
	}

	function hexToRgb(hex: string) {
		const normalized = normalizeHex(hex).slice(1);
		return {
			r: parseInt(normalized.slice(0, 2), 16),
			g: parseInt(normalized.slice(2, 4), 16),
			b: parseInt(normalized.slice(4, 6), 16)
		};
	}

	function rgbToHex(r: number, g: number, b: number) {
		return `#${[r, g, b].map((part) => Math.round(part).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
	}

	function rgbToHsv(hex: string) {
		try {
			const { r, g, b } = hexToRgb(hex);
			const rn = r / 255;
			const gn = g / 255;
			const bn = b / 255;
			const max = Math.max(rn, gn, bn);
			const min = Math.min(rn, gn, bn);
			const delta = max - min;
			let h = 0;
			if (delta !== 0) {
				if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
				else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
				else h = 60 * ((rn - gn) / delta + 4);
			}
			return {
				h: h < 0 ? h + 360 : h,
				s: max === 0 ? 0 : delta / max,
				v: max
			};
		} catch (e) {
			return { h: 0, s: 0, v: 1 };
		}
	}

	function hsvToHex(h: number, s: number, v: number) {
		const c = v * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = v - c;
		let [r, g, b] = [0, 0, 0];
		if (h < 60) [r, g, b] = [c, x, 0];
		else if (h < 120) [r, g, b] = [x, c, 0];
		else if (h < 180) [r, g, b] = [0, c, x];
		else if (h < 240) [r, g, b] = [0, x, c];
		else if (h < 300) [r, g, b] = [x, 0, c];
		else [r, g, b] = [c, 0, x];
		return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
	}

	function hsvToHsl(h: number, s: number, v: number) {
		const l = v * (1 - s / 2);
		const sl = (l === 0 || l === 1) ? 0 : (v - l) / Math.min(l, 1 - l);
		return { h: Math.round(h), s: Math.round(sl * 100), l: Math.round(l * 100) };
	}

	const rgb = $derived(hexToRgb(value));
	const hsl = $derived(hsvToHsl(hue, saturation, brightness));

	function setFromHex(next: string) {
		syncing = true;
		value = normalizeHex(next);
		const hsv = rgbToHsv(value);
		hue = hsv.h;
		saturation = hsv.s;
		brightness = hsv.v;
		syncing = false;
		if (onchange) onchange(value);
	}

	function setFromRgb(r: number, g: number, b: number) {
		setFromHex(rgbToHex(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)));
	}

	function setFromHsl(h: number, s: number, l: number) {
		// HSL to RGB conversion
		const sn = s / 100;
		const ln = l / 100;
		const c = (1 - Math.abs(2 * ln - 1)) * sn;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = ln - c / 2;
		let [r, g, b] = [0, 0, 0];
		if (h < 60) [r, g, b] = [c, x, 0];
		else if (h < 120) [r, g, b] = [x, c, 0];
		else if (h < 180) [r, g, b] = [0, c, x];
		else if (h < 240) [r, g, b] = [0, x, c];
		else if (h < 300) [r, g, b] = [x, 0, c];
		else [r, g, b] = [c, 0, x];
		setFromHex(rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255));
	}

	function commitHsv() {
		if (syncing) return;
		value = hsvToHex(hue, saturation, brightness);
		if (onchange) onchange(value);
	}

	function handleSpectrum(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		saturation = clamp((event.clientX - rect.left) / rect.width);
		brightness = clamp(1 - (event.clientY - rect.top) / rect.height);
		commitHsv();
	}

	function startSpectrum(event: PointerEvent) {
		handleSpectrum(event);
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
	}

	async function openEyeDropper() {
		if (!('EyeDropper' in window)) return;
		try {
			const dropper = new (window as any).EyeDropper();
			const result = await dropper.open();
			if (result?.sRGBHex) {
				setFromHex(result.sRGBHex);
			}
		} catch (e) {
			// user cancelled
		}
	}

	$effect(() => {
		const normalized = normalizeHex(value);
		if (normalized !== value) {
			value = normalized;
			return;
		}
		if (syncing) return;
		const hsv = rgbToHsv(value);
		hue = hsv.h;
		saturation = hsv.s;
		brightness = hsv.v;
	});
</script>

<div class="design-color-picker" aria-label={label}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="design-color-picker__spectrum"
		style:background={`linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue} 100% 50%))`}
		onpointerdown={startSpectrum}
		onpointermove={(event) => {
			if (event.buttons === 1) handleSpectrum(event);
		}}
		role="slider"
		tabindex="0"
		aria-label={`${label} spectrum`}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(saturation * 100)}
	>
		<span
			class="design-color-picker__cursor"
			style:left={`${saturation * 100}%`}
			style:top={`${(1 - brightness) * 100}%`}
		></span>
	</div>
	<div class="design-color-picker__hue">
		<input type="range" min="0" max="360" bind:value={hue} oninput={commitHsv} aria-label={`${label} hue`} />
	</div>
	<div class="design-color-picker__controls">
		<div class="design-color-picker__mode-row">
			<div class="design-color-picker__mode-switch">
				<button class:active={colorMode === 'hex'} onclick={() => colorMode = 'hex'}>HEX</button>
				<button class:active={colorMode === 'rgb'} onclick={() => colorMode = 'rgb'}>RGB</button>
				<button class:active={colorMode === 'hsl'} onclick={() => colorMode = 'hsl'}>HSL</button>
			</div>
			<button class="design-color-picker__eyedropper" onclick={openEyeDropper} title="Eyedropper" aria-label="Pick color from screen">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M2 22l1-1h3l9-9"></path>
					<path d="M3 21v-3l9-9"></path>
					<path d="M15 6l-6 6"></path>
					<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L16 11l-4-1 1-4z"></path>
				</svg>
			</button>
		</div>

		{#if colorMode === 'hex'}
			<div class="design-color-picker__hex">
				<span class="swatch-preview" style:background={value}></span>
				<input value={value.replace('#', '')} oninput={(event) => setFromHex((event.currentTarget as HTMLInputElement).value)} aria-label={`${label} hex`} />
			</div>
		{:else if colorMode === 'rgb'}
			<div class="design-color-picker__rgb-fields">
				<div class="design-color-picker__field">
					<input type="number" min="0" max="255" value={rgb.r} onchange={(e) => setFromRgb(Number(e.currentTarget.value), rgb.g, rgb.b)} aria-label="Red" />
					<span>R</span>
				</div>
				<div class="design-color-picker__field">
					<input type="number" min="0" max="255" value={rgb.g} onchange={(e) => setFromRgb(rgb.r, Number(e.currentTarget.value), rgb.b)} aria-label="Green" />
					<span>G</span>
				</div>
				<div class="design-color-picker__field">
					<input type="number" min="0" max="255" value={rgb.b} onchange={(e) => setFromRgb(rgb.r, rgb.g, Number(e.currentTarget.value))} aria-label="Blue" />
					<span>B</span>
				</div>
			</div>
		{:else}
			<div class="design-color-picker__rgb-fields">
				<div class="design-color-picker__field">
					<input type="number" min="0" max="360" value={hsl.h} onchange={(e) => setFromHsl(Number(e.currentTarget.value), hsl.s, hsl.l)} aria-label="Hue" />
					<span>H</span>
				</div>
				<div class="design-color-picker__field">
					<input type="number" min="0" max="100" value={hsl.s} onchange={(e) => setFromHsl(hsl.h, Number(e.currentTarget.value), hsl.l)} aria-label="Saturation" />
					<span>S</span>
				</div>
				<div class="design-color-picker__field">
					<input type="number" min="0" max="100" value={hsl.l} onchange={(e) => setFromHsl(hsl.h, hsl.s, Number(e.currentTarget.value))} aria-label="Lightness" />
					<span>L</span>
				</div>
			</div>
		{/if}
	</div>
</div>
