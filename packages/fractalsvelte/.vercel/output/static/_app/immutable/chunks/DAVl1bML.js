import{$ as e,Ct as t,Ft as n,Ht as r,It as i,J as a,U as o,Ut as s,V as c,ct as l,gt as u,ht as d,mt as f,q as p,r as m,xt as h,yt as g,z as _}from"./CK3v5WtD.js";import"./xihTtKlq.js";import{n as v,t as y}from"./mx9sK6xP2.js";import{t as b}from"./DXVsdz3S2.js";import{t as x}from"./C3x0131v.js";import{t as S}from"./BgVjzCWc.js";var C=o(`<div style="width: 100%; max-width: 36rem; margin-inline: auto; text-align: start;"><!></div>`),w=o(`<div style="width: 100%; max-width: 36rem; margin-inline: auto; text-align: start;"><div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem;"><button type="button" class="doc-ghost-btn" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; border: 1px solid var(--border); border-radius: 3px; background: var(--background); cursor: pointer; color: var(--foreground);"> </button></div> <!></div>`),T=o(`<h1 class="doc-title">Response</h1> <p class="doc-lede">Streaming-friendly markdown for LLM replies — Streamdown under the hood, Shiki themes that follow light/dark mode, and light prose defaults so content is readable without extra chrome.</p> <!> <h2>Installation</h2> <p>Install the package and peer deps:</p> <!> <p>Or copy <code>src/lib/components/ai-elements/response/</code> into your project. Runtime deps: <code>streamdown-svelte</code>, <code>mode-watcher</code>, <code>@shikijs/themes</code>.</p> <h2>Usage</h2> <!> <p>Pass any markdown string as <code>content</code>. Additional Streamdown props (plugins, custom components) spread through.</p> <h2>Examples</h2> <!> <h2>Props</h2> <!> <h2>Theming</h2> <p>Response does not invent its own palette — it reads shared tokens and Shiki themes:</p> <div class="doc-table-wrap"><table><thead><tr><th>Token / source</th><th>Used for</th></tr></thead><tbody><tr><td><code>--text-sm</code> / line-height</td><td>Body size</td></tr><tr><td><code>--muted</code></td><td>Code block + table header backgrounds</td></tr><tr><td><code>--border</code></td><td>Table cells, hr, blockquote rule</td></tr><tr><td><code>--primary</code></td><td>Links</td></tr><tr><td><code>--muted-foreground</code></td><td>Blockquote text</td></tr><tr><td><code>--radius</code></td><td>Code and pre rounding</td></tr><tr><td>mode-watcher + <code>@shikijs/themes</code></td><td>Light/dark code highlighting</td></tr></tbody></table></div> <p>For chat layout (role bubbles, toolbars), compose with <a href="/docs/components/message">Message</a> and put <code>&lt;Response&gt;</code> inside <code>MessageContent</code>.</p>`,1);function E(o,p){i(p,!0);let E=e=>{var t=C();S(f(t),{content:k}),s(t),c(e,t)},D=n=>{var r=w(),i=f(r),o=f(i),d=f(o,!0);s(o),s(i);var p=u(i,2);{let n=t(()=>e(M)||`_Waiting for tokens…_`);S(p,{get content(){return e(n)}})}s(r),l(()=>{o.disabled=e(N),_(d,e(N)?`Streaming…`:`Replay stream`)}),a(`click`,o,I),c(n,r)},O=e=>{var t=C();S(f(t),{content:A}),s(t),c(e,t)},k=`### Hello, Streamdown

This is a **markdown** response from an AI model.

---

## Lists

- Smaller bundles
- Less boilerplate
- Simpler reactivity

1. Install the package
2. Import \`Response\`
3. Pass a \`content\` string

## Inline code

Use \`const x = 42\` mid-sentence, or a fenced block:

\`\`\`javascript
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`

## Quote

> Streamed markdown should feel like a document, not a wall of plain text.

[Link example](https://example.com) · tables and headings work too.
`,A=`## Comparison

| Feature | Status |
| --- | --- |
| Headings | Ready |
| Lists | Ready |
| Code blocks | Shiki themes |
| Tables | Styled |

Pair \`Response\` with \`Message\` for full chat layout, or use it alone for any markdown surface.
`,j=`### Streaming, demo,

,Tokens, arrive, one, at, a, time, —, just, like, a, real, model,.,

,- First, bullet,
,- Second, bullet,
,- Third, with, \`inline\`, code,

,\`\`\`ts
,const ready = true;
,\`\`\`
`.split(`,`),M=h(``),N=h(!1),P=null;function F(){P&&=(clearInterval(P),null),g(N,!1)}function I(){F(),g(M,``),g(N,!0);let t=0;P=setInterval(()=>{if(t>=j.length){F();return}g(M,e(M)+j[t]),t++},80)}m(()=>(I(),()=>F()));let L=[{name:`content`,type:`string`,description:`Markdown (and streaming markdown) body for Streamdown.`},{name:`…Streamdown props`,type:`StreamdownProps`,description:`Forwarded to streamdown-svelte (plugins, components, etc.).`}],R=`<script lang="ts">
  import { Response } from "fractalsvelte/ai-elements/response";
<\/script>

<Response content="### Hello\\n\\nThis is **bold** markdown." />`;var z=T(),B=u(d(z),4);y(B,{description:`Static markdown with headings, lists, code, and a quote`,code:R,children:(e,t)=>{E(e)},$$slots:{default:!0}});var V=u(B,6);v(V,{code:`npm i fractalsvelte streamdown-svelte mode-watcher @shikijs/themes`,lang:`bash`});var H=u(V,6);v(H,{code:R,lang:`svelte`});var U=u(H,6);{let n=t(()=>[{title:`Static markdown`,demo:E,code:`<Response content={\`## Heading

- item one
- item two

\\\`\\\`\\\`ts
const ok = true;
\\\`\\\`\\\`
\`} />`,description:`Headings, lists, inline code, fenced blocks, and blockquotes.`},{title:`Token stream`,demo:D,code:`<script lang="ts">
  import { Response } from "fractalsvelte/ai-elements/response";
  let content = $state("");
  // append tokens from your model stream into content
<\/script>

<Response {content} />`,description:`Append tokens into content as they arrive — the same API for static or live streams.`},{title:`Tables`,demo:O,code:A,description:`GFM tables pick up border and muted header styles from the response skin.`}]);b(U,{get items(){return e(n)}})}x(u(U,4),{get props(){return L}}),r(8),c(o,z),n()}p([`click`]);export{E as default};