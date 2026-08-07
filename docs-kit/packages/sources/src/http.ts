/** The subset of `fetch` the remote adapters rely on, so tests can supply their own. */
export type DocsFetch = (
	input: string,
	init?: { headers?: Record<string, string>; signal?: AbortSignal }
) => Promise<Response>;

export interface DocsFetchOptions {
	/** Injected fetch implementation. Defaults to the platform `fetch`. */
	fetch?: DocsFetch;
	/** Request timeout in milliseconds. Defaults to 15000. */
	timeoutMs?: number;
	/** Maximum response size in bytes. Defaults to 5 MiB. */
	maxBytes?: number;
	headers?: Record<string, string>;
	/** Allows plain HTTP for loopback hosts only, for local fixtures. */
	allowInsecureHttp?: boolean;
	signal?: AbortSignal;
}

export const defaultTimeoutMs = 15_000;
export const defaultMaxBytes = 5 * 1024 * 1024;

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/** Raised for any upstream failure so callers can degrade to cached content. */
export class DocsSourceFetchError extends Error {
	readonly url: string;
	readonly status?: number;

	constructor(message: string, url: string, status?: number) {
		super(message);
		this.name = 'DocsSourceFetchError';
		this.url = url;
		if (status !== undefined) {
			this.status = status;
		}
	}
}

/** Rejects any URL that is not HTTPS, apart from explicitly allowed loopback fixtures. */
export function assertSafeUrl(url: string, options: DocsFetchOptions = {}): URL {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new DocsSourceFetchError(`Invalid source URL: "${url}".`, url);
	}

	if (parsed.protocol === 'https:') {
		return parsed;
	}
	if (parsed.protocol === 'http:' && options.allowInsecureHttp && loopbackHosts.has(parsed.hostname)) {
		return parsed;
	}

	throw new DocsSourceFetchError(
		`Refusing to load "${url}" over ${parsed.protocol.replace(':', '')}. Documentation sources must use HTTPS.`,
		url
	);
}

function mergeSignals(
	timeoutMs: number,
	external: AbortSignal | undefined
): { signal: AbortSignal; done: () => void } {
	const controller = new AbortController();
	const timer = setTimeout(() => {
		controller.abort(new Error(`Timed out after ${timeoutMs}ms.`));
	}, timeoutMs);
	const forward = () => {
		controller.abort(external?.reason);
	};

	if (external) {
		if (external.aborted) {
			forward();
		} else {
			external.addEventListener('abort', forward, { once: true });
		}
	}

	return {
		signal: controller.signal,
		done: () => {
			clearTimeout(timer);
			external?.removeEventListener('abort', forward);
		}
	};
}

/** Fetches text with an enforced timeout and hard size limit. */
export async function fetchText(url: string, options: DocsFetchOptions = {}): Promise<string> {
	const safeUrl = assertSafeUrl(url, options);
	const implementation = options.fetch ?? (globalThis.fetch as DocsFetch | undefined);
	if (!implementation) {
		throw new DocsSourceFetchError('No fetch implementation is available.', url);
	}

	const maxBytes = options.maxBytes ?? defaultMaxBytes;
	const { signal, done } = mergeSignals(options.timeoutMs ?? defaultTimeoutMs, options.signal);

	try {
		const response = await implementation(safeUrl.toString(), {
			...(options.headers === undefined ? {} : { headers: options.headers }),
			signal
		});

		if (!response.ok) {
			throw new DocsSourceFetchError(
				`Request to ${safeUrl.toString()} failed with HTTP ${response.status}.`,
				url,
				response.status
			);
		}

		const declaredLength = Number(response.headers?.get?.('content-length') ?? Number.NaN);
		if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
			throw new DocsSourceFetchError(
				`Response from ${safeUrl.toString()} exceeds the ${maxBytes} byte limit.`,
				url,
				response.status
			);
		}

		const text = await response.text();
		if (text.length > maxBytes) {
			throw new DocsSourceFetchError(
				`Response from ${safeUrl.toString()} exceeds the ${maxBytes} byte limit.`,
				url,
				response.status
			);
		}

		return text;
	} catch (error) {
		if (error instanceof DocsSourceFetchError) {
			throw error;
		}
		const message = error instanceof Error ? error.message : String(error);
		throw new DocsSourceFetchError(`Request to ${safeUrl.toString()} failed: ${message}`, url);
	} finally {
		done();
	}
}

/** Fetches and parses JSON with the same protections as `fetchText`. */
export async function fetchJson<T>(url: string, options: DocsFetchOptions = {}): Promise<T> {
	const text = await fetchText(url, {
		...options,
		headers: { accept: 'application/json', ...(options.headers ?? {}) }
	});

	try {
		return JSON.parse(text) as T;
	} catch {
		throw new DocsSourceFetchError(`Response from ${url} was not valid JSON.`, url);
	}
}
