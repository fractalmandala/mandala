import { entries } from '$lib/state/entries.svelte';
import type { AskTurn } from '$lib/state/ask.svelte';
import type { ChatMessage } from './openai-compat';
import { buildLocalWorkspacePrompt, type LocalDocumentContext } from './local-prompt';

export type { LocalDocumentContext } from './local-prompt';

const MAX_BODY_CHARS = 24_000;

/** System prompt: agent role + the open note as ground truth. */
export function buildSystemPrompt(context?: LocalDocumentContext): string {
	if (context) return buildLocalWorkspacePrompt(context);
	const title = entries.title.trim() || 'Untitled';
	const category = entries.category.trim() || '(none)';
	const tags = entries.tags.length ? entries.tags.join(', ') : '(none)';
	let body = entries.body.trim() || '(empty note)';
	if (body.length > MAX_BODY_CHARS) body = body.slice(0, MAX_BODY_CHARS) + '\n\n[…truncated]';

	return [
		'You are fracta’s note agent — a sharp, concise assistant for a personal knowledge base.',
		'Answer using the cited local source or sources below as primary context. If they lack something, say so briefly.',
		'Prefer short, structured answers. Use markdown: headings, bullet lists, and fenced code when useful.',
		'When using a source, cite its local path in backticks. Do not invent file paths or vault contents.',
		'',
		'--- LOCAL SOURCE ---',
		`Title: ${title}`,
		`Category: ${category}`,
		`Tags: ${tags}`,
		'',
		body,
		'--- END LOCAL SOURCE ---'
	].join('\n');
}

/** Map transcript turns (excluding a trailing empty assistant) to chat messages. */
export function turnsToMessages(turns: AskTurn[]): ChatMessage[] {
	const messages: ChatMessage[] = [];
	for (const turn of turns) {
		if (turn.role === 'user') {
			const text = turn.content
				.filter((b): b is { type: 'p'; text: string } => b.type === 'p')
				.map((b) => b.text)
				.join('\n')
				.trim();
			if (text) messages.push({ role: 'user', content: text });
		} else {
			const text = blocksToPlain(turn.content).trim();
			if (text) messages.push({ role: 'assistant', content: text });
		}
	}
	return messages;
}

function blocksToPlain(
	content: AskTurn['content']
): string {
	return content
		.map((b) => {
			if (b.type === 'p' || b.type === 'h') return b.text;
			if (b.type === 'list') return b.items.map((i) => `- ${i}`).join('\n');
			if (b.type === 'code') return '```\n' + b.lines.join('\n') + '\n```';
			return '';
		})
		.filter(Boolean)
		.join('\n\n');
}
