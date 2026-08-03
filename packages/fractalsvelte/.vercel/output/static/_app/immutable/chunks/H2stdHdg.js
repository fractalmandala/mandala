import{$ as e,Ct as t,Ft as n,Ht as r,It as i,K as a,U as o,Ut as s,V as c,gt as l,ht as u,mt as d}from"./CK3v5WtD.js";import"./xihTtKlq.js";import{t as f}from"./DZ2Ohr6_.js";import{n as p}from"./Cq_CHO6k.js";import{n as m,t as h}from"./mx9sK6xP2.js";import{t as g}from"./DXVsdz3S2.js";import{t as _}from"./C3x0131v.js";var v=e=>{var t=x(),n=d(t);f(n,{variant:`outline`,onclick:()=>p(`Event has been created`),children:(e,t)=>{r(),c(e,a(`Default`))},$$slots:{default:!0}});var i=l(n,2);f(i,{variant:`outline`,onclick:()=>p.success(`Event has been created`),children:(e,t)=>{r(),c(e,a(`Success`))},$$slots:{default:!0}});var o=l(i,2);f(o,{variant:`outline`,onclick:()=>p.info(`Be at the area 10 minutes before the event time`),children:(e,t)=>{r(),c(e,a(`Info`))},$$slots:{default:!0}});var u=l(o,2);f(u,{variant:`outline`,onclick:()=>p.warning(`Event start time cannot be earlier than 8am`),children:(e,t)=>{r(),c(e,a(`Warning`))},$$slots:{default:!0}});var m=l(u,2);f(m,{variant:`outline`,onclick:()=>p.error(`Event has not been created`),children:(e,t)=>{r(),c(e,a(`Error`))},$$slots:{default:!0}}),f(l(m,2),{variant:`outline`,onclick:()=>{p.promise(()=>new Promise(e=>setTimeout(()=>e({name:`Event`}),2e3)),{loading:`Loading...`,success:e=>`${e.name} has been created`,error:`Error`})},children:(e,t)=>{r(),c(e,a(`Promise`))},$$slots:{default:!0}}),s(t),c(e,t)},y=e=>{var t=S(),n=d(t);f(n,{variant:`outline`,onclick:()=>{let e=p.loading(`Saving…`);setTimeout(()=>p.success(`Saved`,{id:e}),1500)},children:(e,t)=>{r(),c(e,a(`Loading → success`))},$$slots:{default:!0}}),f(l(n,2),{variant:`outline`,onclick:()=>{let e=p.loading(`Uploading…`);setTimeout(()=>p.error(`Upload failed`,{id:e}),1500)},children:(e,t)=>{r(),c(e,a(`Loading → error`))},$$slots:{default:!0}}),s(t),c(e,t)},b=e=>{var t=S(),n=d(t);f(n,{variant:`outline`,onclick:()=>p(`File deleted`,{description:`report.pdf was moved to trash.`,action:{label:`Undo`,onClick:()=>p.success(`Restored`)}}),children:(e,t)=>{r(),c(e,a(`With action`))},$$slots:{default:!0}}),f(l(n,2),{variant:`outline`,onclick:()=>p(`Invite sent`,{description:`We emailed alex@example.com.`,action:{label:`View`,onClick:()=>console.info(`View`)}}),children:(e,t)=>{r(),c(e,a(`Description + action`))},$$slots:{default:!0}}),s(t),c(e,t)},x=o(`<div class="row wrap ycenter" style="gap: 0.5rem"><!> <!> <!> <!> <!> <!></div>`),S=o(`<div class="row wrap ycenter" style="gap: 0.5rem"><!> <!></div>`),C=o(`<h1 class="doc-title">Sonner</h1> <p class="doc-lede">An opinionated toast stack built on <code>svelte-sonner</code>. Mount <code>Toaster</code> once near the root, then fire toasts from anywhere with <code>toast()</code>. Theme follows light/dark mode and the active palette.</p> <!> <h2>Installation</h2> <p>Install the package and peers:</p> <!> <p>Or copy <code>src/lib/components/sonner/</code> into your project. It depends on <code>svelte-sonner</code> and <code>mode-watcher</code> for theme sync.</p> <p>Mount the toaster once in your root layout:</p> <!> <h2>Usage</h2> <!> <p>Use <code>toast()</code>, <code>toast.success()</code>, <code>toast.error()</code>, <code>toast.info()</code>, <code>toast.warning()</code>, <code>toast.loading()</code>, and <code>toast.promise()</code>. Status icons ship as Phosphor glyphs.</p> <h2>Examples</h2>  <!> <h2>Props</h2> <h3>Toaster</h3> <p>Props are forwarded to <code>svelte-sonner</code>’s toaster. Common ones:</p> <!> <h3>toast()</h3> <p>Imperative API from <code>svelte-sonner</code> — re-exported from <code>fractalsvelte/sonner</code>. Call <code>toast("message")</code> or the typed helpers above. Options include <code>description</code>, <code>action</code>, <code>duration</code>, and <code>id</code> (to update an existing toast).</p> <h2>Theming</h2> <p>Toast surfaces bridge palette tokens through CSS variables on the toaster:</p> <ul><li><code>--normal-bg: var(--popover)</code></li> <li><code>--normal-text: var(--popover-foreground)</code></li> <li><code>--normal-border: var(--border)</code></li></ul> <p>Light/dark follows <code>mode-watcher</code>. Status icons use the current text colour; loading uses a spinning Phosphor spinner (<code>data-slot="sonner-spinner"</code>).</p>`,1);function w(o,s){i(s,!0);let d=[{name:`theme`,type:`"light" | "dark" | "system"`,default:`mode.current`,description:`Synced from mode-watcher. Override to lock a theme.`},{name:`position`,type:`ToasterPosition`,default:`"bottom-right"`,description:`Corner the stack anchors to.`},{name:`expand`,type:`boolean`,default:`false`,description:`Expand stacked toasts so every title stays visible.`},{name:`closeButton`,type:`boolean`,default:`false`,description:`Show a dismiss control on each toast.`},{name:`duration`,type:`number`,description:`Default auto-dismiss duration in milliseconds.`},{name:`richColors`,type:`boolean`,default:`false`,description:`Use stronger success/error/info/warning colour accents.`},{name:`visibleToasts`,type:`number`,default:`3`,description:`How many toasts stay visible before the rest collapse.`}];var x=C(),S=l(u(x),4);h(S,{description:`Sonner — toast with description and action`,code:`<Button
  variant="outline"
  onclick={() =>
    toast("Event has been created", {
      description: "Sunday, December 03, 2023 at 9:00 AM",
      action: {
        label: "Undo",
        onClick: () => console.info("Undo"),
      },
    })}
>
  Show Toast
</Button>`,children:(e,t)=>{f(e,{variant:`outline`,onclick:()=>p(`Event has been created`,{description:`Sunday, December 03, 2023 at 9:00 AM`,action:{label:`Undo`,onClick:()=>console.info(`Undo`)}}),children:(e,t)=>{r(),c(e,a(`Show Toast`))},$$slots:{default:!0}})},$$slots:{default:!0}});var w=l(S,6);m(w,{code:`npm i fractalsvelte svelte-sonner mode-watcher`,lang:`bash`});var T=l(w,6);m(T,{code:`<script lang="ts">
  import { Toaster } from "fractalsvelte/sonner";
  let { children } = $props();
<\/script>

<Toaster />
{@render children()}`,lang:`svelte`});var E=l(T,4);m(E,{code:`<script lang="ts">
  import { Toaster, toast } from "fractalsvelte/sonner";
<\/script>

<!-- Mount once near the app root -->
<Toaster />

<button type="button" onclick={() => toast("Event has been created")}>
  Show toast
</button>`,lang:`svelte`});var D=l(E,6);{let n=t(()=>[{title:`Types`,demo:v,code:`<Button variant="outline" onclick={() => toast("Event has been created")}>
  Default
</Button>
<Button variant="outline" onclick={() => toast.success("Event has been created")}>
  Success
</Button>
<Button variant="outline" onclick={() => toast.info("Be there 10 minutes early")}>
  Info
</Button>
<Button variant="outline" onclick={() => toast.warning("Start time cannot be before 8am")}>
  Warning
</Button>
<Button variant="outline" onclick={() => toast.error("Event has not been created")}>
  Error
</Button>
<Button
  variant="outline"
  onclick={() =>
    toast.promise(
      () => new Promise((resolve) => setTimeout(() => resolve({ name: "Event" }), 2000)),
      {
        loading: "Loading...",
        success: (data) => \`\${data.name} has been created\`,
        error: "Error",
      }
    )}
>
  Promise
</Button>`},{title:`Loading`,demo:y,code:`<Button
  variant="outline"
  onclick={() => {
    const id = toast.loading("Saving…");
    setTimeout(() => toast.success("Saved", { id }), 1500);
  }}
>
  Loading → success
</Button>`},{title:`Action`,demo:b,code:`<Button
  variant="outline"
  onclick={() =>
    toast("File deleted", {
      action: { label: "Undo", onClick: () => toast.success("Restored") },
    })}
>
  With action
</Button>`}]);g(D,{get items(){return e(n)}})}_(l(D,8),{get props(){return d}}),r(12),c(o,x),n()}export{w as default};