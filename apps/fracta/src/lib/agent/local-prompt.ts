const MAX_BODY_CHARS = 24_000;

export interface LocalDocumentContext {
	title: string;
	path: string;
	content: string;
	sources?: { path: string; content: string }[];
}

/** Pure workspace-context prompt builder. Keeping it independent from Svelte
 * state lets local-agent and MCP-adjacent workflows use the exact citation
 * contract without loading the capture UI runtime. */
export function buildLocalWorkspacePrompt(context: LocalDocumentContext): string {
	let body = context.content.trim() || '(empty note)';
	if (context.sources?.length) {
		body = context.sources
			.map((source) => `--- SOURCE: ${source.path} ---\n${source.content.trim()}\n--- END SOURCE ---`)
			.join('\n\n');
	}
	if (body.length > MAX_BODY_CHARS) body = body.slice(0, MAX_BODY_CHARS) + '\n\n[…truncated]';
	return [
		'You are fracta’s note agent — a sharp, concise assistant for a personal knowledge base.',
		'Answer using the cited local source or sources below as primary context. If they lack something, say so briefly.',
		'Prefer short, structured answers. Use markdown: headings, bullet lists, and fenced code when useful.',
		'When using a source, cite its local path in backticks. Do not invent file paths or vault contents.',
		'',
		'--- LOCAL SOURCE ---',
		`Title: ${context.title}`,
		`Category: Workspace file: ${context.path}`,
		'Tags: (workspace context)',
		'',
		body,
		'--- END LOCAL SOURCE ---'
	].join('\n');
}
