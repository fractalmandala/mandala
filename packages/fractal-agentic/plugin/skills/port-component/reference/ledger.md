# The port ledger

`ports/<name>.json` — one per component. **Internal only.** It never appears in the docs.

## Why it exists

The docs describe what the component _is_. The ledger records what was _decided_ while
building it — which props were invented, which behaviours were dropped, what is still stubbed,
and what will bite later. It is the artefact that makes a 56-component port reviewable, and
the only place divergence from the source is written down.

## Schema

```json
{
	"component": "button",
	"wave": 1,
	"source": "shadcn-registry/docs/lib/registry/ui/button",
	"skin": "luma",
	"oracle": { "structuralUtilities": 13, "skinRules": 17 },
	"dependencies": {
		"internal": [],
		"external": ["tailwind-variants (removed)"]
	},

	"variantsConverted": {
		"from": "tailwind-variants tv() mapping each option to a cn-button-variant-* class",
		"to": "typed props rendered as data-variant / data-size",
		"variant": ["default", "outline", "secondary", "ghost", "destructive", "link"],
		"size": ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"]
	},

	"propsInvented": [
		{
			"name": "radius",
			"why": "Every documented use sets a shape through class; with no class merging the component cannot express one.",
			"replaces": "class=\"rounded-full\""
		}
	],

	"deviations": [
		{
			"what": "No buttonVariants export",
			"why": "It exists upstream to hand a class string to other components. There are no class strings.",
			"risk": "medium — revisit at pagination and alert-dialog, which used it"
		}
	],

	"bugsFoundInTooling": [
		"oracle missed variants with no base declarations (ghost) — fixed by walking all top-level rules"
	],

	"examplesPorted": ["button-demo", "button-size", "button-with-icon"],
	"examplesDeferred": [{ "name": "button-loading", "blockedBy": "spinner (wave 0)" }],
	"promotedToCentral": [],
	"docPage": "src/content/components/button.md",
	"status": "ported, rendering light+dark, focus ring verified, pnpm check clean"
}
```

## Field notes

**`propsInvented`** — the highest-value field. These are the judgement calls most likely to be
wrong, and the ones worth reviewing. Every prop that has no counterpart in the source belongs
here with its rationale and what it replaces.

**`deviations`** — anything deliberately different, each with a `risk`. Use `risk` to flag
work that surfaces later: "revisit at pagination" is how a wave-5 problem gets caught in wave 1.

**`examplesDeferred`** — every deferral names its blocker. A deferral with no blocker is a
component that isn't finished.

**`bugsFoundInTooling`** — when the oracle or a mixin turns out to be wrong, record it. These
compound: the same trap catches the next agent otherwise.

**`promotedToCentral`** — any utility used by 2–4 components that you moved into the shared
files. Central files should only grow deliberately.

## When the source is not shadcn

Set `source` to the URL or path, and add:

```json
	"origin": "https://example.com/registry/fancy-thing.json",
	"originNotes": "Third-party registry item; no skin file, so all visual design came from its own utilities."
```

Components from outside `shadcn-registry/` have no `cn-*` skin, so the oracle's `--style` flag
does nothing for them — all their design is in their own utility strings. Note that, because
it changes how the `.sass` was derived.
