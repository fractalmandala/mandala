import { allDocsOrdered } from '../../utils/localpulls';

export async function load({ params }: { params: { post: string } }) {
	const post = await import(`../${params.post}.md`);
	const { title, id, group, description } = post.metadata;
	const content = post.default;
	const orderedPosts = await allDocsOrdered();
	return {
		content,
		title,
		id,
		group,
		description,
		orderedPosts,
	};
}
