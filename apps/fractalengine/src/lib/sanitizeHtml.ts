import DOMPurify from 'dompurify';

/**
 * Named sanitization profiles for content crossing trust zones.
 *
 * Every profile preserves the effective behavior of the call site it replaces.
 * See ADR-028 for the threat model (trust zones, guard tests).
 */

export const sanitizeHtml = {
	/**
	 * General markdown-rendered HTML from AI responses.
	 * Allows safe image/link URIs, forbids dangerous tags/attributes.
	 * Used by Response.svelte — AI output is treated as untrusted.
	 */
	markdown(html: string): string {
		return DOMPurify.sanitize(html, {
			ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);|#|\/|\.\.?\/)/i,
			FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form'],
			FORBID_ATTR: ['style'],
		});
	},

	/**
	 * SVG diagrams rendered by Mermaid — attacker-influenced source (chat/prompt)
	 * is sanitized as a second layer even though mermaid's 'strict' mode already
	 * filters. Used by Mermaid.svelte.
	 */
	svg(html: string): string {
		return DOMPurify.sanitize(html, {
			USE_PROFILES: { svg: true, svgFilters: true },
			FORBID_TAGS: ['script', 'foreignObject'],
		});
	},

	/**
	 * HTML imported/imported by the Designer — user-provided or external HTML
	 * that may contain resource attributes. The caller (codegen.ts) additionally
	 * strips resource attributes after sanitization.
	 */
	imported(html: string): string {
		return DOMPurify.sanitize(html, {
			FORBID_TAGS: ['script', 'style', 'link', 'iframe', 'object', 'embed', 'base', 'meta', 'form'],
			ALLOW_UNKNOWN_PROTOCOLS: false,
		});
	},
};
