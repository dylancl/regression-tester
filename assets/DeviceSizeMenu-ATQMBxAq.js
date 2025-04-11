import{c as w,e as k}from"./index-9eOP6H1w.js";import{u as b,j as t,_ as M,O as C,d as l,f as g,n as x,ai as P,e as I,ag as O,aM as L,aN as D,aO as F,a3 as E}from"./mui-Be33Q-K3.js";import{r as N}from"./vendor-By_F_pnL.js";const y="toyota-regression-tester-single-view-config",f="toyota-regression-tester-multibox-view-config",z={environment:"prev",component:"car-filter",uscContext:"used",uscEnv:"uat",brand:"toyota",variantBrand:"toyota",device:"desktop"},_=o=>{try{localStorage.setItem(y,JSON.stringify(o))}catch(i){console.error("Failed to save Single View configuration",i)}},$=()=>{try{const o=localStorage.getItem(y);if(o)return JSON.parse(o)}catch(o){console.error("Failed to load Single View configuration",o)}return{selectedOptions:{...z},countryLanguageCode:Object.keys(w)[0]}},T=o=>{try{localStorage.setItem(f,JSON.stringify(o))}catch(i){console.error("Failed to save Multibox configuration",i)}},V=()=>{try{const o=localStorage.getItem(f);if(o)return JSON.parse(o)}catch(o){console.error("Failed to load Multibox configuration",o)}return null},A=[{name:"iPhone SE",width:375,height:667,category:"mobile",description:"Smaller Apple form factor"},{name:"iPhone 12/13/14",width:390,height:844,category:"mobile",description:"Standard size iPhones"},{name:"iPhone 12/13/14 Pro Max",width:428,height:926,category:"mobile",description:"Plus/Max variants"},{name:"Android Small",width:360,height:640,category:"mobile",description:"Google Pixel, Samsung Galaxy S base models"},{name:"Android Large",width:412,height:915,category:"mobile",description:"Samsung Galaxy Ultra, Google Pixel XL"},{name:"iPad Mini",width:768,height:1024,category:"tablet",description:"7.9-8.3 inch tablets"},{name:"iPad",width:820,height:1180,category:"tablet",description:"10.2-10.9 inch range"},{name:"iPad Pro",width:1024,height:1366,category:"tablet",description:"11 inch pro tablets"},{name:'iPad Pro 12.9"',width:1024,height:1366,category:"tablet",description:"Largest tablets, landscape orientation"},{name:"Small Laptop",width:1280,height:800,category:"laptop",description:"MacBook Air, ultrabooks"},{name:"Medium Laptop",width:1440,height:900,category:"laptop",description:"Most popular laptop size"},{name:"Large Laptop",width:1680,height:1050,category:"laptop",description:'MacBook Pro 16", gaming laptops'},{name:"HD Desktop",width:1920,height:1080,category:"desktop",description:"Full HD monitors"},{name:"2K Desktop",width:2560,height:1440,category:"desktop",description:"QHD desktop monitors"},{name:"4K Desktop",width:3840,height:2160,category:"desktop",description:"Ultra HD large displays"}],B=o=>A.filter(i=>i.category===o),J=({message:o,open:i,onClose:c,autoHideDuration:p=3e3,severity:s="info",position:a={vertical:"bottom",horizontal:"center"}})=>{const d=b();return t.jsx(M,{open:i,autoHideDuration:p,onClose:c,anchorOrigin:a,children:t.jsx(C,{severity:s,variant:"filled",onClose:c,sx:{backgroundColor:d.palette.primary.main,boxShadow:d.shadows[3]},children:o})})},K=({selectedOptions:o,countryLanguageCode:i,maxWidth:c=120,wrapText:p=!1})=>{const s=b();return t.jsx(l,{variant:"subtitle2",fontWeight:"medium",noWrap:!p,sx:{maxWidth:c,lineHeight:1.2},children:k(o,i).map((a,d)=>t.jsxs(l,{component:"span",variant:"subtitle2",fontWeight:a.style.bold?"bold":"normal",fontSize:a.style.small?"0.75rem":"inherit",sx:{color:a.style.bold?s.palette.primary.main:s.palette.text.primary},children:[a.text,a.separator&&t.jsx(l,{component:"span",variant:"subtitle2",sx:{color:s.palette.text.secondary,fontSize:"0.75rem",mx:.5},children:a.separator})]},d))})},R=({anchorEl:o,currentWidth:i,onClose:c,onSelect:p,onCloseParentMenu:s})=>{const a=[{id:"mobile",label:"Mobile",icon:t.jsx(O,{fontSize:"small"})},{id:"tablet",label:"Tablet",icon:t.jsx(L,{fontSize:"small"})},{id:"laptop",label:"Laptop",icon:t.jsx(D,{fontSize:"small"})},{id:"desktop",label:"Desktop",icon:t.jsx(F,{fontSize:"small"})}],d=Object.fromEntries(a.map(e=>[e.id,B(e.id)])),S=N.useCallback(()=>[[320,568],[375,667],[414,896],[768,1024],[1280,800],[1440,900],[1680,1050],[1920,1080]].map(([e,n])=>({width:e,height:n})),[]),u=(e,n)=>{p(e,n),c(),s&&s()},v=(e,n)=>{const h=[];return h.push(t.jsxs(g,{disabled:!0,sx:{opacity:.7},children:[t.jsx(x,{children:e.icon}),t.jsx(l,{variant:"body2",fontWeight:"bold",children:e.label})]},`${e.id}-header`)),n.forEach(r=>{h.push(t.jsx(g,{onClick:()=>u(r.width,r.height),selected:i===r.width,sx:{pl:4,minHeight:36,"&:hover":{backgroundColor:j=>j.palette.action.hover}},children:t.jsxs(l,{variant:"body2",children:[r.name," (",r.width,"x",r.height,"px)",r.description&&t.jsxs(l,{component:"span",variant:"caption",color:"text.secondary",sx:{ml:.5},children:["- ",r.description]})]})},`${e.id}-${r.width}-${r.height}`))}),h.push(t.jsx(E,{sx:{my:.5}},`${e.id}-divider`)),h},m=[];return a.forEach(e=>{m.push(...v(e,d[e.id]))}),m.push(t.jsxs(g,{disabled:!0,sx:{opacity:.7},children:[t.jsx(x,{children:t.jsx(P,{fontSize:"small"})}),t.jsx(l,{variant:"body2",fontWeight:"bold",children:"Custom"})]},"custom-header")),S().forEach(({width:e,height:n})=>{m.push(t.jsx(g,{onClick:()=>u(e,n),selected:i===e,sx:{pl:4,minHeight:36,"&:hover":{backgroundColor:h=>h.palette.action.hover}},children:t.jsxs(l,{variant:"body2",children:[e,"px x ",n,"px"]})},`custom-${e}-${n}`))}),t.jsx(I,{anchorEl:o,open:!!o,onClose:c,anchorOrigin:{vertical:"top",horizontal:"right"},transformOrigin:{vertical:"top",horizontal:"left"},slotProps:{paper:{sx:{minWidth:200,py:.5,borderRadius:1,boxShadow:e=>e.shadows[1],bgcolor:e=>e.palette.background.paper}}},children:m})};export{R as D,K as F,J as N,$ as a,A as b,T as c,z as d,V as l,_ as s};
