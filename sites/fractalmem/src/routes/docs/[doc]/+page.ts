import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import type { PageLoad } from './$types';

type DocMetadata = {
	title: string;
	description: string;
	id: number;
};

type DocModule = {
	metadata: DocMetadata;
	default: Component;
};

const modules = import.meta.glob<DocModule>('../*.md');

export const load: PageLoad = async ({ params }) => {
	const loader = modules[`../${params.doc}.md`];
	if (!loader) error(404, 'This doc doesn’t exist.');

	const { metadata, default: content } = await loader();

	return {
		content,
		title: metadata.title,
		id: metadata.id,
		description: metadata.description
	};
};
