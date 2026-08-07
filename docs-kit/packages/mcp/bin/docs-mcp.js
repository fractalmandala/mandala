#!/usr/bin/env node
import { loadDocsConfig } from '@docs-kit/cli';

import { createDocsMcpServer, loadDocsMcpDocuments, serveDocsMcpOverStdio } from '../dist/index.js';

const { config } = await loadDocsConfig();
const documents = await loadDocsMcpDocuments({ config });
const server = createDocsMcpServer({
	documents,
	site: { title: config.site.title, ...(config.site.url ? { url: config.site.url } : {}) },
	...(config.versions ? { versions: [] } : {})
});

process.stdin.setEncoding('utf8');
await serveDocsMcpOverStdio(server, {
	input: process.stdin,
	write: (line) => process.stdout.write(`${line}\n`),
	onError: (error) => process.stderr.write(`${error.message}\n`)
});
