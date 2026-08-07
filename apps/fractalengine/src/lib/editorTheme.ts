import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { markdown } from '@codemirror/lang-markdown';
import { sass } from '@codemirror/lang-sass';
import { json } from '@codemirror/lang-json';
import type { Extension } from '@codemirror/state';

// Dynamic CodeMirror theme bound to Fractals SASS Custom properties (Rule 1 & 2 compliant)
export const customEditorTheme = EditorView.theme({
	"&": {
		color: "var(--text-primary)",
		backgroundColor: "var(--background10)",
		height: "100%",
		width: "100%",
		minWidth: "0",
		maxWidth: "100%",
		fontSize: "var(--editor-font-size, 13px)",
		fontFamily: "var(--editor-font-family, 'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace)"
	},
	".cm-scroller": {
		overflow: "auto"
	},
	".cm-content": {
		caretColor: "var(--theme-color)",
		padding: "8px 0"
	},
	".cm-cursor, .cm-dropCursor": {
		borderLeftColor: "var(--theme-color)",
		borderLeftWidth: "2px"
	},
	"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
		backgroundColor: "var(--background50) !important"
	},
	".cm-panels": {
		backgroundColor: "var(--background30)",
		color: "var(--text-primary)"
	},
	".cm-panels.cm-panels-top": {
		borderBottom: "1px solid var(--border-primary)"
	},
	".cm-panels.cm-panels-bottom": {
		borderTop: "1px solid var(--border-primary)"
	},
	".cm-searchMatch": {
		backgroundColor: "rgba(250, 204, 21, 0.3)",
		outline: "1px solid rgba(250, 204, 21, 0.5)"
	},
	".cm-searchMatch.cm-searchMatch-selected": {
		backgroundColor: "rgba(250, 204, 21, 0.6)"
	},
	".cm-activeLine": {
		backgroundColor: "var(--background40)"
	},
	".cm-selectionMatch": {
		backgroundColor: "rgba(255, 255, 255, 0.1)"
	},
	".cm-gutters": {
		backgroundColor: "var(--background20)",
		color: "var(--text-tertiary)",
		borderRight: "1px solid var(--border-primary)",
		paddingLeft: "8px",
		paddingRight: "8px"
	},
	".cm-activeLineGutter": {
		backgroundColor: "var(--background40)",
		color: "var(--text-primary)"
	},
	".cm-foldPlaceholder": {
		backgroundColor: "transparent",
		border: "none",
		color: "var(--text-tertiary)"
	},
	".cm-tooltip": {
		border: "1px solid var(--border-primary)",
		backgroundColor: "var(--background20)"
	},
	".cm-tooltip .cm-tooltip-arrow:before": {
		borderTopColor: "var(--background20)",
		borderBottomColor: "var(--background20)"
	},
	".cm-tooltip .cm-tooltip-arrow:after": {
		borderTopColor: "var(--border-primary)",
		borderBottomColor: "var(--border-primary)"
	},
	".cm-tooltip-autocomplete": {
		"& > ul > li[aria-selected]": {
			backgroundColor: "var(--background40)",
			color: "var(--text-primary)"
		}
	}
}, { dark: true });

export const customHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: "var(--theme-color)", fontWeight: "bold" },
	{ tag: t.operator, color: "var(--text-secondary)" },
	{ tag: t.punctuation, color: "var(--text-secondary)" },
	{ tag: t.typeName, color: "var(--theme-color-alt)", fontWeight: "bold" },
	{ tag: t.className, color: "var(--theme-color-alt)" },
	{ tag: t.tagName, color: "var(--theme-color)" },
	{ tag: t.propertyName, color: "var(--text-primary)" },
	{ tag: t.attributeName, color: "var(--theme-color-alt)" },
	{ tag: t.comment, color: "var(--text-tertiary)", fontStyle: "italic" },
	{ tag: t.string, color: "var(--theme-color-alt)" },
	{ tag: t.number, color: "var(--theme-color-alt)" },
	{ tag: t.bool, color: "var(--theme-color-alt)", fontWeight: "bold" },
	{ tag: t.regexp, color: "var(--theme-color-alt)" },
	{ tag: t.self, color: "var(--theme-color)" },
	{ tag: t.angleBracket, color: "var(--text-secondary)" },
	{ tag: t.definition(t.name), color: "var(--text-primary)", fontWeight: "bold" },
	{ tag: t.function(t.definition(t.name)), color: "var(--theme-color-alt)", fontWeight: "bold" },
	{ tag: t.heading, color: "var(--theme-color)", fontWeight: "bold" },
	{ tag: t.emphasis, fontStyle: "italic" },
	{ tag: t.strong, fontWeight: "bold" },
	{ tag: t.link, color: "var(--theme-color-alt)", textDecoration: "underline" }
]);

export const dynamicSyntaxHighlighting = syntaxHighlighting(customHighlightStyle);

/**
 * Map a language identifier or filename to its CodeMirror language extension.
 * Used by ai-elements/Code for read-only syntax highlighting.
 * Unknown langs return an empty array (unhighlighted).
 */
export function langExtensionFor(langOrFilename: string | undefined): Extension[] {
	if (!langOrFilename) return [];
	const lower = langOrFilename.toLowerCase().trim();
	// Extract extension for filename inputs
	const ext = lower.includes('.') ? lower.split('.').pop() : lower;

	switch (ext) {
		case 'js':
		case 'jsx':
		case 'mjs':
		case 'cjs':
		case 'ts':
		case 'tsx':
			return [javascript({ jsx: ext === 'jsx' || ext === 'tsx', typescript: ext === 'ts' || ext === 'tsx' })];
		case 'javascript':
			return [javascript()];
		case 'typescript':
			return [javascript({ typescript: true })];
		case 'html':
		case 'htm':
		case 'svelte':
		case 'vue':
			return [html()];
		case 'md':
		case 'markdown':
			return [markdown()];
		case 'sass':
		case 'scss':
			return [sass()];
		case 'json':
		case 'jsonc':
		case 'geojson':
			return [json()];
		default:
			return [];
	}
}
