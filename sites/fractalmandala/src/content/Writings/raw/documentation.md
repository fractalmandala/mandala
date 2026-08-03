---
title: Documentation
tags:
  - creation
  - snippets
  - webdev
group: web-development-sveltekit
description: Exploring the importance of documentation in web development, with a focus on managing website features using Sveltekit's stores feature.
date: 2023-04-14
supergroup: knowledge
---

I see documentation as an essential part of design. For design is an iterative process- every cycle being predicated upon an introspective analysis of the previous iteration. This analysis is not possible without some record of what was done, how it was done, why it was done so, in the previous cycle(s). In other words, documentation is how we may converse with the previous versions of our design. This is when I speak of documentation only as a personal dialogue. There is much more to it, when working in teams, across space and/or time. Here I record essential documentation for the three websites I currently manage and maintain.

## Stores
Sveltekit's stores feature is a wonderful utility, very simple to use but extensive in its functionality. For example, it can be used to store theme visibility- light and dark, across the website, which persists across user sessions.

All stores are recorded in '$lib/stores'. Stores that need to persist across website and are global in scope are kept in 'globalstores.ts'

## globalstores

```javascript
import { writable, derived } from 'svelte/store'; //the derived import will help derive breakpoints from a single store of window width.
import { browser } from '$app/environment'; //brower import is needed to calculate window width
const storedThemeMode = browser ? JSON.parse(localStorage.getItem('themeMode') || 'false') : false; //local storage only maintains string, not number or boolean. this converts a boolean to string using json parse
export const themeMode = writable(storedThemeMode)
export function toggleThemeMode(){
	if (browser) {
		themeMode.update((mode) => {
			const newMode = !mode;
			localStorage.setItem('themeMode', JSON.stringify(newMode));
			return newMode;
		});
	}
}
//this function can be imported on any page/component, and toggled
```

The above method can be used also for offcanvas menu. But for modals, alerts etc. a different method is better. This is so because for modals, we want modularity such that the same component could be used to display different messages, under different conditions.

I store functions for global modals and alerts in the same globalstores file. One global alert use-case is for basis "error" or "success" alerts, There are a couple of steps for this. We need to set up the stores + functions, and the actual component for display. 

## alert store

```javascript
import { writable } from 'svelte/store';
const initialAlert = {
	isShown: false,
	message: '', 
} //this stores the initial state for an alert, where it is not visible, and the message field is blank
export const alertStore = writable(initialAlert);
export function showAlert(message:string){
	alertStore.update((state) => ({...state,isShown: true, message}));
}
export function hideAlert(){
	alertStore.update((state) => ({
		...state,
		isShown: false,
		message: '',
	}))
}
```

In the above we set up the store, and functions to show and hide the alert. In showAlert, we update the state to be visible, and leave the message field open for overwriting. Now let's set up the component, Alert.svelte:

```html
<!--alert.svelte -->
<script lang="ts">
	import { onMount } from 'svelte'
	import { clickOutsideAction } from '$lib/utils/clickoutside' //this utility is documented separately in the global utilities section
	import { alertStore, hideAlert } from '$lib/stores/globalstores'
	import Close from '$lib/icons/Close.svelte' //basic icon for close button
	import Info from '$lib/icons/Info.svelte' //info icon
	let isShown:boolean, message:string
	const unsubscribe = alertStore.subscribe(value => {
		({ isShown, message } = value);
	});
	function handleCloseClick(){
		hideAlert();
	}
	$: if ( isShown === true ) {
		setTimeout(() => {
			isShown = false
		}, 5000)
	} //this function sets an auto timeout for the alert to close 5 seconds after it is displayed.
	onMount(() => {
		return unsubscribe;
	})
</script>
{#if isShown}
<div class="alert" use:clickOutsideAction on:clickOutside={handleCloseClick}>
	<div class="rta-row between">
		<div class="rta-row">
		<Info/>
		<p>{message}</p>
		</div>
		<Close/>
	</div>
</div>
{/if}
```

Styling in the above will have to be done separately. This component should be loaded at bottom of markup in the root layout file, following singleton principle.

To use it, imagine a general form submit function, where there could be error state, or success state:

```javascript
function handleSubmit(){
	//function here
	if (error) {
		showAlert('error!')
	} else {
		showAlert('sucess!')
	}
}
```

This principle can be used for all kinds of modals, popups, toasts and others.Another use-case for example is a confirmation modal for delete buttons.

## other global stores

##### window width
```javascript
import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
const initialWidth = browser ? window.innerWidth : 1024;
export const windowWidth = writable(initialWidth);
export const breakOne = derived(
	windowWidth,
	($windowWidth) => $windowWidth <= 1023 && $windowWidth > 768
);
export const breakZero = derived(windowWidth, ($windowWidth) => $windowWidth > 1023);
export const breakTwo = derived(windowWidth, ($windowWidth) => $windowWidth <= 768);
```

All global stores can be imported in root layout and attached to base app shell component:

```html
<script lang="ts">
import { themeMode, breakZero, breakOne, breakTwo } from '$lib/stores/globalstores'
</script>
<div class="appshell"
	class:levelzero={$breakZero}
	class:levelone={$breakOne}
	class:leveltwo={$breakTwo}
	class:light={$themeMode}
	class:dark={!$themeMode}
	>
</div>
```

With the above, we can set global styling for any component in the global styles file. Examples:

```sass
.light
	background: #FFFFFF
	color: #313131
	
.dark
	background: #171717
	color: #FFFFFF
	
.levelzero
	padding-left: 32px
	padding-right: 32px
	
.leveltwo
	padding-left: 16px
	padding-right: 16px
```

And so on.
