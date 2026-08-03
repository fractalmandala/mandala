import{A as e,Ft as t,Gt as n,H as r,Ht as i,It as a,K as o,M as s,U as c,Ut as l,V as u,a as d,g as f,gt as p,ht as m,l as h,mt as g,o as _,s as v}from"./CK3v5WtD.js";import"./xihTtKlq.js";import{t as y}from"./DZ2Ohr6_.js";import{t as b}from"./Cq5mj46S2.js";import{n as x,t as S}from"./mx9sK6xP2.js";import{i as C,n as w,r as T,t as E}from"./CZxLKXH62.js";import{t as D}from"./C3x0131v.js";var O=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`]);function k(i,o){a(o,!0);let c=d(o,`ref`,15,null),l=_(o,O);var f=r();e(m(f),()=>b,(e,t)=>{t(e,v({"data-slot":`sheet-trigger`},()=>l,{get ref(){return c()},set ref(e){c(e)},children:(e,t)=>{var i=r();s(m(i),()=>o.children??n),u(e,i)},$$slots:{default:!0}}))}),u(i,f),t()}var A=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`]),j=c(`<div><!></div>`);function M(e,r){a(r,!0);let i=d(r,`ref`,15,null),o=_(r,A);var c=j();f(c,()=>({"data-slot":`sheet-header`,...o})),s(g(c),()=>r.children??n),l(c),h(c,e=>i(e),()=>i()),u(e,c),t()}var N=c(`<!> <!>`,1),P=c(`<div style="display: flex; justify-content: center;"><!></div>`),F=c(`<h1 class="doc-title">Sheet</h1> <p class="doc-lede">Extends the Dialog component to display content that complements the main content of the screen.</p> <!> <h2>Installation</h2> <p>Install the package:</p> <!> <h2>Usage</h2> <!> <h2>Props</h2> <h3>Sheet.Content</h3> <!>`,1);function I(t){let n=[{name:`side`,type:`"top" | "right" | "bottom" | "left"`,default:`"right"`,description:`Direction from which the sheet enters.`},{name:`showCloseButton`,type:`boolean`,default:`true`,description:`Whether to display the top-right close icon button.`}],a=`<script lang="ts">
  import * as Sheet from "fractalsvelte/sheet";
  import { Button } from "fractalsvelte/button";
<\/script>

<Sheet.Root>
  <Sheet.Trigger>
    {#snippet child({ props })}
      <Button variant="outline" {...props}>Open Sheet</Button>
    {/snippet}
  </Sheet.Trigger>
  <Sheet.Content side="right">
    <Sheet.Header>
      <Sheet.Title>Edit profile</Sheet.Title>
      <Sheet.Description>Make changes to your profile here. Click save when you're done.</Sheet.Description>
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>`;var s=F(),c=p(m(s),4);S(c,{description:`Sheet - basic`,code:a,children:(t,n)=>{var a=P();e(g(a),()=>C,(t,n)=>{n(t,{children:(t,n)=>{var a=N(),s=m(a);{let t=(e,t)=>{y(e,v({variant:`outline`},()=>t?.().props,{children:(e,t)=>{i(),u(e,o(`Open Sheet`))},$$slots:{default:!0}}))};e(s,()=>k,(e,n)=>{n(e,{child:t,$$slots:{child:!0}})})}e(p(s,2),()=>T,(t,n)=>{n(t,{side:`right`,children:(t,n)=>{var a=r();e(m(a),()=>M,(t,n)=>{n(t,{children:(t,n)=>{var r=N(),a=m(r);e(a,()=>w,(e,t)=>{t(e,{children:(e,t)=>{i(),u(e,o(`Edit profile`))},$$slots:{default:!0}})}),e(p(a,2),()=>E,(e,t)=>{t(e,{children:(e,t)=>{i(),u(e,o(`Make changes to your profile here. Click save when you're done.`))},$$slots:{default:!0}})}),u(t,r)},$$slots:{default:!0}})}),u(t,a)},$$slots:{default:!0}})}),u(t,a)},$$slots:{default:!0}})}),l(a),u(t,a)},$$slots:{default:!0}});var d=p(c,6);x(d,{code:`npm i fractalsvelte bits-ui`,lang:`bash`});var f=p(d,4);x(f,{code:a}),D(p(f,6),{get props(){return n}}),u(t,s)}export{I as default};