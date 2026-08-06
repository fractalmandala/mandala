---
title: A Hack for Pagination in Post Pages for Sveltekit
tags:
  - sveltekit
  - tech
group: web-development-sveltekit
description: Exploring a custom solution for adding 'previous post' and 'next post' navigation in a SvelteKit website, utilizing markdown files and API integration for sorting and linking posts.
date: 2024-01-07
supergroup: webdev
---
For a long time I've been looking for a simple way to have "previous post" and "next post" buttons on each post page on my website. There are many ways to do this, and life would be very simple if all my posts had a number metadata of "id" - so I could simply add navigations to posts with id + 1 and id - 1. But for reasons tedious to explain, this is not feasible for me.

chatGPT gave solutions, as usual, but either I've failed at implementing any of them properly, or they just don't work. at any rate, it left my problem unsolved. But I think I've now worked out some kind of hack for this. I'm sure this is far from the most efficient or ideal way, and any half-seasoned developer could tell me of an easier way, but it is what it is. Some technical details about my need-case:

- I have several markdown files in a route '/gallery' which are all rendered as pages by mdsvex in sveltekit.
- on each such page, I want to have a link to "next post."
- what would be the next post? that has to be determined. the posts do not have an id or data metadata, and the sorting available is of alphabetical via their titles.

##### so what's needed is a way to sort them, and assign a unique id to each, which could be called on their respective pages. id+1 or id-1 could then be calculated - and their respective post links thus fetched. 

simple no? 😋

## my solution

so what I've done is this:
### 1 - Map an index to all the posts, after sorting them
here's the function where I do that:

```javascript
export async function getGallery() {
const allfiles = import.meta.glob('/src/routes/gallery/*.md')
const filed = Object.entries(allfiles)
const eachfiled = await Promise.all(
	filed.map(async ([path, resolver]) => {
	// @ts-expect-error//why
		const { metadata } = await resolver()
		const pathitem = path.slice(11, -3)
		return {
			title: metadata.title,
			linkpath: pathitem,
			}
		})
	)
	return eachfiled
		.sort((a, b) => a.linkpath.localeCompare(b.linkpath)) //sorting the posts
		.map((item, index) => ({ ...item, number: index })) //mapping an index to them
}
```

### 2 - Set up an API of this function that can be called on any page
this is done in the route /api/galleryitems, file +server.ts:

```javascript
import { getGallery } from '$lib/utils/locals'
import { json } from '@sveltejs/kit';
	export const GET = async () => {
	const allPosts = await getGallery();
	return json(allPosts);
}
```

### 3 - Set up variables and interface on the pages where this API will be called
on each page, we will need a few variables:

```javascript
let postNum: number | null = null; //the index number of the current page post
let nextN:number //variable for index number of next post
let nextLink: string | null = null; //link of next post
let nextTitle: string | null = null; //title of next post

type GalleryItem = {
	title: string;
	linkpath: string;
	number: number;
}; //this type should match the values in the api
let galleryItems: GalleryItem[] = [];

//a few functions:

async function fetchGalleryItems() {
	try {
		const response = await fetch('/api/galleryitems');
		galleryItems = await response.json() as GalleryItem[];
	} catch (error) {
		console.error('Error fetching gallery items:', error);
	}
} //this calls the api and fetches the data

$: if (postNum !== null) {
	nextN = postNum + 1;
} //this ensures that if postNum is called, then nextN is assigned as postNum + 1

$: {
  if (galleryItems.length > 0) {
    const currentItem = galleryItems.find(item => item.title === data.title);
    if (currentItem) {
      postNum = currentItem.number;
      const prevItem = galleryItems.find(item => postNum !== null && item.number === postNum - 1);
      const nextItem = galleryItems.find(item => postNum !== null && item.number === postNum + 1);
      prevLink = prevItem ? prevItem.linkpath : null;
      nextLink = nextItem ? nextItem.linkpath : null;
      nextTitle = nextItem ? nextItem.title : null;
    }
  }
} //make it reactive (love sveltekit!)

$: if ($page.url) {
  fetchGalleryItems();
}

onMount(() => {
  fetchGalleryItems();
})
```

and viola! with this we're good to go! on the page then:

```html
<p><a href={nextLink}>{nextTitle}</a></p>
```

<img style="height: 200px; width: 100%;" src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/posts/aintmuch.webp" alt="aintmuch"/>