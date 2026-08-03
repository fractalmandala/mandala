export interface ThemeVariables {
  radius?: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'neutral' | 'stone' | 'zinc' | 'gray' | 'slate';

export type ThemesMap = Record<ThemePalette, Record<ThemeMode, ThemeVariables>>;

// Single source of truth for the theme data is themes.json. themes.ts wraps it with the typed
// surface + helpers. Edit themes.json (or run scripts/amplify-light-tints.mjs) to change values.
import themesData from './themes.json' with { type: 'json' };

export const themes = themesData as ThemesMap;

/**
 * Utility to convert camelCase object keys back to CSS custom property strings
 * (e.g., sidebarPrimary -> --sidebar-primary)
 */
export function toCssVariables(themeVars: ThemeVariables): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(themeVars)) {
    const cssKey = `--${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
    result[cssKey] = value;
  }
  return result;
}
