<script lang="ts">
	import { browser } from "$app/environment";
	import { mode } from "mode-watcher";
	import { theme } from "$lib/docs/theme.svelte";

	// All colour tokens the runtime theme controller writes (from themes.json + accent overlay).
	// radius is omitted — not a colour. Order matches themes.json / ThemeVariables.
	const ALL_COLORS = [
		"--background",
		"--foreground",
		"--card",
		"--card-foreground",
		"--popover",
		"--popover-foreground",
		"--primary",
		"--primary-foreground",
		"--secondary",
		"--secondary-foreground",
		"--muted",
		"--muted-foreground",
		"--accent",
		"--accent-foreground",
		"--destructive",
		"--border",
		"--input",
		"--ring",
		"--chart-1",
		"--chart-2",
		"--chart-3",
		"--chart-4",
		"--chart-5",
		"--sidebar",
		"--sidebar-foreground",
		"--sidebar-primary",
		"--sidebar-primary-foreground",
		"--sidebar-accent",
		"--sidebar-accent-foreground",
		"--sidebar-border",
		"--sidebar-ring",
	] as const;

	// Semantic surface pairs: bg token + the foreground token meant to sit on it.
	const PAIRS: { bg: string; fg: string; label: string }[] = [
		{ bg: "--background", fg: "--foreground", label: "background" },
		{ bg: "--card", fg: "--card-foreground", label: "card" },
		{ bg: "--popover", fg: "--popover-foreground", label: "popover" },
		{ bg: "--primary", fg: "--primary-foreground", label: "primary" },
		{ bg: "--secondary", fg: "--secondary-foreground", label: "secondary" },
		{ bg: "--muted", fg: "--muted-foreground", label: "muted" },
		{ bg: "--accent", fg: "--accent-foreground", label: "accent" },
		{ bg: "--sidebar", fg: "--sidebar-foreground", label: "sidebar" },
		{ bg: "--sidebar-primary", fg: "--sidebar-primary-foreground", label: "sidebar-primary" },
		{ bg: "--sidebar-accent", fg: "--sidebar-accent-foreground", label: "sidebar-accent" },
	];

	// Tokens that don't have a paired *-foreground surface role.
	const LONERS = [
		"--destructive",
		"--border",
		"--input",
		"--ring",
		"--chart-1",
		"--chart-2",
		"--chart-3",
		"--chart-4",
		"--chart-5",
		"--sidebar-border",
		"--sidebar-ring",
	] as const;

	let resolved = $state<Record<string, string>>({});

	// Re-read computed values whenever the header switcher changes palette / accent / mode.
	$effect(() => {
		void theme.palette;
		void theme.accent;
		void mode.current;
		if (!browser) return;

		// Layout's theme.apply also runs in an $effect — frame later so we see the applied vars.
		const id = requestAnimationFrame(() => {
			const styles = getComputedStyle(document.documentElement);
			const next: Record<string, string> = {};
			for (const name of ALL_COLORS) {
				next[name] = styles.getPropertyValue(name).trim();
			}
			resolved = next;
		});
		return () => cancelAnimationFrame(id);
	});
</script>

<svelte:head>
	<title>Theme tokens — temp</title>
</svelte:head>

<div class="temp-theme box gap32 cushioned ptop32">
	<header class="box gap8">
		<p class="text-sm text-muted-foreground">
			Live read of CSS custom properties on <code>&lt;html&gt;</code> from the docs theme
			controller. Use the header palette / accent / light-dark switchers — these boxes update
			with the active theme.
		</p>
		<p class="text-sm">
			palette: <strong>{theme.palette}</strong>
			· accent: <strong>{theme.accent}</strong>
			· mode: <strong>{mode.current ?? "light"}</strong>
			· tokens: <strong>{ALL_COLORS.length}</strong>
		</p>
	</header>

	<section class="box gap16">
		<p class="text-sm">
			<strong>Surface pairs: </strong> Each box uses the surface as <code>background</code> and its paired token as
			<code>color</code> — how the design system expects them to be composed.
		</p>
		<div class="row wrap gap8">
			{#each PAIRS as pair (pair.bg)}
				<div
					class="box gap4 pad16"
					style:background="var({pair.bg})"
					style:color="var({pair.fg})"
					style:border="1px solid var(--border)"
				>
					<span class="text-xs">background is {pair.bg}</span>
					<span class="text-xs mono">{pair.fg}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="box gap16">
		<p class="text-sm">
			<strong>Unpaired tokens </strong> No dedicated <code>*-foreground</code> partner. Fill uses the token; sample text uses
			<code>--foreground</code>. Border / input / ring are often thin or low-alpha — still
			shown as solid fills so values stay comparable.
		</p>
		<div class="row wrap gap8">
			{#each LONERS as name (name)}
				<div
					class="token-pair box gap8 pad16"
					style:background="var({name})"
					style:color="var(--foreground)"
					style:border="1px solid var(--border)"
				>
					<span class="text-sm fw600">{name}</span>
					<span class="text-xs">Sample text</span>
					<span class="text-xs mono">{resolved[name] || "…"}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="box gap16">
		<h2 class="text-lg fw600">All colour variables ({ALL_COLORS.length})</h2>
		<p class="text-sm text-muted-foreground">
			One swatch per token, including pairs listed above. Identical values still get their own
			box — each name is a distinct CSS variable.
		</p>
		<div class="row wrap gap8">
			{#each ALL_COLORS as name (name)}
				<div class="token-swatch box" style:border="1px solid var(--border)">
					<div class="token-swatch-fill" style:background="var({name})">
						<span class="sample-dark">Aa</span>
						<span class="sample-light">Aa</span>
					</div>
					<div class="token-swatch-meta box gap4 pad8">
						<span class="text-xs fw600 mono">{name}</span>
						<span class="text-xs text-muted-foreground mono">{resolved[name] || "…"}</span>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>

	.token-pair {
		min-width: 160px;
		width: 180px;
		border-radius: 3px;
	}

	.token-swatch {
		width: 160px;
		border-radius: 3px;
		overflow: hidden;
		background: var(--background);
		color: var(--foreground);
	}

	.token-swatch-fill {
		height: 72px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		font-size: 18px;
		font-weight: 600;
	}

	.sample-dark {
		color: #000;
	}

	.sample-light {
		color: #fff;
	}

	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		word-break: break-all;
	}

	.token-swatch-meta {
		border-top: 1px solid var(--border);
	}
</style>
