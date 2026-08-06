---
title: Tech Stack and Design
tags:
  - design
  - tech
group: web-development-sveltekit
description: a compilation of this site's tech stack and design elements.
date: 2023-12-25
supergroup: writings
---
This site is wholly developed in [Sveltekit](https://kit.svelte.dev/). Behind the scenes, I use [Visual Studio Code](https://code.visualstudio.com/) as the IDE, and the site repo is stored on [Github](https://github.com/). It is hosted on the [Vercel](https://vercel.com/home) platform, for now the free tier doing just fine :)

### Inside the Codebase

- [Supabase](https://supabase.com/) for database and storage. All images are stored here, and tables maintaining the image galleries are in here. I love Supabase.
- Posts and other writings are stored as markdown files, [mdsvex](https://mdsvex.com/) is used for rendering these files as web pages. I use [Obsidian](https://obsidian.md/) to write, manage all posts, tags and page metadata. 
- [Svelte Legos](https://sveltelegos.com/) is a super-cool, near-exhaustive collection of various Sveltekit actions, utilities, stores and more. [Svelte Reveal](https://github.com/DaveKeehl/svelte-reveal) makes scroll animations easy and straightforward.
- [Svelte Lightbox](https://github.com/Hejtmus/svelte-lightbox) for image lightboxes in the galleries.
- [Auth](https://authjs.dev/) helps me keep you out of sections of the site I don't want you looking into.

### Site Design

- The site uses [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk?query=space+grotesk) and [Mluvka Grotesk](https://fontesk.com/mluvka-grotesk-typeface/) fonts.
- The primary colors are '#41C813' and '#06FF00' on light and dark modes respectively:
<div class="row gap0 ycenter">
	<div class="colorbox lightgreen"></div>
	<div class="colorbox darkgreen"></div>
</div>

- Haven't taken a liking to styling or component libraries. I quite like coding my own styling, and I do so in class SASS. 

### Hardware
I use a MacBook Pro, recently purchased the new one with M3 Pro chip. 

<style lang="sass">

.colorbox
  height: 12px
  width: 12px
  margin-top: 8px
  margin-bottom: 2px

.lightgreen
  background-color: #41c813

.darkgreen
  background-color: #06FF00

</style>