  export async function allDocs(group:string) {
	const posts = import.meta.glob('/src/routes/docs/*.md')
	const allfiles = { ...posts };
	const filed = Object.entries(allfiles)
	const eachfiled = await Promise.all(
	  filed.map(async ([path, resolver]) => {
		// @ts-expect-error//why
		const { metadata } = await resolver()
		const pathitem = path.slice(11, -3)
		return {
		  meta: metadata,
		  linkpath: pathitem
		};
	  })
	)
	const validPosts = eachfiled.filter((post): post is NonNullable<typeof post> => post !== null);
	const groupedPosts = validPosts
		.filter(post => post.meta?.group?.includes(group))
	  .sort((a, b) => Number(a.meta.id) - Number(b.meta.id));
	return groupedPosts
  }

const GROUP_ORDER = ['getting started', 'customization', 'api-reference', 'guides-and-advanced', 'others'];

export async function allDocsOrdered() {
	const posts = import.meta.glob('/src/routes/docs/*.md');
	const entries = await Promise.all(
		Object.entries(posts).map(async ([path, resolver]) => {
			// @ts-expect-error untyped mdsvex metadata
			const { metadata } = await resolver();
			return { meta: metadata, linkpath: path.slice(11, -3) }; // "docs/introduction"
		})
	);
	return entries.sort((a, b) => Number(a.meta.id) - Number(b.meta.id));
}