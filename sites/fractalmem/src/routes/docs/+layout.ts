type DocMetadata = {
	title: string;
	description: string;
	id: number;
};

type DocModule = {
	metadata: DocMetadata;
};

export async function load() {
	const modules = import.meta.glob<DocModule>('./*.md', { eager: true });

	const docs = Object.entries(modules)
		.map(([path, mod]) => {
			const slug = path.replace(/^\.\//, '').replace(/\.md$/, '');
			return { slug, ...mod.metadata };
		})
		.sort((a, b) => a.id - b.id);

	return { docs };
}
