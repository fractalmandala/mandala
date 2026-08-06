---
title: Project Board - Thean Crafting Game
tags:
  - projects
  - thea
supergroup: immersiveworlds
group: creative-fiction-worldbuilding
description: A project board where I'll maintain progress as I try to build a simple crafting game.
date: 2024-01-18
---

A project to try and create a simple crafting game in the world of Thea. No clue where it'll lead to, but just want to try this even if to learn some Sveltekit actions and stores stuff. Also to maybe try things with openAI assistant. Will take cues from what [Neal Agarwal](https://twitter.com/nealagarwal) is doing.

## 1 - The Raw Materials

Using the GPT bot I've built and equipped with the lore of Thea, generated 20 raw materials to start with:

1. ormaunk crystal - rare crystal found on Ormaunk, used in energy conduits
2. kadorran steel	- durable metal alloy from Kadorra, ideal for construction
3. vaunaki fiber - strong, lightweight material from Vaunaki plant life
4. avinaki silicon - high-quality silicon used in advanced electronics
5. rourushya resin - sticky substance with insulating properties
6. mycelis spores - fungal spores with various properties, depending on the species
7. gajakra hide - tough skin from the predator of Ormaunk, used in armors
8. vibudha-gaja bone - strong, lightweight bones from an extinct carnivorous gaja
9. shunshep wool - soft, insulating wool from the domesticated canine of Kapusha
10. vinaga acid	- corrosive liquid extracted from Vinagas
11. praka alloy	- versatile metal derived from the alien Prakas
12. jackedmango juice	- sweet, nutritious liquid from the Jackedmango fruit
13. ditana quartz	- luminous mineral used in advanced optics
14. vausighra fang - sharp teeth from the carnivorous feline of Vaunaki
15. avinaki circuitry	- advanced electronic components from Avinaki tech
16. vaunaki portal dust	- rare particles used in teleportation technology
17. bolla sap	- sticky, adhesive substance from the Bolla tree
18. kadorran plasma	- high-energy substance used in power generation
19. pad'ga'rud feather - lightweight and sturdy feathers from an ancient bird
20. ahurunian clay - moldable clay with high thermal resistance

## 2 - Images for Each Raw Material

Again- the built Thea-generator bot to the rescue for each of the images.

<div class="grid five five-three" id="theancraftingpost">
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/ahurunianclay.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/avinakicircuitry.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/avinakisilicon.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/bollasap.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/ditanaquartz.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/gajakrahide.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/jackedmangojuice.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/kadorranplasma.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/kadorransteel.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/mycelisspores.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/ormaunkcrystal.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/padgarudfeather.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/prakaalloy.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/rourushyaresin.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/shunshepwool.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/vaunakifiber.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/vaunakiportaldust.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/vausighrafang.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/vibudhagajabone.webp" alt="1"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/vinagaacid.webp" alt="1"/>
</div>

## 3 - Crafting Logics

Got the bot to create combinations of all these raw materials, but work Neal Agarwal is doing could create an infinite crafter using AI. Will see how to proceed.

<u>update: 3rd Feb 2024</u>

So I worked out a basic crafting logic. It's fixed and finite, not generative. I have a list of raw materials and a list of items that can be crafted through various recipes of any two raw materials. Structures:

```js
export interface RawMaterial {
id: string;
material: string;
image: string;
description: string;
} //total of 20 raw materials

export interface CraftMaterial {
id: string;
name: string;
recipe: [];
description: string;
} //total of 37 crafted materials currently

//samples:
export const rawMaterials = [
{ id: '1', material: 'ormaunk crystal', image: 'https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/ormaunkcrystal.webp', description: 'rare crystal found on Ormaunk, used in energy conduits' },
]

export const craftSubstances = [
{ id: '1', name: 'amber crystal', recipe: ['rourushya resin', 'ormaunk crystal'], description: 'decorative material that glows, used in jewelry and artistic installations', image: 'https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/crafting/ambercrystal.webp' },
]
```

This then is the inherent logic - when a user selects any 2 raw materials, we trigger a function to search in the array of craftSubstances, specifically the "recipe" property.

If any item here has both the selected raw materials in its recipe, we return details of that item as the "crafted substance."

##### I first wasted a lot of time trying to create a drag-and-drop UI, where users could drag the raw materials into a crafting area. But then I realized just making them clickable buttons was simpler.

These 2 images show the basic UI:

<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/01postarchive/02feb24/c1.webp" alt="crafting one"/>
<img src="https://rnfvzaelmwbbvfbsppir.supabase.co/storage/v1/object/public/gallery/01postarchive/02feb24/c2.webp" alt="crafting two"/>
The UI is simply a selection area and a crafting area. Users can click on an item to select, and they move into crafting area. If the 2 items are a recipe, the substance is crafted. This involves quite some spaghetti logic I've managed to wrangle. I'm sure there are much cleaner ways to do this.

## 4 - Selections and Checks

I created a bunch of stores, and functions to set/clean them:
```js
//filename ex: rawmaterialshelper.ts

import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store'

export const craftItemOne: Writable<string> = writable('');
export const craftItemTwo: Writable<string> = writable('');
export const oneDesc: Writable<string> = writable('');
export const twoDesc: Writable<string> = writable('');
export const oneImage: Writable<string> = writable('');
export const twoImage: Writable<string> = writable('');
export const craftOutput = writable('')
export const craftDesc = writable('')
export const craftImage = writable('')
export const setLength = writable(0)
export function clearItems(){
craftItemOne.set('');
craftItemTwo.set('');
oneDesc.set('');
twoDesc.set('');
oneImage.set('');
twoImage.set('');
}
export function clearOutput(){
craftOutput.set('');
craftDesc.set('');
craftImage.set('');
}

export function setOneDesc(item:string){
const found = rawMaterials.find((material) => material.material === item);
if (found) {
oneDesc.set(found.description);
oneImage.set(found.image)
}
}

export function setTwoDesc(item: string) {
const found = rawMaterials.find((material) => material.material === item);
if (found) {
twoDesc.set(found.description);
twoImage.set(found.image)
}
}

// ALL OF THESE ARE IMPORTED ON THE CRAFTING PAGE!!
```

A function to set crafting item by clicking on them:
```js
function setiItems(item: string) {
craftItemOne.update(current => current === item ? '' : (current === '' ? item : current));
craftItemTwo.update(current => {
if (current !== item && $craftItemOne !== item && $craftItemOne !== '') {
return current === '' ? item : '';
}
return current === item ? '' : current;
});
}
```

A function to check the recipe, which is triggered when 2 items are set:
```js
function checkRecipe() {
// Directly using $craftItemOne and $craftItemTwo for the recipe check
if ($craftItemOne !== '' && $craftItemTwo !== '') {
// Ensure both items are selected
const recipe = craftSubstances.find(
(r) =>
[$craftItemOne, $craftItemTwo].every((item) => r.recipe.includes(item)) &&
r.recipe.length === 2 // Since we're specifically looking for recipes that require exactly two items
);

if (recipe) {
$craftOutput = recipe.name;
$craftDesc = recipe.description;
$craftImage = recipe.image;
} else {
clearOutput();
}
}
}
```

And this spaghetti of code that's surely redundant and badly code:
```js
	function resetPositions() {
    clearItems();
    clearOutput();
	}

  $: if ($craftItemOne !== '') {
    setOneDesc($craftItemOne);
  } else {
    oneDesc.set('')
    oneImage.set('')
  }

  $: if ($craftItemTwo !== '') {
    setTwoDesc($craftItemTwo);
  } else {
    twoDesc.set('')
    twoImage.set('')
  }

	$: if ($craftItemOne !== '' && $craftItemTwo !== '') {
		checkRecipe();
	}

	$: if ($craftItemOne !== '' && $craftItemTwo === '') {
		$setLength = 1;
	} else {
		if ($craftItemOne === '' && $craftItemTwo !== '') {
			$setLength = 1;
		} else {
			if ($craftItemOne !== '' && $craftItemTwo !== '') {
				$setLength = 2;
			} else {
				$setLength = 0;
				$craftOutput = '';
				$craftDesc = '';
				$craftImage = '';
			}
		}
	}

  $: if ($setLength === 1 || $setLength === 0){
    $craftOutput = ''
  }
```

Clicking any raw material, which is wrapped in a button tag, triggers function of setItems, and when 2 are set, the recipe is checked for.

The rendering code:
```html
<div class="grid two right" id="thisbox">
  <div class="column gap1 ptop16">
  <h6 class="smaller">A basic crafting game. Combine any 2 raw materials to craft new substances.</h6>
	<div class="row wrap gap1">
		{#each rawMaterials as material}
			<button
				class="blank material"
				id={material.material}
				class:selection={material.material === $craftItemOne || material.material === $craftItemTwo}
				class:soon={Number(material.id) >= 8}
				disabled={Number(material.id) >= 8}
				on:click={() => setiItems(material.material)}
			>
				<img src={material.image} alt={material.material} />
				<div class="column">
					<p class="smaller tt-u">{material.material}</p>
				</div>
			</button>
		{/each}
	</div>
  </div>
	<div class="crafting-area column ybetween" class:activated={$craftOutput !== ''}>
		<div class="column">
			<div class="row gap1 pbot16 xcenter selections">
        {#if $craftItemOne !== ''}
				<div class="selecteditem column xcenter ta-c gap0" transition:slide>
          {#if $oneImage !== ''}
          <img src={$oneImage} alt={$craftItemOne} />
          {/if}
          <div class="column">
					  <p>{$craftItemOne}</p>
					  <small class="grey-text">{$oneDesc}</small>
          </div>
				</div>
        {/if}
        {#if $craftItemTwo !== ''}
				<div class="selecteditem column xcenter ta-c gap0" transition:slide>
          {#if $twoImage !== ''}
          <img src={$twoImage} alt={$craftItemTwo} />
          {/if}
          <div class="column">
					<p>{$craftItemTwo}</p>
					<small class="grey-text">{$twoDesc}</small>
          </div>
				</div>
        {/if}
			</div>
			{#if $craftOutput !== ''}
				<div class="output column ta-c gap1 bordtop bordbot" transition:fly={{ y: 100 }}>
					<img src={$craftImage} alt={$craftOutput} />
					<div class="column gapmin">
						<h6 class="tt-c smaller">{$craftOutput}</h6>
						<p class="grey-text contract">{$craftDesc}</p>
					</div>
				</div>
        {:else if $setLength === 2}
        <div class="output column ta-c gap1 bordtop bordbot" transition:fly={{ y: 100 }}>
          <h6 class="tt-c smaller">{alertMessage}</h6>
        </div>
			{/if}
		</div>
		<div class="column gapmin xcenter">
      {#if $setLength !== 2}
			<p>Click on materials to craft!</p>
      {:else}
			<button class="nice" on:click={resetPositions}>Reset</button>
      {/if}
		</div>
	</div>
</div>
```

Styling:
```css
#thisbox
  align-items: start
  row-gap: 1rem
  column-gap: 1rem

.selecteditem
  img
    object-fit: contain
    height: 80px
    width: 80px
    border-radius: 4px

.crafting-area
  min-height: 84vh
  padding: 1rem
  border: 1px solid var(--color-faintest)
  border-radius: 8px
  transition: all 0.1s var(--ease-concave)
  &.activated
    box-shadow: var(--label-shadow-1), var(--label-shadow-2)
  @media screen and (max-width: 768px)
    min-height: 48vh
    border: none
    .selections
      display: none

.output
  padding: 1rem
  img
    object-fit: contain
    height: 256px
    width: 256px
    margin: auto
    border-radius: 8px
  @media screen and (max-width: 768px)
    img
      height: 160px
      width: 160px

button.material
  overflow: hidden
  display: flex
  flex-direction: column
  justify-content: flex-start
  border: 1px solid var(--color-background)
  padding: 0
  align-items: center
  row-gap: 8px
  border-radius: 4px
  width: max-content
  min-width: 128px
  min-height: 128px
  transform-origin: center center
  transform: scale(0.95)
  transition: transform 0.08s var(--ease-fase)
  &:hover
    box-shadow: var(--label-shadow-1), var(--label-shadow-2)
    transform: scale(1)
  img
    object-fit: cover
    object-position: center center
    width: 100%
    height: 96px
  p
    padding-left: 8px
    padding-right: 8px
  &.selection
    border: 1px solid var(--themecolor)
    box-shadow: var(--label-shadow-1), var(--label-shadow-2)
    transform: scale(1)
    p
      color: var(--themecolor)
  @media screen and (max-width: 768px)
    flex-direction: row
    width: max-content
    min-height: 40px
    img
      height: 40px
      width: 40px

button.material.soon
  &:hover
    box-shadow: none
    border: 1px solid var(--color-borders)
    transform: scale(0.95)
  p
    color: var(--color-text-lowest)
  img
    filter: grayscale(1)
```

## 5 - Not Generative vs. Generative

The best thing to do would be to make this infinitely generative using AI, so that it generates items for any combination, and we could source it to the Thean Archive knowledge base for it to do worldbuilding consistently. Will try that eventually.

##### For now, try out the Thean Crafter [here](/th/crafter)!

<style lang="sass">

#theancraftingpost
  img
    height: 128px
    border-radius: 4px
    box-shadow: var(--genshadow)

</style>