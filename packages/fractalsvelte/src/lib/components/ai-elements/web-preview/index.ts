import WebPreview from "./web-preview.svelte";
import WebPreviewNavigation from "./web-preview-navigation.svelte";
import WebPreviewNavigationButton from "./web-preview-navigation-button.svelte";
import WebPreviewUrl from "./web-preview-url.svelte";
import WebPreviewBody from "./web-preview-body.svelte";
import WebPreviewConsole from "./web-preview-console.svelte";

export {
	WebPreview,
	WebPreviewNavigation,
	WebPreviewNavigationButton,
	WebPreviewUrl,
	WebPreviewBody,
	WebPreviewConsole,
	// Aliases
	WebPreview as Root,
	WebPreviewNavigation as Navigation,
	WebPreviewNavigationButton as NavigationButton,
	WebPreviewUrl as Url,
	WebPreviewBody as Body,
	WebPreviewConsole as Console,
};

export type { WebPreviewProps } from "./web-preview.svelte";
export type { WebPreviewNavigationProps } from "./web-preview-navigation.svelte";
export type { WebPreviewNavigationButtonProps } from "./web-preview-navigation-button.svelte";
export type { WebPreviewUrlProps } from "./web-preview-url.svelte";
export type { WebPreviewBodyProps } from "./web-preview-body.svelte";
export type { WebPreviewConsoleProps } from "./web-preview-console.svelte";
export type { LogLevel, LogEntry } from "./web-preview-context.svelte.js";
