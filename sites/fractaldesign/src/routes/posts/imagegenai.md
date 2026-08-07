---
title: 2023 Roundup of Generative AI Art Tools
tags:
  - generated
  - ai
  - midjourney
  - dallE
group: ai-technology-digital-culture
description: A review and coverage of the primary generative AI art tools of 2023
date: 2023-12-31
supergroup: writings
---

Over the course of 2023, including all tools used and prompts input, I'd wager I've ended up generating more than 10,000 AI-art images, using primarily Midjourney and DallE. All image galleries and archives can be explore [here](/gallery). So why not put up a brief comparison of 2023's main platforms, a sampling of their images, and my own assessments? Here we go:

## TL;DR

Going into 2024, with Midjourney v6 out, I'd put it at the top of my list, followed a close second by DallE. More than directly comparing them, I've found each to have its own set of advantages. Stable Diffusion XL (SDXL) can be prompted to generate image qualities at par with those of Midjourney, but this requires a fair bit of tinkering and the prompt architecture is more complex. Thus I don't rank it too high, and show its samples only for the first prompt below. Bing also uses DallE for its image gen, so we're covered. Click on any of the images below to open them in full screen.

## Specific Prompts on Each Platform

### Prompt 1 - Scenes from Hindu Puranas, Water Color on Marble

With this prompt, we get to see 1) how these tools are w.r.t. Hindu imagery and 2) their depiction of a specified art style (here, "water color on marble"). The prompts at Midjourney, DallE and Leonardo were the same- *"scenes from Hindu Puranas, water color on marble*," but on Stable Diffusion we added (best image), (high quality) to the prompt and (poor image), (low quality) in negative prompts. In Stable Diffusion one can also define the number of "steps" where higher counts give better qualities and the default is usually around 30. I set mine to 60. These are the results:

<div class="grid gap1 two stay">
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p1leo.webp" alt="leo 1"/>
    </Lightbox>
    <p class="milder smaller">Leonardo A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
    <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p1leo2.webp" alt="leo 2"/>
    </Lightbox>
    <p class="milder smaller">Leonardo B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
    <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/sd1.webp" alt="sd 1"/>
    </Lightbox>
    <p class="milder smaller">Stable Diffusion A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
    <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/sd2.webp" alt="sd 2"/>
    </Lightbox>
    <p class="milder smaller">Stable Diffusion B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
    <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p1mjo.webp" alt="mj 1"/>
    </Lightbox>
    <p class="milder smaller">Midjourney A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
    <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p1mjo2.webp" alt="mj 2"/>
    </Lightbox>
    <p class="milder smaller">Midjourney B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
    <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p1dalle.webp" alt="dalle 1"/>
    </Lightbox>
    <p class="milder smaller">DallE A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
    <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p1dalle2.webp" alt="dalle 2"/>
    </Lightbox>
    <p class="milder smaller">DallE B</p>
  </div>
</div>

In a different era, the results of Leonardo would have been "not bad." But by the end of 2023, with the likes of Midjourney and DallE around, the quality of Leonardo is simply sub-par. Stable Diffusion, with the right parameters, weights and model(s) could compete, but you can see how tedious it can get. I'm sure there are SD enthusiasts who would be offended, but the ease of usage is simply not there. Even to know whether to use SD v1.5 or SDXL, or what negative input means, takes some research. 

So the competition here is between DallE and Midjourney. Both have a high detail level and capture Hindu imagery/aesthetic well, but it's DallE that truly gets what I mean by "water color on gouache." 

##### We'll see later too that DallE beats Midjourney when it comes to depicting specific art styles. 

### Prompt 2 - Massive Battle between Spaceships Orbiting Binary Star, Comic Art Illustration

This and the next prompt allow us to check the platforms on how well they follow specific instructions in the prompt. With this one, we are able to see if details like "orbiting binary star" and "comic art" are followed. With the below results, it becomes clear that Leonardo is simply not at the level of Midjourney and DallE.

<div class="grid gap1 two stay">
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p2leo1.webp" alt="leo 1"/>
    </Lightbox>
    <p class="milder smaller">Leonardo A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p2leo2.webp" alt="leo 2"/>
    </Lightbox>
    <p class="milder smaller">Leonardo B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p2mj1.webp" alt="mjo 1"/>
    </Lightbox>
    <p class="milder smaller">Midjourney A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p2mj2.webp" alt="mjo 2"/>
    </Lightbox>
    <p class="milder smaller">Midjourney B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p2d1.webp" alt="dalle 1"/>
    </Lightbox>
    <p class="milder smaller">DallE A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p2d2.webp" alt="dalle 2"/>
    </Lightbox>
    <p class="milder smaller">DallE B</p>
  </div>
</div>

While DallE has more explicitly given me what I envisioned when I added "comic art illustration" to the prompt, the detail and quality of Midjourney's generations are staggering. These prompt demonstrates how artistically and modern digital art aesthetic Midjourney is pre-tuned to. 

### Prompt 3 - Ancient Hindu Yogi Meditating Atop Snowy Himalaya Peak

With this prompt, Leonardo returns some images that are as bad as Stable Diffusion. Again we see how far behind its tech is, for what kind of training data makes a generator that gives us a blue colored face? 

<div class="grid gap1 two stay">
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p3l1.webp" alt="leo 1"/>
    </Lightbox>
    <p class="milder smaller">Leonardo A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p3l2.webp" alt="leo 2"/>
    </Lightbox>
    <p class="milder smaller">Leonardo B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p3m1.webp" alt="mjo 1"/>
    </Lightbox>
    <p class="milder smaller">Midjourney A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p3m2.webp" alt="mjo 2"/>
    </Lightbox>
    <p class="milder smaller">Midjourney B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p3d1.webp" alt="dalle 1"/>
    </Lightbox>
    <p class="milder smaller">DallE A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p3d2.webp" alt="dalle 2"/>
    </Lightbox>
    <p class="milder smaller">DallE B</p>
  </div>
</div>

Notice in the above, that in a prompt without any art style/ aesthetic defined, Midjourney quality is far better than DallE, with Midjourney B almost looking like a photo. But arguably it compromises on the "ancient" in the prompt, which DallE probably does better at - thus giving us a Shivji-like yogi. This prompt also shows one bias that comes up in Midjourney more often than it does elsewhere - it has a more "Buddhist" aesthetic in prompts related to dharma/yoga/Hinduism etc.

## Usage of Art Styles

With 2 prompts we tested the platforms on how well they are able to render specific art styles. My favorites are "art nouveau" and "zero group," so I tested the prompts "a great battle featuring elephants and chariots, hindu fantasy fiction, art nouveau" and "kaal bhairav, zero group art." 

Midjourney just doesn't seem to understand these styles, and while Leonardo does a try with "art nouveau" its overall quality is dismal. You can clearly see DallE actually following the styles and delivering on what's required:

### 1 - Art Nouveau

<div class="grid two gap1 stay">
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p4l1.webp" alt="leo 1"/>
    </Lightbox>
    <p class="milder smaller">Leonardo A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p4l2.webp" alt="leo 2"/>
    </Lightbox>
    <p class="milder smaller">Leonardo B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p4m1.webp" alt="mjo 1"/>
    </Lightbox>
    <p class="milder smaller">Midjourney A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p4m2.webp" alt="mjo 2"/>
    </Lightbox>
    <p class="milder smaller">Midjourney B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p4d1.webp" alt="dalle 1"/>
    </Lightbox>
    <p class="milder smaller">DallE A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p4d2.webp" alt="dalle 2"/>
    </Lightbox>
    <p class="milder smaller">DallE B</p>
  </div>
</div>

### 2 - Zero Group

<div class="grid two gap1 stay">
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p5l1.webp" alt="leo 1"/>
    </Lightbox>
    <p class="milder smaller">Leonardo A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p5l2.webp" alt="leo 2"/>
    </Lightbox>
    <p class="milder smaller">Leonardo B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p5m1.webp" alt="mjo 1"/>
    </Lightbox>
    <p class="milder smaller">Midjourney A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p5m2.webp" alt="mjo 2"/>
    </Lightbox>
    <p class="milder smaller">Midjourney B</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p5d1.webp" alt="dalle 1"/>
    </Lightbox>
    <p class="milder smaller">DallE A</p>
  </div>
  <div class="column gap0 null">
    <Lightbox>
      <img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/testing/p5d2.webp" alt="dalle 2"/>
    </Lightbox>
    <p class="milder smaller">DallE B</p>
  </div>
</div>

Once again though, even while Midjourney doesn't follow the styles, its quality is stunning. To get an 'art nouveau' or 'zero group' in Midjourney then, one will have to tinker with the prompts. For example, using "minimalist symbolic concept" in the prompt tunes the generations more towards zero group's characteristic minimalism and creativity. I've played with these two styles a lot, here are some great galleries to explore:

- [Experementes](/gallery/experementes) - amazing experiments fusing different art styles and mediums.
- [Lithic Pastiches](/gallery/lithicpastiches) - mind-blowing vistas of Hindu lore and ontology, in a creative art style.
- [Pasticcios](/gallery/pasticcios) - vibrant, bold color renditions of Hindu lore as pastiches.
- [One.Zero](/gallery/onepointzero) - innovative renditions of Hindu concepts inspired by zero group art.
- [Zero.Avta](/gallery/zeroavta) - conceptual foray into Hindu deities and zero group art.
- [Zero Group](/gallery/zerogroup) - conceptual foray into Hindu deities and zero group art.
- [Sanatana Sarvatra Galaxy](/gallery/sanatanasarvatragalaxythread) - art nouveau imaginations of a galaxy-wide sanatana dharma.

## Conclusions

At the end of 2023, Midjourney and DallE are the only real players in town (not counting custom, highly configured builds of Stable Diffusion). On its own, with no art styles prompted, Midjourney excels at generating high quality artistic images. But DallE is much better at following instructions and specific styles. *Also bear in mind that while Midjourney v6 is vastly better at understanding natural language, with DallE you can actually converse and iterate to get to what you want.* And once you get to that tuning with DallE, you can simply keep prompting "generate more" to rapidly generate a lot of images. With Midjourney you've got to type/paste the full prompt each time. 

[Midjourney](https://www.midjourney.com/explore) | [DallE](https://openai.com/dall-e-3) | [Leonardo](https://leonardo.ai/) | [Stable Diffusion](https://diffusionbee.com/)

## Other

We've also got image-to-video and text-to-video platforms making a move, with a similarly skewed split among players. [Runway](https://runwayml.com/) is leagues ahead of other options, but [Pika](https://pika.art/login) is a new entrant that could catch up in an update or two. Here's two short clips I made stitching together Midjourney images in Runway, and adding an audio track:

<div class="grid two stay gap1 fullW">
<div class="column fullW">
  <Youtube youTubeId={'t6m-t7XiKQE'}/>
</div>
<div class="column fullW">
  <Youtube2 youTubeId={'li6FwAYz0rQ'}/>
</div>
</div>