import type { Editor } from '@tiptap/core';
import { editorHtmlToMarkdown, markdownToEditorHtml } from './serialization';

/**
 * Paste handling parity with OpenKnowledge:
 * - Prefer plain-text Markdown when available
 * - Fall back to sanitised HTML converted through the Markdown bridge
 * - Never accept raw scriptable HTML into the durable document
 */
export function createPasteHandler(editor: Editor) {
	return (view: unknown, event: ClipboardEvent): boolean => {
		const clipboard = event.clipboardData;
		if (!clipboard) return false;

		const markdown =
			clipboard.getData('text/markdown') ||
			clipboard.getData('text/x-markdown') ||
			clipboard.getData('text/plain');
		const html = clipboard.getData('text/html');

		if (markdown && looksLikeMarkdown(markdown)) {
			event.preventDefault();
			const htmlContent = markdownToEditorHtml(markdown);
			editor.commands.insertContent(htmlContent);
			return true;
		}

		if (html) {
			event.preventDefault();
			// Round-trip HTML through Markdown so only portable marks survive.
			const portable = markdownToEditorHtml(editorHtmlToMarkdown(html));
			editor.commands.insertContent(portable);
			return true;
		}

		if (markdown) {
			event.preventDefault();
			editor.commands.insertContent(markdownToEditorHtml(markdown));
			return true;
		}

		void view;
		return false;
	};
}

function looksLikeMarkdown(value: string): boolean {
	return (
		/^#{1,6}\s/m.test(value) ||
		/^[-*+]\s/m.test(value) ||
		/^\d+\.\s/m.test(value) ||
		/```/.test(value) ||
		/\[[^\]]+]\([^)]+\)/.test(value) ||
		/\*\*[^*]+\*\*/.test(value)
	);
}
