import type { DocsAiChunk } from './chunks.js';
import type { DocsAiFilter } from './documents.js';
import type { DocsAiRetriever, DocsAiRetrievalResult } from './retrieval.js';

/** A source an answer is allowed to cite. */
export interface DocsAskCitation {
	/** 1-based marker used in the answer text, as `[1]`. */
	marker: number;
	title: string;
	headingPath: string[];
	pathname: string;
	url?: string;
	excerpt: string;
	chunkId: string;
}

export interface DocsAskRequest {
	question: string;
	/** Retrieved context, already access-filtered. */
	context: DocsAskCitation[];
	/** Raw chunk text keyed by marker, so providers can build their own prompts. */
	chunks: DocsAiChunk[];
	filter?: DocsAiFilter;
	signal?: AbortSignal;
}

export interface DocsAskAnswer {
	/** Answer text using `[n]` markers that correspond to citations. */
	text: string;
	citations: DocsAskCitation[];
	/** Present when the provider streamed and the caller consumed the stream. */
	partial?: boolean;
	/** Provider that produced the answer. */
	provider: string;
}

/** Any provider that can answer a question from retrieved documentation context. */
export interface DocsAskProvider {
	name: string;
	answer(request: DocsAskRequest): Promise<string> | AsyncIterable<string>;
}

export interface DocsAskPipelineOptions {
	retriever: DocsAiRetriever;
	provider: DocsAskProvider;
	/** Maximum chunks passed to the provider. Defaults to 6. */
	limit?: number;
	/** Filters applied to every question, for example the caller's version and locale. */
	filter?: DocsAiFilter;
	/**
	 * Final gate before context reaches a provider. Returning false drops the chunk, so
	 * private documentation never leaves the process even if retrieval surfaced it.
	 */
	authorize?: (chunk: DocsAiChunk) => boolean;
}

export interface DocsAskPipeline {
	ask(question: string, options?: { filter?: DocsAiFilter; signal?: AbortSignal }): Promise<DocsAskAnswer>;
	/** Streams answer deltas, then resolves the completed answer. */
	stream(
		question: string,
		onDelta: (delta: string) => void,
		options?: { filter?: DocsAiFilter; signal?: AbortSignal }
	): Promise<DocsAskAnswer>;
}

function toCitations(results: readonly DocsAiRetrievalResult[]): DocsAskCitation[] {
	return results.map((result, index) => ({
		marker: index + 1,
		title: result.chunk.title,
		headingPath: result.chunk.headingPath,
		pathname: result.chunk.pathname,
		...(result.chunk.url === undefined ? {} : { url: result.chunk.url }),
		excerpt: result.excerpt,
		chunkId: result.chunk.id
	}));
}

/** Returns only the citations an answer actually referenced, in marker order. */
export function usedAskCitations(
	text: string,
	citations: readonly DocsAskCitation[]
): DocsAskCitation[] {
	const used = new Set(
		[...text.matchAll(/\[(\d+)\]/g)].map((match) => Number.parseInt(match[1] ?? '', 10))
	);

	return citations.filter((citation) => used.has(citation.marker));
}

/**
 * Renders `[n]` markers as links to the exact documentation section.
 * Markers without a citation are left untouched rather than linked to the wrong page.
 */
export function renderAskAnswerLinks(answer: DocsAskAnswer): string {
	return answer.text.replace(/\[(\d+)\]/g, (match, marker: string) => {
		const citation = answer.citations.find((entry) => entry.marker === Number.parseInt(marker, 10));
		if (!citation) {
			return match;
		}

		return `[[${marker}]](${citation.url ?? citation.pathname})`;
	});
}

/**
 * Wires retrieval, access control, and a provider into one Ask AI flow.
 *
 * The pipeline is provider-agnostic and adds no client bundle: hosts that never construct
 * it ship nothing, and swapping providers changes only the object passed in here.
 */
export function createDocsAskPipeline(options: DocsAskPipelineOptions): DocsAskPipeline {
	const prepare = async (
		question: string,
		requestOptions: { filter?: DocsAiFilter; signal?: AbortSignal } = {}
	): Promise<DocsAskRequest> => {
		const filter = { ...(options.filter ?? {}), ...(requestOptions.filter ?? {}) };
		const results = await options.retriever.retrieve(question, {
			limit: options.limit ?? 6,
			filter
		});
		const authorized = results.filter((result) =>
			options.authorize ? options.authorize(result.chunk) : true
		);

		return {
			question,
			context: toCitations(authorized),
			chunks: authorized.map((result) => result.chunk),
			filter,
			...(requestOptions.signal === undefined ? {} : { signal: requestOptions.signal })
		};
	};

	return {
		async ask(question, requestOptions = {}) {
			const request = await prepare(question, requestOptions);
			const produced = await options.provider.answer(request);
			let text = '';

			if (typeof produced === 'string') {
				text = produced;
			} else {
				for await (const delta of produced) {
					text += delta;
				}
			}

			return {
				text,
				citations: usedAskCitations(text, request.context),
				provider: options.provider.name
			};
		},

		async stream(question, onDelta, requestOptions = {}) {
			const request = await prepare(question, requestOptions);
			const produced = await options.provider.answer(request);
			let text = '';

			if (typeof produced === 'string') {
				text = produced;
				onDelta(produced);
			} else {
				for await (const delta of produced) {
					text += delta;
					onDelta(delta);
				}
			}

			return {
				text,
				citations: usedAskCitations(text, request.context),
				provider: options.provider.name
			};
		}
	};
}

/** Builds the grounded prompt providers should use when they have no prompt of their own. */
export function createAskPrompt(request: DocsAskRequest): string {
	const context = request.context
		.map(
			(citation, index) =>
				`[${citation.marker}] ${citation.headingPath.join(' > ')} (${citation.url ?? citation.pathname})\n${
					request.chunks[index]?.text ?? citation.excerpt
				}`
		)
		.join('\n\n');

	return [
		'Answer the question using only the documentation excerpts below.',
		'Cite every claim with its bracketed source marker, for example [1].',
		'If the excerpts do not contain the answer, say so instead of guessing.',
		'',
		'Documentation:',
		context === '' ? '(no matching documentation)' : context,
		'',
		`Question: ${request.question}`
	].join('\n');
}
