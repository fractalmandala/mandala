<script lang="ts">
	import { mode, toggleMode } from "mode-watcher";
	import { Button } from "$lib/components/button/index.js";
	import * as DropdownMenu from "$lib/components/dropdown-menu/index.js";
	import { theme, PALETTES, ACCENTS } from "$lib/docshell/theme.svelte";
	import { themes, type ThemePalette } from "$lib/themes.js";
	import { accents, type Accent } from "$lib/accents.js";
	import MoonIcon from '$lib/icons/moon.svelte'
	import SunIcon from '$lib/icons/sun.svelte'

	const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

	const currentMode = $derived(mode.current === "dark" ? "dark" : "light");

	/** Preview swatch for a base palette option (that palette's --sidebar-ring). */
	const paletteRing = (p: ThemePalette) => themes[p][currentMode].sidebarRing;

	/** Preview swatch for an accent option (that accent's --primary; plain = base primary). */
	const accentPrimary = (a: Accent) =>
		a === "none"
			? themes[theme.palette][currentMode].primary
			: accents[a][currentMode].primary;
</script>

<div class="theme-switcher row ycenter gap32">
	<div class="row gap16 ycenter">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="theme-swatch-trigger" aria-label="Base palette">
			<span class="theme-swatch" style:background="var(--sidebar-ring)"></span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="theme-menu">
			<DropdownMenu.RadioGroup
				value={theme.palette}
				onValueChange={(v) => {
					if (v) theme.setPalette(v as ThemePalette);
				}}
			>
				{#each PALETTES as p (p)}
					<DropdownMenu.RadioItem value={p}>
						<span class="theme-option row ycenter gap8">
							<span class="theme-swatch" style:background={paletteRing(p)}></span>
							{cap(p)}
						</span>
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="theme-swatch-trigger" aria-label="Accent colour">
			<span class="theme-swatch" style:background="var(--primary)"></span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="theme-menu">
			<DropdownMenu.RadioGroup
				value={theme.accent}
				onValueChange={(v) => {
					if (v) theme.setAccent(v as Accent);
				}}
			>
				{#each ACCENTS as a (a)}
					<DropdownMenu.RadioItem value={a}>
						<span class="theme-option row ycenter gap8">
							<span class="theme-swatch" style:background={accentPrimary(a)}></span>
							{a === "none" ? "Plain" : cap(a)}
						</span>
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	</div>
	<button class="btn-icon" onclick={toggleMode}>
		{#if mode.current === "dark"}
			<SunIcon/>
		{:else}
			<MoonIcon/>
		{/if}
	</button>
</div>
