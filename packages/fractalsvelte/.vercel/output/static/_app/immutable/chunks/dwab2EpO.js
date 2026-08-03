import{$ as e,A as t,Ct as n,H as r,Ht as i,K as a,U as o,Ut as s,V as c,W as l,gt as u,ht as d,mt as f,xt as p,yt as m}from"./CK3v5WtD.js";import"./xihTtKlq.js";import{t as h}from"./fGNsG4H1.js";import{n as g,t as _}from"./CmPwngWZ.js";import{n as v,t as y}from"./mx9sK6xP2.js";import{t as b}from"./DXVsdz3S2.js";import{t as x}from"./C3x0131v.js";var S=e=>{c(e,E())},C=e=>{var n=r();t(d(n),()=>g,(e,n)=>{n(e,{value:`custom`,"aria-label":`Custom radio indicator`,children:(e,n)=>{var i=r();t(d(i),()=>_,(e,t)=>{t(e,{value:`custom`,get indicator(){return S},"aria-label":`Custom indicator`})}),c(e,i)},$$slots:{default:!0}})}),c(e,n)},w=o(`<div class="row" style="align-items:center; gap:0.5rem"><!> <!></div> <div class="row" style="align-items:center; gap:0.5rem"><!> <!></div> <div class="row" style="align-items:center; gap:0.5rem"><!> <!></div>`,1),T=o(`<div class="row" style="align-items:center; gap:0.5rem"><!> <!></div> <div class="row" style="align-items:center; gap:0.5rem"><!> <!></div>`,1),E=l(`<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="5" r="4"></circle></svg>`),D=o(`<h1 class="doc-title">Radio Group</h1> <p class="doc-lede">A set of checkable controls where one option can be selected at a time.</p> <!> <h2>Installation</h2> <p>Install the package:</p> <!> <p>Or copy <code>src/lib/components/radio-group/</code> into your project. It depends on <code>bits-ui</code>, and it
expects <code>styles/_mixins.sass</code>, <code>_tokens.sass</code> and <code>_typography.sass</code> to exist.</p> <h2>Usage</h2> <!> <h2>Examples</h2>   <!> <h2>Props</h2> <!> <h2>Theming</h2> <p>Radio Group reads <code>--input</code>, <code>--primary</code>, <code>--primary-foreground</code>, <code>--ring</code>, <code>--destructive</code> and the shared foreground tokens. Focus and invalid rings use token opacity through <code>color-mix</code>.</p>`,1);function O(o){let l=n=>{var o=r();t(d(o),()=>g,(n,r)=>{r(n,{get value(){return e(O)},set value(e){m(O,e,!0)},children:(e,n)=>{var r=w(),o=d(r),l=f(o);t(l,()=>_,(e,t)=>{t(e,{value:`default`,id:`radio-basic-default`})}),h(u(l,2),{for:`radio-basic-default`,children:(e,t)=>{i(),c(e,a(`Default`))},$$slots:{default:!0}}),s(o);var p=u(o,2),m=f(p);t(m,()=>_,(e,t)=>{t(e,{value:`comfortable`,id:`radio-basic-comfortable`})}),h(u(m,2),{for:`radio-basic-comfortable`,children:(e,t)=>{i(),c(e,a(`Comfortable`))},$$slots:{default:!0}}),s(p);var g=u(p,2),v=f(g);t(v,()=>_,(e,t)=>{t(e,{value:`compact`,id:`radio-basic-compact`})}),h(u(v,2),{for:`radio-basic-compact`,children:(e,t)=>{i(),c(e,a(`Compact`))},$$slots:{default:!0}}),s(g),c(e,r)},$$slots:{default:!0}})}),c(n,o)},S=n=>{var o=r();t(d(o),()=>g,(n,r)=>{r(n,{orientation:`horizontal`,class:`row`,style:`gap:1rem`,get value(){return e(k)},set value(e){m(k,e,!0)},children:(e,n)=>{var r=w(),o=d(r),l=f(o);t(l,()=>_,(e,t)=>{t(e,{value:`all`,id:`radio-all`})}),h(u(l,2),{for:`radio-all`,children:(e,t)=>{i(),c(e,a(`All`))},$$slots:{default:!0}}),s(o);var p=u(o,2),m=f(p);t(m,()=>_,(e,t)=>{t(e,{value:`mentions`,id:`radio-mentions`})}),h(u(m,2),{for:`radio-mentions`,children:(e,t)=>{i(),c(e,a(`Mentions`))},$$slots:{default:!0}}),s(p);var g=u(p,2),v=f(g);t(v,()=>_,(e,t)=>{t(e,{value:`none`,id:`radio-none`})}),h(u(v,2),{for:`radio-none`,children:(e,t)=>{i(),c(e,a(`None`))},$$slots:{default:!0}}),s(g),c(e,r)},$$slots:{default:!0}})}),c(n,o)},E=n=>{var o=r();t(d(o),()=>g,(n,r)=>{r(n,{"aria-label":`Notification preference`,get value(){return e(A)},set value(e){m(A,e,!0)},children:(e,n)=>{var r=T(),o=d(r),l=f(o);t(l,()=>_,(e,t)=>{t(e,{value:`all`,id:`radio-invalid-all`})}),h(u(l,2),{for:`radio-invalid-all`,children:(e,t)=>{i(),c(e,a(`All messages`))},$$slots:{default:!0}}),s(o);var p=u(o,2),m=f(p);t(m,()=>_,(e,t)=>{t(e,{value:`none`,id:`radio-invalid-none`,"aria-invalid":`true`})}),h(u(m,2),{for:`radio-invalid-none`,children:(e,t)=>{i(),c(e,a(`Nothing`))},$$slots:{default:!0}}),s(p),c(e,r)},$$slots:{default:!0}})}),c(n,o)},O=p(`comfortable`),k=p(`mentions`),A=p(`none`),j=[{name:`Root value`,type:`string`,default:`""`,description:`Bindable selected item value.`},{name:`orientation`,type:`"horizontal" | "vertical"`,default:`"vertical"`,description:`Keyboard navigation direction passed to the root.`},{name:`loop`,type:`boolean`,default:`true`,description:`Whether keyboard navigation wraps at the ends.`},{name:`name`,type:`string`,description:`Name used for form submission when hidden inputs are rendered.`},{name:`disabled`,type:`boolean`,default:`false`,description:`Disables the whole group or an individual item.`},{name:`readonly`,type:`boolean`,default:`false`,description:`Keeps items focusable while preventing value changes.`},{name:`required`,type:`boolean`,default:`false`,description:`Marks the group as required for form submission.`},{name:`Item value`,type:`string`,description:`Item value. Required on RadioGroup.Item.`},{name:`indicator`,type:`Snippet`,description:`Custom selected indicator for RadioGroup.Item. Omit to use the built-in dot.`},{name:`aria-invalid`,type:`boolean`,description:`Switches an item to the destructive border and ring treatment.`},{name:`children`,type:`Snippet`,description:`Group contents or item snippet contents.`},{name:`child`,type:`Snippet`,description:`Renders a custom element with the bits-ui behaviour and attributes applied.`},{name:`ref`,type:`HTMLDivElement | HTMLButtonElement | null`,default:`null`,description:`Bindable reference to the root group or item button.`}],M=`<script lang="ts">
  import { Label } from "fractalsvelte/label";
  import * as RadioGroup from "fractalsvelte/radio-group";
<\/script>

<RadioGroup.Root value="comfortable">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="default" id="default" />
    <Label for="default">Default</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="comfortable" id="comfortable" />
    <Label for="comfortable">Comfortable</Label>
  </div>
</RadioGroup.Root>`;var N=D(),P=u(d(N),4);y(P,{description:`Radio Group — density setting`,code:M,children:(n,o)=>{var l=r();t(d(l),()=>g,(n,r)=>{r(n,{get value(){return e(O)},set value(e){m(O,e,!0)},children:(e,n)=>{var r=w(),o=d(r),l=f(o);t(l,()=>_,(e,t)=>{t(e,{value:`default`,id:`density-default-preview`})}),h(u(l,2),{for:`density-default-preview`,children:(e,t)=>{i(),c(e,a(`Default`))},$$slots:{default:!0}}),s(o);var p=u(o,2),m=f(p);t(m,()=>_,(e,t)=>{t(e,{value:`comfortable`,id:`density-comfortable-preview`})}),h(u(m,2),{for:`density-comfortable-preview`,children:(e,t)=>{i(),c(e,a(`Comfortable`))},$$slots:{default:!0}}),s(p);var g=u(p,2),v=f(g);t(v,()=>_,(e,t)=>{t(e,{value:`compact`,id:`density-compact-preview`})}),h(u(v,2),{for:`density-compact-preview`,children:(e,t)=>{i(),c(e,a(`Compact`))},$$slots:{default:!0}}),s(g),c(e,r)},$$slots:{default:!0}})}),c(n,l)},$$slots:{default:!0}});var F=u(P,6);v(F,{code:`npm i fractalsvelte bits-ui`,lang:`bash`});var I=u(F,6);v(I,{code:M});var L=u(I,4);{let t=n(()=>[{title:`Basic`,demo:l,code:`<RadioGroup.Root value="comfortable">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="default" id="r1" />
    <Label for="r1">Default</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="comfortable" id="r2" />
    <Label for="r2">Comfortable</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="compact" id="r3" />
    <Label for="r3">Compact</Label>
  </div>
</RadioGroup.Root>`},{title:`Horizontal`,demo:S,code:`<RadioGroup.Root orientation="horizontal" value="mentions" class="row" style="gap:1rem">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="all" id="all" />
    <Label for="all">All</Label>
  </div>
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="mentions" id="mentions" />
    <Label for="mentions">Mentions</Label>
  </div>
</RadioGroup.Root>`,description:`Set orientation on the root when the choices are arranged in a row.`},{title:`Invalid`,demo:E,code:`<RadioGroup.Root value="none" aria-label="Notification preference">
  <div class="row" style="align-items:center; gap:0.5rem">
    <RadioGroup.Item value="none" id="invalid-none" aria-invalid="true" />
    <Label for="invalid-none">Nothing</Label>
  </div>
</RadioGroup.Root>`,description:`Use aria-invalid on an item to show validation state.`},{title:`Custom indicator`,demo:C,code:`{#snippet ringIndicator()}
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="5" cy="5" r="4" />
  </svg>
{/snippet}

<RadioGroup.Item value="custom" indicator={ringIndicator} aria-label="Custom" />`,description:`Pass an indicator snippet to replace the default selected dot.`}]);b(L,{get items(){return e(t)}})}x(u(L,4),{get props(){return j}}),i(4),c(o,N)}export{O as default};