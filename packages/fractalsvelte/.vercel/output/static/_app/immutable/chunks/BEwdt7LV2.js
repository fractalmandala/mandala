import{$ as e,A as t,Ct as n,Ft as r,Gt as i,H as a,Ht as o,It as s,K as c,L as l,M as u,P as d,U as f,Ut as p,V as m,W as h,a as g,ct as _,g as v,gt as y,ht as b,l as x,mt as S,o as C,s as w,v as T,z as E}from"./CK3v5WtD.js";import"./xihTtKlq.js";import{t as D}from"./DZ2Ohr6_.js";import{t as ee}from"./C5UvWnrg2.js";import{n as O,t as te}from"./mx9sK6xP2.js";import{t as ne}from"./DXVsdz3S2.js";import{t as k}from"./C3x0131v.js";var A=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`child`,`children`,`variant`,`size`]),j=f(`<div><!></div>`);function M(t,o){s(o,!0);let c=g(o,`ref`,15,null),d=g(o,`variant`,3,`default`),f=g(o,`size`,3,`default`),h=C(o,A),_=n(()=>({"data-slot":`item`,"data-variant":d(),"data-size":f(),...h}));var y=a(),w=b(y),T=t=>{var n=a();u(b(n),()=>o.child,()=>({props:e(_)})),m(t,n)},E=t=>{var n=j();v(n,()=>({...e(_)})),u(S(n),()=>o.children??i),p(n),x(n,e=>c(e),()=>c()),m(t,n)};l(w,e=>{o.child?e(T):e(E,-1)}),m(t,y),r()}var re=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`]),ie=f(`<div><!></div>`);function N(e,t){s(t,!0);let n=g(t,`ref`,15,null),a=C(t,re);var o=ie();v(o,()=>({"data-slot":`item-actions`,...a})),u(S(o),()=>t.children??i),p(o),x(o,e=>n(e),()=>n()),m(e,o),r()}var ae=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`,`gap`,`align`,`grow`]),oe=f(`<div><!></div>`);function P(e,t){s(t,!0);let n=g(t,`ref`,15,null),a=g(t,`gap`,3,`default`),o=g(t,`grow`,3,!0),c=C(t,ae);var l=oe();v(l,()=>({"data-slot":`item-content`,"data-gap":a(),"data-align":t.align,"data-grow":o(),...c})),u(S(l),()=>t.children??i),p(l),x(l,e=>n(e),()=>n()),m(e,l),r()}var F=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`,`clamp`]),I=f(`<p><!></p>`);function L(e,t){s(t,!0);let n=g(t,`ref`,15,null),a=g(t,`clamp`,3,2),o=C(t,F);var c=I();v(c,()=>({"data-slot":`item-description`,"data-clamp":a(),...o})),u(S(c),()=>t.children??i),p(c),x(c,e=>n(e),()=>n()),m(e,c),r()}var R=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`,`layout`,`gap`,`columns`,`style`]),z=f(`<div><!></div>`);function B(t,a){s(a,!0);let o=g(a,`ref`,15,null),c=g(a,`layout`,3,`default`),l=g(a,`gap`,3,`default`),d=C(a,R),f=n(()=>a.columns?`--item-group-columns: ${a.columns};${a.style??``}`:a.style);var h=z();v(h,()=>({role:`list`,"data-slot":`item-group`,"data-layout":c(),"data-gap":l(),style:e(f),...d})),u(S(h),()=>a.children??i),p(h),x(h,e=>o(e),()=>o()),m(t,h),r()}var V=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`]),H=f(`<div><!></div>`);function U(e,t){s(t,!0);let n=g(t,`ref`,15,null),a=C(t,V);var o=H();v(o,()=>({"data-slot":`item-header`,...a})),u(S(o),()=>t.children??i),p(o),x(o,e=>n(e),()=>n()),m(e,o),r()}var W=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`,`variant`,`radius`]),G=f(`<div><!></div>`);function K(e,t){s(t,!0);let n=g(t,`ref`,15,null),a=g(t,`variant`,3,`default`),o=C(t,W);var c=G();v(c,()=>({"data-slot":`item-media`,"data-variant":a(),"data-radius":t.radius,...o})),u(S(c),()=>t.children??i),p(c),x(c,e=>n(e),()=>n()),m(e,c),r()}var q=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`data-slot`,`orientation`]);function se(e,t){s(t,!0);let n=g(t,`ref`,15,null),i=g(t,`data-slot`,3,`item-separator`),a=g(t,`orientation`,3,`horizontal`),o=C(t,q);ee(e,w({get"data-slot"(){return i()},get orientation(){return a()}},()=>o,{get ref(){return n()},set ref(e){n(e)}})),r()}var ce=new Set([`$$slots`,`$$events`,`$$legacy`,`ref`,`children`,`clamp`]),le=f(`<div><!></div>`);function J(e,t){s(t,!0);let n=g(t,`ref`,15,null),a=g(t,`clamp`,3,1),o=C(t,ce);var c=le();v(c,()=>({"data-slot":`item-title`,"data-clamp":a(),...o})),u(S(c),()=>t.children??i),p(c),x(c,e=>n(e),()=>n()),m(e,c),r()}var ue=e=>{var n=X(),r=S(n);t(r,()=>M,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Default Variant`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Standard styling with subtle borders.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(i,2),()=>N,(e,t)=>{t(e,{children:(e,t)=>{D(e,{variant:`outline`,size:`sm`,children:(e,t)=>{o(),m(e,c(`Open`))},$$slots:{default:!0}})},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})});var i=y(r,2);t(i,()=>M,(e,n)=>{n(e,{variant:`outline`,children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Outline Variant`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Outlined style with a visible border.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(i,2),()=>N,(e,t)=>{t(e,{children:(e,t)=>{D(e,{variant:`outline`,size:`sm`,children:(e,t)=>{o(),m(e,c(`Open`))},$$slots:{default:!0}})},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(i,2),()=>M,(e,n)=>{n(e,{variant:`muted`,children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Muted Variant`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Subdued appearance for secondary content.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(i,2),()=>N,(e,t)=>{t(e,{children:(e,t)=>{D(e,{variant:`outline`,size:`sm`,children:(e,t)=>{o(),m(e,c(`Open`))},$$slots:{default:!0}})},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),p(n),m(e,n)},de=e=>{var n=X(),r=S(n);t(r,()=>M,(e,n)=>{n(e,{variant:`outline`,children:(e,n)=>{var r=a();t(b(r),()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Default size`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Standard spacing for common rows.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})});var i=y(r,2);t(i,()=>M,(e,n)=>{n(e,{variant:`outline`,size:`sm`,children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>K,(e,t)=>{t(e,{variant:`icon`,children:(e,t)=>{m(e,Z())},$$slots:{default:!0}})}),t(y(i,2),()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=a();t(b(r),()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Small size`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(i,2),()=>M,(e,n)=>{n(e,{variant:`outline`,size:`xs`,children:(e,n)=>{var r=a();t(b(r),()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=a();t(b(r),()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Extra small size`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),p(n),m(e,n)},fe=e=>{var n=ve(),r=S(n);t(r,()=>M,(e,n)=>{n(e,{variant:`outline`,children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>K,(e,t)=>{t(e,{variant:`icon`,children:(e,t)=>{m(e,ge())},$$slots:{default:!0}})}),t(y(i,2),()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Security Alert`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`New login detected from an unknown device.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(r,2),()=>M,(e,n)=>{n(e,{variant:`outline`,children:(e,n)=>{var r=Q(),i=b(r);t(i,()=>K,(e,t)=>{t(e,{variant:`image`,children:(e,t)=>{m(e,_e())},$$slots:{default:!0}})});var s=y(i,2);t(s,()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Midnight City Lights`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Neon Dreams`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(s,2),()=>P,(e,n)=>{n(e,{grow:!1,align:`center`,children:(e,n)=>{var r=a();t(b(r),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`3:45`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),p(n),m(e,n)},pe=e=>{var n=$();t(S(n),()=>B,(e,n)=>{n(e,{children:(e,n)=>{var r=Q(),i=b(r);t(i,()=>M,(e,n)=>{n(e,{children:(e,n)=>{var r=a();t(b(r),()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`First item`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Grouped rows keep consistent rhythm.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})});var s=y(i,2);t(s,()=>se,(e,t)=>{t(e,{})}),t(y(s,2),()=>M,(e,n)=>{n(e,{children:(e,n)=>{var r=a();t(b(r),()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Second item`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Separators inherit the item spacing.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),p(n),m(e,n)},me=e=>{var n=$(),r=S(n);{let e=(e,n)=>{let r=()=>n?.().props;var i=be();v(i,()=>({href:`#top`,...r()}));var a=S(i);t(a,()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Visit documentation`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Open a linked row with item focus states.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(a,2),()=>N,(e,t)=>{t(e,{children:(e,t)=>{m(e,ye())},$$slots:{default:!0}})}),p(i),m(e,i)};t(r,()=>M,(t,n)=>{n(t,{size:`sm`,child:e,$$slots:{child:!0}})})}p(n),m(e,n)},he=n=>{var r=Se();t(S(r),()=>B,(n,r)=>{r(n,{layout:`grid`,columns:`3`,gap:`sm`,children:(n,r)=>{var i=a();d(b(i),18,()=>[`v0-1.5-sm`,`v0-1.5-lg`,`v0-2.0-mini`],e=>e,(n,r,i)=>{var s=a();t(b(s),()=>M,(n,a)=>{a(n,{variant:`outline`,children:(n,a)=>{var s=Y(),l=b(s);t(l,()=>U,(t,n)=>{n(t,{children:(t,n)=>{var a=xe();_(()=>{T(a,`src`,`https://avatar.vercel.sh/${r}-${e(i)}`),T(a,`alt`,r)}),m(t,a)},$$slots:{default:!0}})}),t(y(l,2),()=>P,(e,n)=>{n(e,{children:(e,n)=>{var i=Y(),a=b(i);t(a,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o();var n=c();_(()=>E(n,r)),m(e,n)},$$slots:{default:!0}})}),t(y(a,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Everyday tasks and UI generation.`))},$$slots:{default:!0}})}),m(e,i)},$$slots:{default:!0}})}),m(n,s)},$$slots:{default:!0}})}),m(n,s)}),m(n,i)},$$slots:{default:!0}})}),p(r),m(n,r)},Y=f(`<!> <!>`,1),X=f(`<div class="box" style="gap:1rem; width:min(100%,28rem)"><!> <!> <!></div>`),Z=h(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"></path></svg>`),ge=h(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`),_e=f(`<img src="https://avatar.vercel.sh/midnight-city-lights" alt="Midnight City Lights"/>`),Q=f(`<!> <!> <!>`,1),ve=f(`<div class="box" style="gap:1rem; width:min(100%,28rem)"><!> <!></div>`),$=f(`<div style="width:min(100%,28rem)"><!></div>`),ye=h(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"></path></svg>`),be=f(`<a><!> <!></a>`),xe=f(`<img width="128" height="128" style="aspect-ratio:1; width:100%; border-radius:var(--radius); object-fit:cover"/>`),Se=f(`<div style="width:min(100%,34rem)"><!></div>`),Ce=f(`<h1 class="doc-title">Item</h1> <p class="doc-lede">Displays a flexible content row with media, body text, and actions.</p> <!> <h2>Installation</h2> <p>Install the package:</p> <!> <p>Or copy <code>src/lib/components/item/</code> into your project. It depends on <code>separator</code>, and expects <code>styles/_mixins.sass</code> and <code>styles/_tokens.sass</code> to exist.</p> <h2>Usage</h2> <!> <h2>Examples</h2>    <!> <h2>Props</h2> <!> <h2>Theming</h2> <div class="doc-table-wrap"><table><thead><tr><th>Token</th><th>Used for</th></tr></thead><tbody><tr><td><code>--background</code></td><td>Action buttons used in examples.</td></tr><tr><td><code>--border</code></td><td>Outline item borders.</td></tr><tr><td><code>--muted</code></td><td>Muted item fill and anchor hover.</td></tr><tr><td><code>--muted-foreground</code></td><td>Item descriptions.</td></tr><tr><td><code>--primary</code></td><td>Hovered links inside descriptions.</td></tr><tr><td><code>--ring</code></td><td>Focus-visible ring.</td></tr><tr><td><code>--radius</code></td><td>Image media radius.</td></tr><tr><td><code>--text-sm</code></td><td>Item text size.</td></tr><tr><td><code>--text-sm--line-height</code></td><td>Item text line height.</td></tr></tbody></table></div>`,1);function we(r){let i=[{name:`variant`,type:`"default" | "outline" | "muted"`,default:`"default"`,description:`Root visual style. Rendered as data-variant.`},{name:`size`,type:`"default" | "sm" | "xs"`,default:`"default"`,description:`Root padding, gap, and descendant media sizing. Rendered as data-size.`},{name:`child`,type:`Snippet`,description:`Render another root element, such as an anchor, with item props applied.`},{name:`ref`,type:`HTMLDivElement | null`,default:`null`,description:`Bindable reference to the rendered root element.`},{name:`children`,type:`Snippet`,description:`Root content, usually Item.Content with optional media and actions.`},{name:`Item.Group layout`,type:`"default" | "grid"`,default:`"default"`,description:`Group layout. Grid mode uses the columns prop.`},{name:`Item.Group columns`,type:`string`,description:`Grid column count, written to --item-group-columns.`},{name:`Item.Group gap`,type:`"default" | "xs" | "sm" | "lg"`,default:`"default"`,description:`Overrides the group gap when root size matching is not enough.`},{name:`Item.Content gap`,type:`"default" | "none" | "xs" | "sm"`,default:`"default"`,description:`Content stack gap.`},{name:`Item.Content align`,type:`"start" | "center" | "end"`,description:`Text alignment for secondary content columns.`},{name:`Item.Content grow`,type:`boolean`,default:`true`,description:`Set false for fixed-width secondary content.`},{name:`Item.Title clamp`,type:`1 | 2 | "none"`,default:`1`,description:`Line clamp for the title.`},{name:`Item.Description clamp`,type:`1 | 2 | "none"`,default:`2`,description:`Line clamp for the description.`},{name:`Item.Media variant`,type:`"default" | "icon" | "image"`,default:`"default"`,description:`Media presentation. Image media resizes with the root size.`},{name:`Item.Media radius`,type:`"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"`,description:`Media corner radius. Omit to keep the skin default.`}],a=`<script lang="ts">
  import * as Item from "fractalsvelte/item";
<\/script>

<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>Basic item</Item.Title>
    <Item.Description>A compact content row with actions.</Item.Description>
  </Item.Content>
</Item.Root>`;var s=Ce(),l=y(b(s),4);te(l,{description:`Item — outline row with action`,code:a,children:(e,n)=>{var r=$();t(S(r),()=>M,(e,n)=>{n(e,{variant:`outline`,children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>P,(e,n)=>{n(e,{children:(e,n)=>{var r=Y(),i=b(r);t(i,()=>J,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`Basic Item`))},$$slots:{default:!0}})}),t(y(i,2),()=>L,(e,t)=>{t(e,{children:(e,t)=>{o(),m(e,c(`A simple item with title and description.`))},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),t(y(i,2),()=>N,(e,t)=>{t(e,{children:(e,t)=>{D(e,{variant:`outline`,size:`sm`,children:(e,t)=>{o(),m(e,c(`Action`))},$$slots:{default:!0}})},$$slots:{default:!0}})}),m(e,r)},$$slots:{default:!0}})}),p(r),m(e,r)},$$slots:{default:!0}});var u=y(l,6);O(u,{code:`npm i fractalsvelte`,lang:`bash`});var d=y(u,6);O(d,{code:a});var f=y(d,4);{let t=n(()=>[{title:`Variants`,demo:ue,code:`<Item.Root>
  <Item.Content>
    <Item.Title>Default variant</Item.Title>
    <Item.Description>Subtle row styling with transparent border.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>Outline variant</Item.Title>
    <Item.Description>A visible border around the row.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="muted">
  <Item.Content>
    <Item.Title>Muted variant</Item.Title>
    <Item.Description>A quiet filled treatment.</Item.Description>
  </Item.Content>
</Item.Root>`},{title:`Sizes`,demo:de,code:`<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>Default size</Item.Title>
    <Item.Description>Standard row spacing.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline" size="sm">
  <Item.Content>
    <Item.Title>Small size</Item.Title>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline" size="xs">
  <Item.Content>
    <Item.Title>Extra small size</Item.Title>
  </Item.Content>
</Item.Root>`},{title:`Media`,demo:fe,code:`<Item.Root variant="outline">
  <Item.Media variant="icon">
    <ShieldIcon />
  </Item.Media>
  <Item.Content>
    <Item.Title>Security alert</Item.Title>
    <Item.Description>New login detected from an unknown device.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline">
  <Item.Media variant="image">
    <img src="/cover.jpg" alt="Album cover" />
  </Item.Media>
  <Item.Content>
    <Item.Title>Midnight City Lights</Item.Title>
    <Item.Description>Neon Dreams</Item.Description>
  </Item.Content>
</Item.Root>`},{title:`Group`,demo:pe,code:`<Item.Group>
  <Item.Root>
    <Item.Content>
      <Item.Title>First item</Item.Title>
      <Item.Description>Grouped rows keep consistent rhythm.</Item.Description>
    </Item.Content>
  </Item.Root>
  <Item.Separator />
  <Item.Root>
    <Item.Content>
      <Item.Title>Second item</Item.Title>
      <Item.Description>Separators inherit the item spacing.</Item.Description>
    </Item.Content>
  </Item.Root>
</Item.Group>`},{title:`Link`,demo:me,code:`<Item.Root size="sm">
  {#snippet child({ props })}
    <a href="/docs" {...props}>
      <Item.Content>
        <Item.Title>Visit documentation</Item.Title>
        <Item.Description>Open a linked row with item focus states.</Item.Description>
      </Item.Content>
      <Item.Actions>
        <ArrowRightIcon />
      </Item.Actions>
    </a>
  {/snippet}
</Item.Root>`},{title:`Grid`,demo:he,code:`<Item.Group layout="grid" columns="3">
  <Item.Root variant="outline">
    <Item.Header>
      <img src="/image.jpg" alt="Model" />
    </Item.Header>
    <Item.Content>
      <Item.Title>v0-1.5-sm</Item.Title>
      <Item.Description>Everyday tasks and UI generation.</Item.Description>
    </Item.Content>
  </Item.Root>
</Item.Group>`}]);ne(f,{get items(){return e(t)}})}k(y(f,4),{get props(){return i}}),o(4),m(r,s)}export{we as default};