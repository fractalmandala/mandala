import{$ as e,A as t,Ct as n,H as r,Ht as i,U as a,V as o,gt as s,ht as c}from"./CK3v5WtD.js";import"./xihTtKlq.js";import{n as l,t as u}from"./mx9sK6xP2.js";import{t as d}from"./DXVsdz3S2.js";import{n as f,r as p,t as m}from"./DCGTAzc2.js";import{t as h}from"./C3x0131v.js";var g=e=>{var n=r();t(c(n),()=>m,(e,n)=>{n(e,{direction:`horizontal`,maxWidth:`28rem`,bordered:!0,radius:`lg`,children:(e,n)=>{var i=S(),a=c(i);t(a,()=>p,(e,t)=>{t(e,{defaultSize:50,children:(e,t)=>{o(e,y())},$$slots:{default:!0}})});var l=s(a,2);t(l,()=>f,(e,t)=>{t(e,{})}),t(s(l,2),()=>p,(e,n)=>{n(e,{defaultSize:50,children:(e,n)=>{var i=r();t(c(i),()=>m,(e,n)=>{n(e,{direction:`vertical`,children:(e,n)=>{var r=S(),i=c(r);t(i,()=>p,(e,t)=>{t(e,{defaultSize:25,children:(e,t)=>{o(e,b())},$$slots:{default:!0}})});var a=s(i,2);t(a,()=>f,(e,t)=>{t(e,{})}),t(s(a,2),()=>p,(e,t)=>{t(e,{defaultSize:75,children:(e,t)=>{o(e,x())},$$slots:{default:!0}})}),o(e,r)},$$slots:{default:!0}})}),o(e,i)},$$slots:{default:!0}})}),o(e,i)},$$slots:{default:!0}})}),o(e,n)},_=e=>{var n=r();t(c(n),()=>m,(e,n)=>{n(e,{direction:`vertical`,maxWidth:`28rem`,minHeight:`200px`,bordered:!0,radius:`lg`,children:(e,n)=>{var r=S(),i=c(r);t(i,()=>p,(e,t)=>{t(e,{defaultSize:25,children:(e,t)=>{o(e,C())},$$slots:{default:!0}})});var a=s(i,2);t(a,()=>f,(e,t)=>{t(e,{})}),t(s(a,2),()=>p,(e,t)=>{t(e,{defaultSize:75,children:(e,t)=>{o(e,w())},$$slots:{default:!0}})}),o(e,r)},$$slots:{default:!0}})}),o(e,n)},v=e=>{var n=r();t(c(n),()=>m,(e,n)=>{n(e,{direction:`horizontal`,maxWidth:`28rem`,minHeight:`200px`,bordered:!0,radius:`lg`,children:(e,n)=>{var r=S(),i=c(r);t(i,()=>p,(e,t)=>{t(e,{defaultSize:25,children:(e,t)=>{o(e,T())},$$slots:{default:!0}})});var a=s(i,2);t(a,()=>f,(e,t)=>{t(e,{withHandle:!0})}),t(s(a,2),()=>p,(e,t)=>{t(e,{defaultSize:75,children:(e,t)=>{o(e,w())},$$slots:{default:!0}})}),o(e,r)},$$slots:{default:!0}})}),o(e,n)},y=a(`<div class="box" style="height:200px; align-items:center; justify-content:center; padding:1.5rem"><span style="font-weight:600">One</span></div>`),b=a(`<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem"><span style="font-weight:600">Two</span></div>`),x=a(`<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem"><span style="font-weight:600">Three</span></div>`),S=a(`<!> <!> <!>`,1),C=a(`<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem"><span style="font-weight:600">Header</span></div>`),w=a(`<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem"><span style="font-weight:600">Content</span></div>`),T=a(`<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem"><span style="font-weight:600">Sidebar</span></div>`),E=a(`<h1 class="doc-title">Resizable</h1> <p class="doc-lede">Accessible, draggable split panes with keyboard support. Compose a <code>PaneGroup</code> with <code>Pane</code>s separated by a <code>Handle</code>, horizontally or vertically.</p> <!> <h2>Installation</h2> <p>Install the package:</p> <!> <p>Or copy <code>src/lib/components/resizable/</code> into your project. It depends on <code>paneforge</code>, and it
expects the library tokens to exist.</p> <h2>Usage</h2> <!> <p><code>Pane</code> is re-exported from paneforge. Put content inside each pane; sizes are percentages of the group. Size the group with <code>minHeight</code> / <code>maxWidth</code> (or a sized parent) — paneforge owns inline <code>height</code> and <code>width</code>.</p> <h2>Examples</h2>  <!> <h2>Props</h2> <h3>PaneGroup</h3> <!> <h3>Handle</h3> <!> <h3>Pane</h3> <p>Re-exported from paneforge. Common props:</p> <!> <h2>Theming</h2> <div class="doc-table-wrap"><table><thead><tr><th>Token</th><th>Used for</th></tr></thead><tbody><tr><td><code>--border</code></td><td>Handle line, grip pill, optional group border</td></tr><tr><td><code>--background</code></td><td>Focus ring offset colour</td></tr><tr><td><code>--ring</code></td><td>Focus ring colour</td></tr><tr><td><code>--radius</code></td><td>Grip pill and group <code>radius="lg"</code></td></tr></tbody></table></div>`,1);function D(a){let C=[{name:`direction`,type:`"horizontal" | "vertical"`,description:`Axis of the pane split. Required. Applied as data-direction by paneforge.`},{name:`bordered`,type:`boolean`,default:`false`,description:`Adds a token border around the group.`},{name:`radius`,type:`"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"`,description:`Corner radius. Omit to keep square edges.`},{name:`maxWidth`,type:`string`,description:`CSS max-width. Prefer over width — paneforge sets width: 100% inline.`},{name:`minHeight`,type:`string`,description:`CSS min-height. Prefer over height — paneforge sets height: 100% inline.`},{name:`maxHeight`,type:`string`,description:`CSS max-height for the group.`},{name:`autoSaveId`,type:`string | null`,description:`When set, layout is persisted to storage under this id.`},{name:`keyboardResizeBy`,type:`number | null`,description:`Step size (percentage) for keyboard resize.`},{name:`onLayoutChange`,type:`(layout: number[]) => void`,description:`Called when pane sizes change.`},{name:`storage`,type:`PaneGroupStorage`,description:`Storage adapter used with autoSaveId. Defaults to localStorage.`},{name:`ref`,type:`HTMLElement | null`,default:`null`,description:`Bindable reference to the group element.`},{name:`this`,type:`PaneGroup`,description:`Bindable paneforge instance (getLayout, setLayout, getId).`},{name:`children`,type:`Snippet`,description:`Panes and handles.`}],w=[{name:`withHandle`,type:`boolean`,default:`false`,description:`Shows the grip pill on the resize handle.`},{name:`disabled`,type:`boolean`,default:`false`,description:`Disables dragging and keyboard resize.`},{name:`onDraggingChange`,type:`(dragging: boolean) => void`,description:`Called when a drag starts or ends.`},{name:`tabindex`,type:`number`,default:`0`,description:`Tab index of the handle element.`},{name:`ref`,type:`HTMLElement | null`,default:`null`,description:`Bindable reference to the handle element.`}],T=[{name:`defaultSize`,type:`number`,description:`Initial size as a percentage of the group.`},{name:`minSize`,type:`number`,default:`0`,description:`Minimum size as a percentage of the group.`},{name:`maxSize`,type:`number`,default:`100`,description:`Maximum size as a percentage of the group.`},{name:`collapsible`,type:`boolean`,default:`false`,description:`Allow the pane to collapse past minSize.`},{name:`collapsedSize`,type:`number`,description:`Size when collapsed.`},{name:`order`,type:`number`,description:`Stable order when panes are conditionally rendered.`},{name:`onCollapse / onExpand / onResize`,type:`function`,description:`Lifecycle callbacks from paneforge.`},{name:`children`,type:`Snippet`,description:`Pane content.`}],D=`<Resizable.PaneGroup direction="horizontal" maxWidth="28rem" bordered radius="lg">
  <Resizable.Pane defaultSize={50}>
    <div class="box" style="height:200px; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">One</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={50}>
    <Resizable.PaneGroup direction="vertical">
      <Resizable.Pane defaultSize={25}>
        <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
          <span style="font-weight:600">Two</span>
        </div>
      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane defaultSize={75}>
        <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
          <span style="font-weight:600">Three</span>
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </Resizable.Pane>
</Resizable.PaneGroup>`;var O=E(),k=s(c(O),4);u(k,{description:`Nested horizontal and vertical panes`,code:D,children:(e,n)=>{var i=r();t(c(i),()=>m,(e,n)=>{n(e,{direction:`horizontal`,maxWidth:`28rem`,bordered:!0,radius:`lg`,children:(e,n)=>{var i=S(),a=c(i);t(a,()=>p,(e,t)=>{t(e,{defaultSize:50,children:(e,t)=>{o(e,y())},$$slots:{default:!0}})});var l=s(a,2);t(l,()=>f,(e,t)=>{t(e,{})}),t(s(l,2),()=>p,(e,n)=>{n(e,{defaultSize:50,children:(e,n)=>{var i=r();t(c(i),()=>m,(e,n)=>{n(e,{direction:`vertical`,children:(e,n)=>{var r=S(),i=c(r);t(i,()=>p,(e,t)=>{t(e,{defaultSize:25,children:(e,t)=>{o(e,b())},$$slots:{default:!0}})});var a=s(i,2);t(a,()=>f,(e,t)=>{t(e,{})}),t(s(a,2),()=>p,(e,t)=>{t(e,{defaultSize:75,children:(e,t)=>{o(e,x())},$$slots:{default:!0}})}),o(e,r)},$$slots:{default:!0}})}),o(e,i)},$$slots:{default:!0}})}),o(e,i)},$$slots:{default:!0}})}),o(e,i)},$$slots:{default:!0}});var A=s(k,6);l(A,{code:`npm i fractalsvelte paneforge`,lang:`bash`});var j=s(A,6);l(j,{code:`<script lang="ts">
  import * as Resizable from "fractalsvelte/resizable";
<\/script>

<Resizable.PaneGroup direction="horizontal" minHeight="200px" bordered radius="lg">
  <Resizable.Pane defaultSize={50}>One</Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={50}>Two</Resizable.Pane>
</Resizable.PaneGroup>`,lang:`svelte`});var M=s(j,6);{let t=n(()=>[{title:`Nested`,demo:g,code:D},{title:`Vertical`,demo:_,code:`<Resizable.PaneGroup direction="vertical" maxWidth="28rem" minHeight="200px" bordered radius="lg">
  <Resizable.Pane defaultSize={25}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Header</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={75}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Content</span>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>`},{title:`With handle`,demo:v,code:`<Resizable.PaneGroup direction="horizontal" maxWidth="28rem" minHeight="200px" bordered radius="lg">
  <Resizable.Pane defaultSize={25}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Sidebar</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={75}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Content</span>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>`}]);d(M,{get items(){return e(t)}})}var N=s(M,6);h(N,{get props(){return C}});var P=s(N,4);h(P,{get props(){return w}}),h(s(P,6),{get props(){return T}}),i(4),o(a,O)}export{D as default};