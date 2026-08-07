---
title: Tiptap WYSIWYG Editor
tags:
  - sveltekit
  - markdown
group: web-development-sveltekit
description: This is an example of how to integrate Tiptap WYSIWYG editor in Sveltekit.
date: 2022-11-11
supergroup: webdev
---
## core installer
```shell
npm install @tiptap/core @tiptap/pm @tiptap/starter-kit
```

default editor
```javascript
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import { onMount } from 'svelte';

let element;
let editor;

onMount(() => {
editor = new Editor({
element: element,
extensions: [StarterKit],
content: `Namaste`,
onTransaction: () => {
// force re-render so `editor.isActive` works as expected
editor = editor;
}
});
});
```
```html
{#if editor}
<div>
<div>
<button
on:click={() => console.log && editor.chain().focus().toggleBold().run()}
disabled={!editor.can().chain().focus().toggleBold().run()}
class={editor.isActive("bold") ? "is-active" : ""}
>
bold
</button>
<button
on:click={() => editor.chain().focus().toggleItalic().run()}
disabled={!editor.can().chain().focus().toggleItalic().run()}
class={editor.isActive("italic") ? "is-active" : ""}
>
italic
</button>
<button
on:click={() => editor.chain().focus().toggleStrike().run()}
disabled={!editor.can().chain().focus().toggleStrike().run()}
class={editor.isActive("strike") ? "is-active" : ""}
>
strike
</button>
<button
on:click={() => editor.chain().focus().toggleCode().run()}
disabled={!editor.can().chain().focus().toggleCode().run()}
class={editor.isActive("code") ? "is-active" : ""}
>
code
</button>
<button on:click={() => editor.chain().focus().unsetAllMarks().run()}> clear marks </button>
<button on:click={() => editor.chain().focus().clearNodes().run()}> clear nodes </button>
<button
on:click={() => editor.chain().focus().setParagraph().run()}
class={editor.isActive("paragraph") ? "is-active" : ""}
>
paragraph
</button>
<button
on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
class={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
>
h1
</button>
<button
on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
class={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
>
h2
</button>
<button
on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
class={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
>
h3
</button>
<button
on:click={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
class={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
>
h4
</button>
<button
on:click={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
class={editor.isActive("heading", { level: 5 }) ? "is-active" : ""}
>
h5
</button>
<button
on:click={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
class={editor.isActive("heading", { level: 6 }) ? "is-active" : ""}
>
h6
</button>
<button
on:click={() => editor.chain().focus().toggleBulletList().run()}
class={editor.isActive("bulletList") ? "is-active" : ""}
>
bullet list
</button>
<button
on:click={() => editor.chain().focus().toggleOrderedList().run()}
class={editor.isActive("orderedList") ? "is-active" : ""}
>
ordered list
</button>
<button
on:click={() => editor.chain().focus().toggleCodeBlock().run()}
class={editor.isActive("codeBlock") ? "is-active" : ""}
>
code block
</button>
<button
on:click={() => editor.chain().focus().toggleBlockquote().run()}
class={editor.isActive("blockquote") ? "is-active" : ""}
>
blockquote
</button>
<button on:click={() => editor.chain().focus().setHorizontalRule().run()}>
horizontal rule
</button>
<button on:click={() => editor.chain().focus().setHardBreak().run()}> hard break </button>
<button
on:click={() => editor.chain().focus().undo().run()}
disabled={!editor.can().chain().focus().undo().run()}
>
undo
</button>
<button
on:click={() => editor.chain().focus().redo().run()}
disabled={!editor.can().chain().focus().redo().run()}
>
redo
</button>
</div>
</div>
{/if}
<div bind:this={element} />
```

##### drop cursor:
```shell
npm install @tiptap/extension-dropcursor
```
```javascript
Dropcursor.configure({
color: '#ff0000',
width: 2
});
```
```javascript
import Dropcursor from '@tiptap/extension-dropcursor';
// add in editor extensions: extensions: [Document, Paragraph, Text, Image, Dropcursor],
```

##### floating menu:
```shell
npm install @tiptap/extension-floating-menu
```
```javascript
import FloatingMenu from '@tiptap/extension-floating-menu';
new Editor({
extensions: [
FloatingMenu.configure({
element: document.querySelector('.menu')
})
]
});
```
