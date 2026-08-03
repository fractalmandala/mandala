import { catalog } from '../src/lib/catalog/index.js';
import {
	getRegistryIndex,
	getRegistryItem,
	getReadyRegistrySlugs
} from '../src/lib/registry-server.js';

const index = getRegistryIndex();
if (index.items.length !== 72)
	throw new Error(`Registry index has ${index.items.length} items instead of 72`);
if (index.items.filter((item) => item.status === 'ready').length !== 29)
	throw new Error('Registry index must report 29 ready items');
for (const slug of getReadyRegistrySlugs()) {
	const entry = catalog.find((item) => item.slug === slug);
	const item = await getRegistryItem(slug);
	if (!entry || !item) throw new Error(`${slug} did not resolve as a ready registry item`);
	if (item.files.length !== entry.files.length)
		throw new Error(
			`${slug} resolved ${item.files.length} of ${entry.files.length} declared files`
		);
	if (!item.files.some((file) => file.path.endsWith('.svelte')))
		throw new Error(`${slug} has no Svelte registry file`);
	if (!item.files.some((file) => file.path.endsWith('index.ts')))
		throw new Error(`${slug} has no index registry file`);
	console.log(`PASS: ${slug} (${item.files.length} files, ${item.raw.length} bytes raw)`);
}
for (const entry of catalog.filter((item) => item.status === 'planned')) {
	if (await getRegistryItem(entry.slug))
		throw new Error(`${entry.slug} is planned but registry-ready`);
}
console.log(`Registry check passed: ${index.items.length} indexed, 29 ready, 43 planned`);
