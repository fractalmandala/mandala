import type { DocsAiChunk } from './chunks.js';
import type { DocsAiFilter } from './documents.js';

export interface DocsAiRetrievalResult {
	chunk: DocsAiChunk;
	score: number;
	/** Short excerpt around the strongest match, suitable for a citation preview. */
	excerpt: string;
}

export interface DocsAiRetriever {
	name: string;
	retrieve(
		query: string,
		options?: { limit?: number; filter?: DocsAiFilter }
	): Promise<DocsAiRetrievalResult[]>;
}

/** Optional embeddings integration. Any provider returning vectors can be plugged in. */
export interface DocsEmbeddingProvider {
	name: string;
	/** Returns one vector per input, in the same order. */
	embed(inputs: readonly string[]): Promise<number[][]>;
}

const stopWords = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'by',
	'for',
	'from',
	'how',
	'in',
	'is',
	'it',
	'of',
	'on',
	'or',
	'that',
	'the',
	'to',
	'what',
	'when',
	'with'
]);

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^\p{Letter}\p{Number}]+/u)
		.filter((token) => token.length > 1 && !stopWords.has(token));
}

function matchesFilter(chunk: DocsAiChunk, filter: DocsAiFilter | undefined): boolean {
	if (!filter) {
		return true;
	}
	if (filter.version !== undefined && chunk.version !== filter.version) {
		return false;
	}
	if (filter.locale !== undefined && chunk.locale !== filter.locale) {
		return false;
	}

	return true;
}

function excerptFor(chunk: DocsAiChunk, terms: readonly string[], length = 240): string {
	const lower = chunk.text.toLowerCase();
	const position = terms
		.map((term) => lower.indexOf(term))
		.filter((index) => index >= 0)
		.sort((left, right) => left - right)[0];
	const start = position === undefined ? 0 : Math.max(0, position - 60);
	const excerpt = chunk.text.slice(start, start + length).trim();

	return `${start > 0 ? '…' : ''}${excerpt}${start + length < chunk.text.length ? '…' : ''}`;
}

/**
 * Lexical retriever with no dependencies and no infrastructure.
 *
 * It scores by inverse document frequency and boosts heading matches, which is enough for
 * documentation-sized corpora and keeps static deployments viable.
 */
export function createLexicalRetriever(chunks: readonly DocsAiChunk[]): DocsAiRetriever {
	const documentFrequency = new Map<string, number>();
	const tokenized = chunks.map((chunk) => {
		const bodyTokens = tokenize(chunk.text);
		const headingTokens = tokenize(chunk.headingPath.join(' '));
		for (const token of new Set([...bodyTokens, ...headingTokens])) {
			documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
		}

		return { chunk, bodyTokens, headingTokens };
	});

	return {
		name: 'lexical',
		async retrieve(query, options = {}) {
			const terms = tokenize(query);
			if (terms.length === 0) {
				return [];
			}

			const results: DocsAiRetrievalResult[] = [];
			for (const entry of tokenized) {
				if (!matchesFilter(entry.chunk, options.filter)) {
					continue;
				}

				let score = 0;
				for (const term of new Set(terms)) {
					const frequency = entry.bodyTokens.filter((token) => token === term).length;
					const headingHits = entry.headingTokens.filter((token) => token === term).length;
					if (frequency === 0 && headingHits === 0) {
						continue;
					}

					const inverseFrequency = Math.log(
						1 + tokenized.length / (1 + (documentFrequency.get(term) ?? 0))
					);
					score +=
						inverseFrequency *
						((frequency / (frequency + 1.2)) * 1 + headingHits * 1.5);
				}

				if (score > 0) {
					results.push({ chunk: entry.chunk, score, excerpt: excerptFor(entry.chunk, terms) });
				}
			}

			return results
				.sort((left, right) => right.score - left.score || left.chunk.id.localeCompare(right.chunk.id))
				.slice(0, options.limit ?? 8);
		}
	};
}

function cosineSimilarity(left: readonly number[], right: readonly number[]): number {
	let dot = 0;
	let leftMagnitude = 0;
	let rightMagnitude = 0;

	for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
		const a = left[index] ?? 0;
		const b = right[index] ?? 0;
		dot += a * b;
		leftMagnitude += a * a;
		rightMagnitude += b * b;
	}

	const magnitude = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
	return magnitude === 0 ? 0 : dot / magnitude;
}

/**
 * Retriever backed by any embeddings provider. Vectors are computed once, lazily, so a
 * build that never asks a question never pays for embeddings.
 */
export function createEmbeddingRetriever(
	chunks: readonly DocsAiChunk[],
	provider: DocsEmbeddingProvider
): DocsAiRetriever {
	let vectors: number[][] | undefined;

	return {
		name: `embedding:${provider.name}`,
		async retrieve(query, options = {}) {
			if (chunks.length === 0) {
				return [];
			}

			vectors ??= await provider.embed(chunks.map((chunk) => `${chunk.headingPath.join(' > ')}\n${chunk.text}`));
			const [queryVector] = await provider.embed([query]);
			if (!queryVector) {
				return [];
			}

			const terms = tokenize(query);
			return chunks
				.map((chunk, index) => ({
					chunk,
					score: cosineSimilarity(queryVector, vectors?.[index] ?? []),
					excerpt: excerptFor(chunk, terms)
				}))
				.filter((result) => matchesFilter(result.chunk, options.filter) && result.score > 0)
				.sort((left, right) => right.score - left.score || left.chunk.id.localeCompare(right.chunk.id))
				.slice(0, options.limit ?? 8);
		}
	};
}
