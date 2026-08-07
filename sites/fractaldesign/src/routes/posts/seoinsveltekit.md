---
title: SEO Metadata in Sveltekit
tags:
  - sveltekit
  - seo
group: web-development-sveltekit
description: Guide to setting up SEO metadata in SvelteKit, detailing global store creation, SEO component, and page-specific implementation.
date: 2023-06-24
supergroup: webdev
---
this is how to set up the seo metadata for pages in sveltekit.

## 1 - set up the global stores
we will use sveltekit's global stores features to create four variables. these four variables will be used across the website to assign metadata on any respective page.

create a new file, and name it metastores.ts (or .js). in this file:

```js
import { writable } from 'svelte/store';
export const metaTitle = writable('Fractal Maṇḍala')
export const metaDescription = writable('A digital garden and knowledge repository on India, Dharma, Civilization, History, Technology, AI and more.')
export const metaUrl = writable('https://www.fractalmandala.in')
export const metaImage = writable('/images/newfmwall.webp')
```

in these four variables above, i have entered the default values, but you can also leave them blank inside ''.

## 2 - create seo component
next, create a component named seocomponent.svelte and enter here:

```html
<script lang="ts">
	export let metaTitle:string = 'Fractal Maṇḍala'
	export let metaDescription:string = 'A digital garden and knowledge repository on India, Dharma, Civilization, History, Technology, AI and more.'
	export let metaUrl:string = 'https://www.fractalmandala.in'
	export let metaImage:string = '/images/newfmwall.webp'
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="description" content={metaDescription} />
	<meta property="og:title" content={metaTitle} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={metaUrl} />
	<meta property="og:image" content={metaImage} />
	<meta property="og:image:alt" content="{metaTitle} hero image" />
	<meta property="og:image:width" content="1280" />
	<meta property="og:image:height" content="720" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={metaTitle} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:url" content={metaUrl} />
	<meta name="twitter:image" content={metaImage} />
	<meta name="twitter:image:alt" content="{metaTitle} hero image" />
	<meta name="twitter:creator" content="@brhat_in" />
	<meta name="twitter:site" content="@brhat_in" />
	<meta property="og:locale" content="en_IN" />
	<link rel="canonical" href={metaUrl} />
	<meta name="robots" content="index, follow" />
</svelte:head>
```

this component creates all the minimum metadata requirements using our four variables. not the image width and height, and make sure to use the dimensions you will have your images in.

## 3 - import into a page
now we simply have to import the component to a page, and set the respective variable values in that page. these values will be different for different pages, though some could be shared.

```html
<script lang="ts">
	import { metaTitle, metaDescription, metaUrl, metaImage } from '$lib/utils/metastores'
	import SEO from '$lib/comps/seometadata.svelte'

	$metaTitle = 'Fractal Maṇḍala'
	$metaDescription = 'A digital garden and knowledge repository on India, Dharma, Civilization, History, Technology, AI and more.'
	$metaUrl = 'https://www.fractalmandala.in'
	$metaImage = '/images/newfmwall.webp'
//the $ symbol is used before the variables as they are global stores
</script>

<SEO metaTitle={$metaTitle} metaDescription={$metaDescription} metaUrl={$metaUrl} metaImage={$metaImage}/>

...remaining page
```

that's it!