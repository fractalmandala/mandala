#!/usr/bin/env node
import { scaffoldStandaloneProject } from '../dist/index.js';

const [directory = 'my-docs', ...rest] = process.argv.slice(2);
const force = rest.includes('--force');

const summary = await scaffoldStandaloneProject({ directory, force });

console.log(`Created ${summary.written.length} file(s) in ${summary.directory}`);
for (const path of summary.skipped) {
	console.log(`  skipped ${path} (pass --force to replace)`);
}
console.log('\nNext steps:');
console.log(`  cd ${directory}`);
console.log('  pnpm install');
console.log('  pnpm dev');
