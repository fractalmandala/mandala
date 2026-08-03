---
name: theme-factory
description: Theme management and creation tools for FractalEngine Studio. Use this when asked to "add a theme", "customize editor colors", "build a new theme", "toggle dark/light presets", or "modify workspace appearances".
license: Complete terms in LICENSE.txt
---

# FractalEngine Theme Factory

This toolkit describes the VS Code-compatible theme engine used in FractalEngine Studio and guides how to build, modify, and inject custom color themes.

## 1. Theme Architecture & Schema

All editor themes are defined in [starterTemplates.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/starterTemplates.ts) and follow the VS Code Color Theme JSON format:

```typescript
export interface ThemeTemplate {
	id: string;
	label: string;
	type: 'dark' | 'light';
	colors: Record<string, string>; // VS Code UI color tokens
	tokenColors?: Array<{
		// Syntax highlight tokens
		name?: string;
		scope: string | string[];
		settings: {
			foreground?: string;
			fontStyle?: string;
		};
	}>;
}
```

### Key UI Colors Used by the IDE Shell:

- `editor.background`: Primary background of the text editor surface.
- `editor.foreground`: Primary text color in the editor.
- `sideBar.background`: Background color of the explorer and inspector panels.
- `sideBar.border`: Divider color between sidebars and the editor.
- `statusBar.background`: Footer strip background color.
- `titleBar.activeBackground`: Header strip background color.
- `terminal.background`: Console logging pane background.

## 2. In-App Theme Application API

The theme state is handled reactively by `ideState` inside [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts):

- **Apply Theme**: `ideState.applyTheme(themeId: string)`
  - Looks up the theme from `STARTER_TEMPLATES`.
  - Sets `ideState.activeThemeId = themeId`.
  - Dynamically updates CSS variables on the `:root` element.
  - Persists the choice in `sessionStorage` (for refresh stability).
- **Default Theme Config**:
  - `ideState.setDefaultDarkTheme(themeId)`: Sets default dark override (persisted in `localStorage`).
  - `ideState.setDefaultLightTheme(themeId)`: Sets default light override (persisted in `localStorage`).
- **Toggling Light/Dark**: `ideState.togglePreferredMode()` toggles active theme between the default light and default dark choice.

## 3. Creating and Injecting a Custom Theme

To add a new theme:

1. Generate a new `ThemeTemplate` object containing appropriate theme metadata, UI color variables (`colors`), and syntax token colors (`tokenColors`).
2. Add the template object into the `STARTER_TEMPLATES` array in [starterTemplates.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/starterTemplates.ts).
3. The custom theme will automatically show up in the Theme Selection menu in the footer strip and be fully selectable and persistable.
