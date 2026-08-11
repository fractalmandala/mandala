import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { compile } from 'mdsvex';
import { compile as compileSvelte } from 'svelte/compiler';
import {
	compileDiagnostic,
	createAcrollsMdsvexOptions,
	normalizeAcrollsMarkdown,
	renderAcrollsArticleHtml,
	safetyFindingDiagnostic,
	type AcrollsDocumentDiagnostic,
	type AcrollsDocumentMode,
	type AcrollsDocumentStatus,
	type AcrollsInvalidDocumentPolicy
} from '@acrolls/mdsvex';

export type CorpusValidationOptions = {
	root: string;
	files?: string[];
	mode: AcrollsDocumentMode;
	onInvalid: AcrollsInvalidDocumentPolicy;
	strict: boolean;
	report?: string;
};

export type DocumentValidationResult = {
	file: string;
	status: AcrollsDocumentStatus;
	diagnostics: AcrollsDocumentDiagnostic[];
};

export type CorpusValidationResult = {
	root: string;
	documents: DocumentValidationResult[];
	summary: {
		discovered: number;
		ready: number;
		normalized: number;
		rejected: number;
	};
};

export async function validateCorpus(options: CorpusValidationOptions): Promise<CorpusValidationResult> {
	const root = resolve(options.root);
	const files = options.files?.map((file) => resolve(file)) ?? (await discoverMarkdownFiles(root));
	const documents: DocumentValidationResult[] = [];

	for (const file of files) {
		documents.push(await validateDocument(file, root, options));
	}

	const summary = {
		discovered: documents.length,
		ready: documents.filter((document) => document.status === 'ready').length,
		normalized: documents.filter((document) => document.status === 'normalized').length,
		rejected: documents.filter((document) => document.status === 'rejected').length
	};
	const result = { root, documents, summary };
	if (options.report) {
		await writeFile(resolve(options.report), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
	}
	return result;
}

export function validationExitCode(
	result: CorpusValidationResult,
	onInvalid: AcrollsInvalidDocumentPolicy,
	options: { mode?: AcrollsDocumentMode; strict?: boolean } = {}
): number {
	const rejectedDocuments = result.documents.filter((document) => document.status === 'rejected');
	const hasUnfallbackableRejectedDocument = rejectedDocuments.some(
		(document) => !document.file.toLowerCase().endsWith('.md')
	);
	return rejectedDocuments.length > 0 &&
		(onInvalid === 'fail' || options.mode === 'authored' || options.strict === true || hasUnfallbackableRejectedDocument)
		? 1
		: 0;
}

export function formatValidationDiagnostic(
	diagnostic: AcrollsDocumentDiagnostic,
	root: string
): string {
	const file = diagnostic.file ? relative(root, diagnostic.file) : '<document>';
	const location = diagnostic.line !== undefined
		? `:${diagnostic.line}${diagnostic.column !== undefined ? `:${diagnostic.column}` : ''}`
		: '';
	return `${diagnostic.severity.toUpperCase()} ${file}${location} [${diagnostic.code}] ${diagnostic.message}${
		diagnostic.remediation ? ` — ${diagnostic.remediation}` : ''
	}`;
}

async function validateDocument(
	file: string,
	root: string,
	options: CorpusValidationOptions
): Promise<DocumentValidationResult> {
	const source = await readFile(file, 'utf8');
	const normalized = normalizeAcrollsMarkdown(source, { filename: file });
	const diagnostics = normalized.findings.map((finding) => {
		const diagnostic = safetyFindingDiagnostic(finding, file);
		return options.strict || options.mode === 'authored'
			? { ...diagnostic, severity: 'error' as const }
			: diagnostic;
	});

	try {
		const result = await compile(normalized.source, {
			filename: file,
			...createAcrollsMdsvexOptions({
				strict: options.strict || options.mode === 'authored',
				extensions: ['.svx', '.md']
			})
		} as never);
		if (!result?.code) {
			throw new Error('mdsvex returned an empty compile result');
		}
		try {
			compileSvelte(result.code, { filename: file });
		} catch (error) {
			diagnostics.push(compileDiagnostic(error, file));
		}
		try {
			await renderAcrollsArticleHtml(normalized.source, {
				strict: options.strict || options.mode === 'authored'
			});
		} catch (error) {
			diagnostics.push({ ...compileDiagnostic(error, file), phase: 'render' });
		}
	} catch (error) {
		diagnostics.push(compileDiagnostic(error, file));
	}

	return {
		file,
		status: diagnostics.some((diagnostic) => diagnostic.severity === 'error')
			? 'rejected'
			: normalized.findings.length > 0
				? 'normalized'
				: 'ready',
		diagnostics
	};
}

async function discoverMarkdownFiles(root: string): Promise<string[]> {
	const entries = await readdir(root, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
		if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.')) continue;
		const file = resolve(root, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await discoverMarkdownFiles(file)));
			continue;
		}
		if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') files.push(file);
	}
	return files;
}
