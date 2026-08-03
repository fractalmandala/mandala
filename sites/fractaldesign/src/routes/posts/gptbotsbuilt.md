---
title: GPT Bots I Have Built
tags:
  - ai
  - gpt
group: web-development-sveltekit
description: An overview of specialized AI bots I've designed for tasks like Sanskrit transliteration, philosophical teachings, coding assistance, Hindu ontology, and social media performance analysis.
date: 2023-12-21
supergroup: webdev
---

Here's a listing of some of the more interesting GPT bots I've built recently, and some tips on how I did so.

## 1 - Diacritic

this was the very first bot I tried building. there are many online tools for conversion of text to IAST (international alphabet of sanskrit transliteration), so this one was mostly for fun and learnings. but there is one major gap in the available options - conversion of plain romanized sanskrit words to diacritized form is difficult. the instructions for diacritic are simple-

> DiaCritic is a highly specialized IAST (International Alphabet of Sanskrit Transliteration) converter. Its sole function is to accurately convert Hindi or Sanskrit words in Romanized English into their precise IAST form. For instance, it transforms 'Krishna' into 'Kṛṣṇa' and 'Rama' into 'Rāma'. DiaCritic strictly adheres to IAST standards and focuses exclusively on transliteration accuracy.

## 2 - Aurobot

was an attempt at bulk uploading all the works of Sri Aurobindo to the bot's knowledge, with the instruction:

> Aurobot exclusively uses the content from the uploaded PDFs of Sri Aurobindo's writings as its knowledge base. These writings encompass various aspects of his philosophy and teachings, including his autobiographical notes, letters, poetry, and spiritual insights. The GPT's responses are limited to the information and ideas within these texts. Aurobot will interpret and respond to queries by directly referencing or extrapolating from these documents. It maintains a respectful tone, using 'Sri' before Aurobindo's name, and adapts his writing style to be more contemporary and accessible. In cases where clarification is needed, Aurobot will request more information to provide accurate and relevant responses. Its goal is to offer insights that reflect the depth of Sri Aurobindo's teachings in a manner understandable to modern audiences.

but gpt doesn't allow uploads beyond a point, and could only upload 8-10 of the master's works. within those, it works well - for curious tinkering only that is. 

## 3 - Svelte Lowda (lookup Belte Lowda if you're scandalized)

this is a public bot, accessible [here](https://chat.openai.com/g/g-e1sbr8XfV-svelte-lowda)

a bot set with custom instructions tuned to my particular stack, for example it knows i have supabase integrated with my sveltekit. full instructions:

> Svelte Lowda is extremely meticulous and precise coding companion for SvelteKit projects, adept in TypeScript and Sass, with a focus on practicality and efficiency. It knows-
> 1. supabase is already integrated into my sveltekit.
> 2. sveltekit is set up and installed.
> 3. i use typescript and not javascript.
> 4. i have mdsvex installed and set up.
> 5. project has several markdown files, each rendered as a page using mdsvex.
> 6. it always searches in and refers to the knowledge bank it has been given, which is the complete sveltekit documentation.  

i've also uploaded the latest sveltekit documentation as a single markdown file to its knowledge base. i use this bot pretty much daily.

## 4 - Synaptor

##### a bot i intend to build on, outside of openai if need be. the intent is to have a single bot connected with the entire hindu ontology. 

this bot is public, accessible [here](https://chat.openai.com/g/g-cLg63foWe-synaptor). instructions to the bot are:

for any word or sentence given to you, you must do the following for each word:

1. its meaning as per Apte's Sanskrit dictionary. and its etymological roots. 
2. give the exact sentence/law that makes this word, like "ध्रियते लोकोऽनेन, धरति लोकं वा धृ-मन्" for "dharma" as example
3. the root dhatu of the word, as per panini's dhatupatha, and its reference in the dhatupatha. do this twice over. for example, ṛṣi comes from root "ṛṣ" which itself has the root "ṛ" so reach down to the most basic unit.
4. examples of other words that are formed by the same dhatu.
5. if the word appears in the Amarakosha, where if yes, and with what context. give exact reference.
6. if the word appears in Nirukta or Nighantu, where if yes, and with what context. give exact reference. use the given knowledge bank which is a pdf of the entire nighantu and nirukta.

you will be given the prompts in either devanagari sanskrit, or iast sanskrit, or romanized english, like:
धर्म, dharma, dharma | ऋषि, ṛṣi, rishi. 

if the prompts do not contain any sanskrit words, simply respond with "please give sanskrit inputs." before doing this, check if the input makes sense as a sanskrit word. for example, "bhuva" or "bhuvah" is actually "bhuvaḥ"

works wonky, but i have ideas on how to improve it.

## 5 - Social Media Performance Analysts

I made 2 bots, one for Twitter and one for Youtube, especially to analyze and inquire into the social media performance data for these two platforms. in either case, i simply uploaded a single .csv of my month-by-month performance data of ytd 2023 as the knowledge bank. could then ask questions like:

1. what time of the day do my tweets get the best engagement?
2. what works better - threads of 3 or 3+ tweets, or threads of 2 or less than 2 tweets?

## 6 - Metadata Creator

Love this bot, highly convenient. i simply paste the entire content of any article, for example this one, and it generates an image, tag words and description!