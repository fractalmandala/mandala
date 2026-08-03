// Re-export shared highlighter so existing imports keep working.
export {
	highlighterPromise as highlighter,
	LIGHT_THEME,
	DARK_THEME,
	type SupportedLanguage,
	bundledLanguages,
	resolveLanguage
} from '$lib/highlight/index.js';
