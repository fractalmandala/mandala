import{$ as e,Ct as t,Ft as n,Ht as r,It as i,U as a,Ut as o,V as s,gt as c,ht as l,mt as u,r as d,xt as f,yt as p}from"./CK3v5WtD.js";import"./xihTtKlq.js";import{t as m}from"./BqMmZ1BO.js";import{n as h,t as g}from"./mx9sK6xP2.js";import{t as _}from"./DXVsdz3S2.js";import{t as v}from"./C3x0131v.js";var y=e=>{var t=x(),n=u(t);m(n,{value:42,width:`16rem`}),m(c(n,2),{value:72,width:`100%`}),o(t),s(e,t)},b=e=>{m(e,{value:32,min:20,max:80,width:`18rem`})},x=a(`<div class="box" style="gap:1rem; width:min(100%, 24rem)"><!> <!></div>`),S=a(`<h1 class="doc-title">Progress</h1> <p class="doc-lede">A horizontal indicator for showing task completion.</p> <!> <h2>Installation</h2> <p>Install the package:</p> <!> <p>Or copy <code>src/lib/components/progress/</code> into your project. It depends on <code>bits-ui</code>, and it
expects the library tokens and typography styles to exist.</p> <h2>Usage</h2> <!> <h2>Examples</h2>  <!> <h2>Props</h2> <!> <h2>Theming</h2> <p>Progress reads <code>--muted</code> for the track, <code>--primary</code> for the indicator and the shared text
scale tokens through the surrounding document chrome. The root fills its container by
default; set <code>width</code> when the progress bar needs its own fixed or percentage width.</p>`,1);function C(a,o){i(o,!0);let u=t=>{m(t,{get value(){return e(x)},max:100,width:`60%`})},x=f(13);d(()=>{let e=window.setTimeout(()=>p(x,66),500);return()=>window.clearTimeout(e)});let C=[{name:`value`,type:`number | null`,default:`0`,description:`Current progress value. Set to null for an indeterminate ARIA state.`},{name:`max`,type:`number`,default:`100`,description:`Maximum progress value.`},{name:`min`,type:`number`,default:`0`,description:`Minimum progress value used when calculating the indicator transform.`},{name:`width`,type:`string`,description:`CSS width for the root element. Omit to fill the available width.`},{name:`ref`,type:`HTMLDivElement | null`,default:`null`,description:`Bindable reference to the root element.`}],w=`<script lang="ts">
  import { Progress } from "fractalsvelte/progress";
<\/script>

<Progress value={66} max={100} />`;var T=S(),E=c(l(T),4);g(E,{description:`Progress — animated value`,code:w,children:(t,n)=>{m(t,{get value(){return e(x)},max:100,width:`60%`})},$$slots:{default:!0}});var D=c(E,6);h(D,{code:`npm i fractalsvelte bits-ui`,lang:`bash`});var O=c(D,6);h(O,{code:w});var k=c(O,4);{let n=t(()=>[{title:`Demo`,demo:u,code:`<script lang="ts">
  import { onMount } from "svelte";
  import { Progress } from "fractalsvelte/progress";

  let value = $state(13);

  onMount(() => {
    const timer = window.setTimeout(() => (value = 66), 500);
    return () => window.clearTimeout(timer);
  });
<\/script>

<Progress {value} max={100} width="60%" />`},{title:`Width`,demo:y,code:`<Progress value={42} width="16rem" />
<Progress value={72} width="100%" />`},{title:`Range`,demo:b,code:`<Progress value={32} min={20} max={80} />`}]);_(k,{get items(){return e(n)}})}v(c(k,4),{get props(){return C}}),r(4),s(a,T),n()}export{C as default};