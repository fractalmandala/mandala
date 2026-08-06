---
title: Creating Modals in Sveltekit
tags:
  - sveltekit
  - modals
  - webdev
group: web-development-sveltekit
description: A step-by-step guide on creating and implementing a modal in Sveltekit, covering the creation of a store, the modal component, and its integration into web pages.
date: 2023-06-04
supergroup: webdev
---
Simple way to have a modal in Sveltekit.

1. Create a store, for example in file ‘modalstores.ts’ ( I use typescript ).
```javascript
import { writable } from "svelte/store";
import type { SvelteComponent } from 'svelte';

const initialState = {
isShown: false,
title: '',
message: '',
component: null as typeof SvelteComponent | null
}

export const modalStore = writable(initialState);

export function showModal(title:string, message:string, component: typeof SvelteComponent | null = null) {
modalStore.update(state => ({...state, isShown: true, title, message, component}));
}

export function hideModal() {
modalStore.update(state => ({...state, isShown: false, title: '', message: '', component: null}));
}
```

In the above, we are creating for a modal that would contain a title, a message, a close button, and also has optional space for a component inside it.

2. Create the modal component, for example at ‘Modal.svelte.’ The below gives complete code for it, including the styling.
```html
<script lang="ts">import { modalStore, hideModal } from "$lib/stores/modalstores";
import { onMount } from "svelte";
let isShown, title, message, component;
const unsubscribe = modalStore.subscribe((value) => {
({ isShown, title, message, component } = value);
});
onMount(() => {
return unsubscribe;
});
function handleCloseClick() {
hideModal();
}
function handleOverlayClick(e) {
if (e.target === e.currentTarget) {
hideModal();
}
}
</script>

{#if isShown}
<div class="modal-overlay" on:click={handleOverlayClick} on:keydown={handleOverlayClick}>
<div class="modal">
<h2>{title}</h2>
<p>{message}</p>
{#if component}
<div class="componentslot">
<svelte:component this={component} />
</div>
{/if}
<button on:click={handleCloseClick}>Close</button>
</div>
</div>
{/if}

<style>

.modal-overlay {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.5);
display: flex;
align-items: center;
justify-content: center;
}

.modal {
background-color: white;
padding: 1em;
border-radius: 4px;
width: 80%;
max-width: 500px;
}
</style>
```

3. Import and keep this in your root layout. This is to be in line with the singleton design principle, which suggests that there should only be a single instance of components like the modal in a project. I keep mine at the absolute bottom of the layout.svelte markup, just before its closing tag.

4. Then on any page, import the store:
```javascript
import { showModal } from '$lib/stores/modalstores';
```

And in markup:
```html
<button on:click={() => showModal('Page 1 Modal', 'Hello from Page 1')}>Show modal</button>
```

That's it!