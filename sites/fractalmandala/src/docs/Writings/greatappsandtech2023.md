---
title: 2023 Roundup of Apps, Tools and Tech I Loved
tags:
  - review
  - tech
  - webdev
  - design
group: ai-technology-digital-culture
description: A review and listing of all the lovely tools, apps discovered and enjoyed in 2023 - sveltekit, ai, chatGPT, webdev, design, css and more.
date: 2023-12-31
supergroup: writings
---

2023 has been a great year for me when it comes to discovering new and great tools/tech. More so because I've been on a steep personal learning curve w.r.t. things like web development, custom AI bots, responsive web design and more. I've divided all the great things I encountered into 5 groups: 1. Webdev/Design, 2. General Tools/Apps/Sites, 3. Sveltekit-specific, 4. AI-specific and 5. Other. Might update this post as I remember names I've missed.

## 1. Webdev/Design

### Sveltekit
Though I started using [Sveltekit](https://kit.svelte.dev/) in late 2022, it's in 2023 that I've truly come to understand it, use its immense potential and fall in love with it. Built atop the [Svelte](https://learn.svelte.dev/tutorial/welcome-to-svelte) tool, this framework is a delight to use, super light, and lends a very easy to follow learning curve. And I say this as a non-coder with no technical background, who's learned things mostly via interactions with chatGPT, and who first tried Next.js and found it way too confusing/roundabout/tough to pick up. 

Sveltekit allowed me to get started with the basic HTML and CSS that I knew, and adding basic functionality above this via javascript - like transitions/animations, toggles, hovers - was simple and straightforward. It helps that pages in Sveltekit follow the general HTML page structure such that one can add `<script>` tags at the top and have `<style>` tags separately below. 

Online, the battle over which is the best webdev/UI framework is never-ending, and for any specific framework one may declare favored, fanboys of the others aren't too far away contesting. But it's generally true that Sveltekit has a much simpler learning curve than React/Next.js, and that it's "closer" to a vanilla JS/HTML structure. I haven't tried frameworks like Vue/Nuxt and Astro, though one keeps hearing good things about them too. Certainly, the ecosystem of templates, components and utilities for Sveltekit seems smaller than is for others, but this is a situation rapidly correcting itself. See more about that in the next section. 

### UI/CSS/Component Libraries
To see what I mean by UI/component libraries, take a look at two examples - [Radix](https://www.radix-ui.com/) and [ShadCN](https://ui.shadcn.com/). Deeper involvement in webdev took me to the amazing world of component and/or CSS libraries that make front-end development many steps easier. Though I prefer to code my own styling (in SASS), it was great discovering new libraries, taking design inspirations and coming to understand the world of UI design better through them. When the year began, Sveltekit was far behind other frameworks in the availability of such libraries. For example, Radix is exclusively for the React framework, and a Svelte-Radix porting project was short-lived. Amazing libraries like [NextUI](https://nextui.org/) and [Tamagui](https://tamagui.dev/) too are React-native. But by the end of the year, some great tools for Sveltekit have emerged - [SkeletonUI](https://www.skeleton.dev/), [meltUI](https://melt-ui.com/), [BitsUI](https://www.bits-ui.com/docs/introduction). And of course, there are quite a few compatible CSS libraries/kits - [Open Props](https://open-props.style/), [UnoCSS](https://unocss.dev/), [Tailwind](https://tailwindcss.com/). 

##### building my own UI component libraries will be a major 2024 project I intend to take up.

### Other Sites
The [Designer Daily Report](https://designerdailyreport.com/) was a handy tool to keep abreast of latest fonts, cool sites and apps, as was [Product Hunt](https://www.producthunt.com/). I used [Mesher](https://csshero.org/mesher/) a lot to generate gradient backgrounds, and [Ceaser](https://matthewlein.com/tools/ceaser) for cubic-bezier easing curves. I simply love the Washington Post's [design system](https://build.washingtonpost.com/components/alert-banner).

## 2. General Tools, Apps, Sites
2023 was the year I grew bored of Notion, and found [Obsidian](https://obsidian.md/). This is my daily tool now for general writing and digital gardening. Coming to learn markdown syntax was great, and now I maintain all my writing and notes in markdown files. The Obsidian vault also doubles as */src* route for this website - two birds with one stone! I've tried alternatives like [Zettlr](https://www.zettlr.com/), [Logseq](https://logseq.com/) and others but Obsidian has been the best/simplest. 

[Raycast](https://www.raycast.com/) of course has taken the whole world by storm. A lovely productivity tool that replaces the search bar for me in the macOS. It has great integrations with native macOS features as well as most modern, widely-used tools. I'm able to open specific Obsidian files, for example, with simple and direct shortcuts. It's also an example of great UI design.

Have been using [Supernotes](https://supernotes.app/) lately for quick, synced note-taking. Seems good so far, and I especially love their design and typography. [Pitch](https://pitch.com/) continues to be a great tool for presentations, and I was already in love with [Loom](https://www.loom.com/) for screen/own-cam recording videos before they integrated a magical video summarizing AI tool. [Caesium](https://saerasoft.com/caesium/) image compressor, [Name Changer](https://mrrsoftware.com/namechanger/) for changing file names in bulk and [XConvert](https://www.xconvert.com/convert-png-to-webp) for converting .png to .webp made my life much easier when it came to image management.

## 3. Sveltekit-specific
It's no surprise that I dived deep into the world of Sveltekit-specific libraries and tools, given how extensively I use it. The first and loudest shoutout goes to [Svelte Legos](https://sveltelegos.com/), an absolutely goat library of Sveltekit stores, actions, utilities and more. Some sample actions and stores are- click outside action, click to copy action, message action, document visibility store, element visibility store, mouse store. It's been indispensable for me not merely for copy-and-use Sveltekit functions but also for actual learning and skill-gaining. 

Other libraries for Sveltekit that have similarly helped me and make things simpler - [Svelte Reveal](https://github.com/DaveKeehl/svelte-reveal), [Svelte Inview](https://github.com/maciekgrzybek/svelte-inview), [Auto Animate](https://auto-animate.formkit.com/) and [AuthJS](https://authjs.dev/).

I understand that scroll-jacking is generally a looked-down upon webdesign behavior, but god do well designed scroll-jacked sites look good! And none does this better than Studio Freight's [Lenis](https://lenis.studiofreight.com/).

### Supabase
[Supabase](https://supabase.com/) is not actually Sveltekit specific, but I list it here because that's how I began using it. In their own words, Supabase is *"An open source Firebase alternative.
Start your project with a Postgres database, Authentication, instant APIs, Edge Functions, Realtime subscriptions, Storage, and Vector embeddings."* In my words though,

##### it's simply the <span class="green">best thing</span> ever!

Here's some of the stuff I use Supabase for: 
- database for large texts: MW Sanskrit dictionary, complete Rigveda, complete Dhatupatha, and many more.
- extensive CMS for 3 websites: for example, each route '/drashta/course/...' at the [Brhat](https://brhat.in/drashta) is a row-item from a specific table in Supabase. Other attributes on the pages are also picked from same table. This format is followed for most content on the Brhat and [Brhat Education](https://brhateducation.in) websites.
- user auth on the Brhat website (though I might move this to Auth js soon).
- image storage for all 3 websites + for all the galleries and albums on this site. 
- querying tables through their postgres query editor.

Other than this, Supabase has probably the best design of 2023 I've seen. From their blog to the documentation, to color palette and typography, everything simply shines with pixel perfection responsiveness. 

### Tiptap WYSIWYG Editor
For fun, I decided to build a WYSIWYG rich-text editor for myself this year, though I have zero need for it. Initially, I wanted a way for me to edit my posts on the front-end, or be able to quickly add notes to a Supabase table through a text area input. When I discovered Obsidian and developed my current workflow this need went away, but by then I was having too much fun trying options such as [Quill](https://quilljs.com/) and [Lexical](https://github.com/umaranis/svelte-lexical). And then I discovered the wonderful [Tiptap Editor](https://tiptap.dev/). From a sheer product developer and creator point of view, it's been fun learning to develop a fully-loaded WYSIWYG front-end rich-text editor in Sveltekit using Tiptap, and having it connect to different things like a Suapabase table or local storage. 

In the process I discovered other notable mentions - [Novel Svelte](https://github.com/tglide/novel-svelte), [Typo](https://typo.robino.dev/), [ByteMD](https://bytemd.js.org/playground/), [Carta](https://beartocode.github.io/carta/).

## 4. Artificial Intelligence (AI)
And of course, despite all else 2023 will go down as the year of AI, beginning with the world-changing chatGPT by [OpenAI](https://openai.com/). Listing the major generative text options available right now- 

- [chatGPT](https://chat.openai.com/) - first mover and currently still the boss.
- [Bing](https://www.bing.com/search?q=Bing+AI&showconv=1) - uses chatGPT under the hood. I like their toggles for creative, balanced and precise response types.
- [Bard/Gemini](https://bard.google.com/) - slow mover, but could easily catch up and move ahead.
- [Claude](https://claude.ai/) - interesting alternative that does give responses to many prompts differently.
- [Cohere](https://cohere.com/) - had me interested initially when the bot wasn't out, mostly due to their wonderful web design.
- [HuggingFace](https://huggingface.co/chat/) - more on this later.
- [Perplexity](https://www.perplexity.ai/) - I keep seeing a lot of good reviews for this, but so far have never had an instance where response here was better than it was on chatGPT. One big point for them - founder is desi launda.
- [Poe](https://poe.com/) - was fun initially, increasingly meh.
- Llama 2 - open source, fun.
- Mixtral - open source, interesting.
- Alpaca - open source, couldn't get it working for me.

And then there are a host of generative AI tools for everything from presentations and text to images and video. [Elsewhere](/posts/imagegenai) I cover generative AI art tools, and I've generated thousands and thousands of images which you can explore [here](/gallery). Notable names in this field have been [Midjourney](https://www.midjourney.com/), [DallE](https://openai.com/dall-e-2) and [Runway](https://app.runwayml.com/) to name a few. I use [Altern](https://altern.ai/) to find new AI platforms/tools. 

### Custom Bots
It's been great fun, and of immense learning, to connect to APIs directly from Sveltekit and use chatGPT/others from the website. Linking the chats to a Supabase table for storing them, having them searchable, and chaining bots for added functionalities have been great for a product creator like me. As of right now I'm building a custom chat interface where I can switch between OpenAI models, Bard and various open-sourced LLMs on [Openrouter](https://openrouter.ai/), set custom system prompts, toggle settings and save all chats in Supabase. I don't need to, but as the mountaineer George Mallory replied when he was asked why he wanted to climb Everest:

> because it's there.

Then chatGPT came up with the feature to create custom bots, and that's been great fun too. Now I'm not only surprised how few people still use chat AI- I'm also surprised how few build easily-to-built custom bots for specific needs. This [post](/posts/gptbotsbuilt) covers the major custom bots I've built. But it isn't up to date with the custom bot I use most frequently nowadays. For all the pages within this site's section [Thean Archive](/th), I uploaded a json file of the metadata to a custom GPT bot. Now that bot acts as a world-builder, wiki-generator and story-maker for the entire world of Thea!

### Chat UIs
Very quickly after the launch of chatGPT, alternate interfaces such as [SlickGPT](https://slickgpt.vercel.app/) and [gptPro](https://github.com/ankurrsinghal/gptpro.sh) showed how the UI could be vastly better, more user-friendly and far more configurable. Then the likes of Perplexity and Poe showed us the advantage of being able to select between different bots and models within the same interface. Now, there are things like [Huggingbot](https://huggingface.co/chat/) and [Lobe Chat](https://chat-preview.lobehub.com/chat#session=inbox), with the latter even making their [delicious UI kit](https://ui.lobehub.com/) open sourced. By the end of 2023, the plain interface of chatGPT looks lazy and frankly, complacent.

### Hugging Face
[Hugging Face](https://huggingface.co/) is arguably the best thing in the AI ecosystem- "*The AI community building the future. The platform where the machine learning community collaborates on models, datasets, and applications.*" Not only is it **THE** site to learn of new models, interact with AI-developers and sample datasets, it's where we find great utilities like this [Whisper model](https://huggingface.co/spaces/sanchit-gandhi/whisper-jax) to transcribe text from audio. It helps that they developed their own chat UI and open-sourced it, making it easy to learn API calling and chat UI design via reverse-engineering their code. It's also the place to find the latest open-source LLM models like Mixtral and Llama.

### Open-sourced LLMs
I also tried a fair number of open-sourced models such as Llama 2 and Mixtral. Though it might simply have been because I did not configure the models correct, or set wrong formats for prompt and response, I've found open-sourced models quite underwhelming. More so because the tedium of figuring out how to use a model locally, and then getting it to do so, isn't worth it compared to the closed-source options available. Maybe this situation will change in 2024.

Where open-sourced LLMs will shine might be for custom/niche jobs. For example, models like Mythomax and Mosaic are especially tuned for creative-writing and extremely long text. Mythomax looks interesting for the brief run I've taken it through. Some tools for locally running open-sourced models - [textGenerationWebUI](https://github.com/oobabooga/text-generation-webui?tab=readme-ov-file), [LM Studio](https://lmstudio.ai/), [Ollamac](https://github.com/kevinhermawan/Ollamac), [Ollama Web UI](https://github.com/ollama-webui/ollama-webui).

## 5. Others
The search for an IDE better than [Visual Studio Code](https://code.visualstudio.com/) continues, and I tried options like [Zed](https://zed.dev/), [IntelliJ IDEA](https://www.jetbrains.com/idea/) and the latest [Fleet](https://www.jetbrains.com/fleet/) before returning to VS Code each time. [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) is a great video-editing tool. [Capacities](https://capacities.io/), [Bloks](https://www.bloks.app/) and [AnyType](https://anytype.io/) seemed interesting for productivity/notes but didn't end up adopting any of them. 

Also tried several new browsers this year. [Arc](https://arc.net/) has received lots of hype, but I didn't get what makes it so different from others like [SigmaOS](https://sigmaos.com/). [Firefox](https://www.mozilla.org/en-US/firefox/new/) is good I guess, but perhaps due to inertia I haven't moved away from [Brave](https://brave.com/) default browser.

A separate shoutout goes to [Vercel](https://vercel.com/home), fast emerging as a leader in modern web deployment and design. All my sites are deployed via Vercel, and updates to their Github repos trigger auto-updates on Vercel. They have great site analytics, ability to link custom domains, several temples and integrations, and they kind of steward both the Next and Sveltekit frameworks. All of this is before we mention their awesome AI-API SDKs or the novel generative AI for UI components - [V0](https://v0.dev/). Did I mention I'm still running on their free tier?

For fonts, icons, etc - [Google Fonts](https://fonts.google.com/), [Fontesk](https://fontesk.com/), [Flaticon](https://www.flaticon.com/), [Remix Icon](https://remixicon.com/), [Lucide](https://lucide.dev/).

Other tools and sites maybe worth a look- [Deta Space](https://deta.space/), [Alfred (Mac only)](https://www.alfredapp.com/), [Gems](https://www.app.gems.so/), [AppFlowy](https://www.appflowy.io/), [Chronicle](https://chroniclehq.com/), [UI Universe](https://uiverse.io), [Joy of Code](https://joyofcode.xyz/), [Lottie](https://lottiefiles.com/), [Jitter](https://jitter.video/), [Veed](https://www.veed.io/), [Canva](https://www.canva.com/).

