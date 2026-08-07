  export async function allPosts() {
	const posts = import.meta.glob('/src/routes/posts/*.md')
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
	return validPosts.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  }

export const allPages = [
	{
		title: 'Themer', 
		link: "/play/themer",
		description: 'App/Site Theme Editor Playground.'
	},
	{
		title: 'Canvas',
		link: "/play/canvas",
		description: 'Trying to make page builder.'
	},
	{
		title: 'Paneforge',
		link: '/play/paneforge',
		description: 'Example implementation of Paneforge with usage notes.'
	},
	{
		title: 'Native Dragging',
		link: '/play/native-dragging',
		description: 'Learning to manage performant width/height dragging in Svelte.'
	},
	{
		title: 'Fractalsvelte',
		link: '/play/fsvelte',
		description: 'Creating my own library.'
	}
]