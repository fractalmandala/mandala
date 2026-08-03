function e(e){let t=e-1;return t*t*t+1}function t(e){let t=typeof e==`string`&&e.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return t?[parseFloat(t[1]),t[2]||`px`]:[e,`px`]}function n(n,{delay:r=0,duration:i=400,easing:a=e,x:o=0,y:s=0,opacity:c=0}={}){let l=getComputedStyle(n),u=+l.opacity,d=l.transform===`none`?``:l.transform,f=u*(1-c),[p,m]=t(o),[h,g]=t(s);return{delay:r,duration:i,easing:a,css:(e,t)=>`
			transform: ${d} translate(${(1-e)*p}${m}, ${(1-e)*h}${g});
			opacity: ${u-f*t}`}}function r(t,{delay:n=0,duration:r=400,easing:i=e,start:a=0,opacity:o=0}={}){let s=getComputedStyle(t),c=+s.opacity,l=s.transform===`none`?``:s.transform,u=1-a,d=c*(1-o);return{delay:n,duration:r,easing:i,css:(e,t)=>`
			transform: ${l} scale(${1-u*t});
			opacity: ${c-d*t}
		`}}export{r as n,n as t};