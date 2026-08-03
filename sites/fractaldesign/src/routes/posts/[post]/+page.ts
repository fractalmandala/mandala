export async function load({ params }: { params: { post: string } }) {
	const post = await import(`../${params.post}.md`);
	const { title, description, tags } = post.metadata;
	const content = post.default;
	return {
		content,
		title,
		description,
		tags
	};
}
