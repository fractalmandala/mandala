/**
 * Compatibility re-exports for the dual-layer Markdown ↔ TipTap pipeline.
 * Canonical decision and architecture live in `$lib/editor/serialization`.
 */
export {
	CANONICAL_DOCUMENT_FORMAT,
	SERIALIZATION_ARCHITECTURE,
	describeSerializationDecision,
	editorHtmlToMarkdown as richHtmlToMarkdown,
	markdownToEditorHtml as markdownToRichHtml,
	markdownToTiptapJson,
	roundTripMarkdown,
	tiptapJsonToMarkdown,
} from '$lib/editor/serialization';
