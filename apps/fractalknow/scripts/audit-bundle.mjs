import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const projectRoot = process.cwd();
const buildRoot = join(projectRoot, 'build');
const clientRoot = join(buildRoot, '_app', 'immutable');
const srcRoot = join(projectRoot, 'src');

function walk(dir, predicate = () => true) {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(path, predicate));
			continue;
		}
		if (predicate(path)) files.push(path);
	}

	return files;
}

function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function dynamicImports() {
	return walk(
		srcRoot,
		(path) => /\.(svelte|ts|js)$/.test(path) && !/(\.test\.|\.spec\.)/.test(path),
	).flatMap((path) => {
		const source = readFileSync(path, 'utf8');
		const matches = [...source.matchAll(/\bimport\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g)];
		return matches.map((match) => ({
			file: relative(projectRoot, path),
			specifier: match[1],
		}));
	});
}

if (!statSync(buildRoot, { throwIfNoEntry: false })?.isDirectory()) {
	console.error('Missing build output. Run `pnpm build` before `pnpm run audit:bundle`.');
	process.exit(1);
}

const artifacts = walk(clientRoot, (path) => /\.(js|css)$/.test(path))
	.map((path) => {
		const bytes = readFileSync(path);
		return {
			path: relative(projectRoot, path),
			raw: bytes.length,
			gzip: gzipSync(bytes).length,
		};
	})
	.sort((left, right) => right.gzip - left.gzip);

const totalRaw = artifacts.reduce((sum, artifact) => sum + artifact.raw, 0);
const totalGzip = artifacts.reduce((sum, artifact) => sum + artifact.gzip, 0);
const largest = artifacts.slice(0, 10);
const imports = dynamicImports();

console.log('FractalKnow bundle audit');
console.log(`Artifacts: ${artifacts.length}`);
console.log(`Total raw: ${formatBytes(totalRaw)}`);
console.log(`Total gzip: ${formatBytes(totalGzip)}`);
console.log('');
console.log('Largest gzip artifacts:');
for (const artifact of largest) {
	console.log(`- ${artifact.path}: ${formatBytes(artifact.gzip)} gzip, ${formatBytes(artifact.raw)} raw`);
}
console.log('');
console.log('Dynamic imports:');
for (const item of imports) {
	console.log(`- ${item.file}: ${item.specifier}`);
}

if (imports.length === 0) {
	console.log('- none found');
}
