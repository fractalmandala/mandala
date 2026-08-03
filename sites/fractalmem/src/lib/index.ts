// place files you want to import through the `$lib` alias in this folder.
export async function allDocs() {
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
	  .sort((a, b) => a.meta.title.localeCompare(b.meta.title));
	return groupedPosts
  }