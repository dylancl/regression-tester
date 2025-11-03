import{u as M,j as e,C as k,P as S,d as r,B as t,a3 as w,bh as P,bi as I,bj as c,bk as i,bl as $,h as b,bm as F,N as A}from"./mui-B3MKZ-aL.js";import{i as L,u as W,r as x}from"./vendor-By_F_pnL.js";const G=({selectedOptions:o,scenarios:l,stepStatuses:g,progressData:s})=>{const n=M(),j=new Date().toLocaleDateString(),p=a=>{if(!a)return"Not Tested";switch(a){case"pass":return"Passed";case"fail":return"Failed";case"blocked":return"Blocked";default:return"Not Tested"}},m=a=>{if(!a)return n.palette.text.disabled;switch(a){case"pass":return n.palette.success.main;case"fail":return n.palette.error.main;case"blocked":return n.palette.warning.main;default:return n.palette.text.disabled}};return o?e.jsx(k,{maxWidth:"lg",sx:{py:4,height:{xs:"auto",md:"calc(100vh - 80px)"},overflow:"auto","@media print":{height:"initial",overflow:"visible",display:"block",width:"100%",maxWidth:"100%"}},children:e.jsxs(S,{elevation:0,sx:{p:4,"@media print":{boxShadow:"none",border:"none"}},children:[e.jsxs(t,{sx:{mb:4,display:"flex",justifyContent:"space-between"},children:[e.jsxs(t,{children:[e.jsx(r,{variant:"h4",gutterBottom:!0,children:"Test Report"}),e.jsxs(r,{variant:"subtitle1",children:[o.component," - ",o.brand]}),e.jsx(r,{variant:"body2",color:"text.secondary",children:`${o.uscContext} - ${o.environment}`}),e.jsxs(r,{variant:"body2",color:"text.secondary",sx:{mt:1},children:["Device Type:"," ",o.device==="mobile"?"Mobile":"Desktop"]})]}),e.jsxs(t,{sx:{textAlign:"right"},children:[e.jsxs(r,{variant:"body2",color:"text.secondary",children:["Generated on: ",j]}),e.jsxs(r,{variant:"body2",color:"text.secondary",children:["Completion: ",s.completion,"%"]}),e.jsxs(t,{sx:{display:"flex",gap:2,mt:1,justifyContent:"flex-end"},children:[e.jsxs(t,{sx:{display:"flex",alignItems:"center"},children:[e.jsx(t,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:n.palette.success.main,mr:.5}}),e.jsxs(r,{variant:"caption",color:"text.secondary",children:[s.passed," Passed"]})]}),e.jsxs(t,{sx:{display:"flex",alignItems:"center"},children:[e.jsx(t,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:n.palette.error.main,mr:.5}}),e.jsxs(r,{variant:"caption",color:"text.secondary",children:[s.failed," Failed"]})]}),e.jsxs(t,{sx:{display:"flex",alignItems:"center"},children:[e.jsx(t,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:n.palette.warning.main,mr:.5}}),e.jsxs(r,{variant:"caption",color:"text.secondary",children:[s.blocked," Blocked"]})]})]})]})]}),e.jsx(w,{sx:{my:3}}),e.jsxs(t,{sx:{mb:4},children:[e.jsx(r,{variant:"h6",gutterBottom:!0,children:"Test Progress Summary"}),e.jsx(t,{sx:{display:"flex",alignItems:"center",mb:2},children:e.jsxs(t,{sx:{height:12,width:"100%",bgcolor:n.palette.grey[200],borderRadius:1,overflow:"hidden",display:"flex"},children:[s.passed>0&&e.jsx(t,{sx:{height:"100%",width:`${s.passed/s.total*100}%`,bgcolor:n.palette.success.main}}),s.failed>0&&e.jsx(t,{sx:{height:"100%",width:`${s.failed/s.total*100}%`,bgcolor:n.palette.error.main}}),s.blocked>0&&e.jsx(t,{sx:{height:"100%",width:`${s.blocked/s.total*100}%`,bgcolor:n.palette.warning.main}})]})}),e.jsxs(t,{sx:{mb:2},children:[e.jsxs(r,{variant:"body1",children:["Total test steps: ",s.total]}),e.jsxs(r,{variant:"body1",children:["Completion rate: ",s.completion,"%"]})]}),e.jsxs(P,{size:"small",sx:{mb:4},children:[e.jsx(I,{children:e.jsxs(c,{children:[e.jsx(i,{children:"Status"}),e.jsx(i,{align:"center",children:"Count"}),e.jsx(i,{align:"center",children:"Percentage"})]})}),e.jsxs($,{children:[e.jsxs(c,{children:[e.jsx(i,{children:e.jsxs(t,{sx:{display:"flex",alignItems:"center"},children:[e.jsx(t,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:n.palette.success.main,mr:1}}),"Passed"]})}),e.jsx(i,{align:"center",children:s.passed}),e.jsx(i,{align:"center",children:s.total>0?`${Math.round(s.passed/s.total*100)}%`:"0%"})]}),e.jsxs(c,{children:[e.jsx(i,{children:e.jsxs(t,{sx:{display:"flex",alignItems:"center"},children:[e.jsx(t,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:n.palette.error.main,mr:1}}),"Failed"]})}),e.jsx(i,{align:"center",children:s.failed}),e.jsx(i,{align:"center",children:s.total>0?`${Math.round(s.failed/s.total*100)}%`:"0%"})]}),e.jsxs(c,{children:[e.jsx(i,{children:e.jsxs(t,{sx:{display:"flex",alignItems:"center"},children:[e.jsx(t,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:n.palette.warning.main,mr:1}}),"Blocked"]})}),e.jsx(i,{align:"center",children:s.blocked}),e.jsx(i,{align:"center",children:s.total>0?`${Math.round(s.blocked/s.total*100)}%`:"0%"})]}),e.jsxs(c,{children:[e.jsx(i,{children:e.jsxs(t,{sx:{display:"flex",alignItems:"center"},children:[e.jsx(t,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:n.palette.grey[300],mr:1}}),"Not Tested"]})}),e.jsx(i,{align:"center",children:s.notTested}),e.jsx(i,{align:"center",children:s.total>0?`${Math.round(s.notTested/s.total*100)}%`:"0%"})]})]})]})]}),e.jsx(w,{sx:{my:3}}),e.jsxs(t,{sx:{mb:4},"data-testid":"test-scenarios",children:[e.jsx(r,{variant:"h6",gutterBottom:!0,children:"Test Scenarios Details"}),l.map(a=>e.jsxs(t,{sx:{mb:4},"data-scenario":a.id,className:"scenario-container",children:[e.jsx(r,{variant:"subtitle1",sx:{py:1.5,px:2,backgroundColor:n.palette.mode==="dark"?"rgba(255, 255, 255, 0.05)":"rgba(0, 0, 0, 0.03)",borderRadius:1,fontWeight:"medium"},children:a.title}),e.jsxs(P,{size:"small",sx:{mt:1},children:[e.jsx(I,{children:e.jsxs(c,{children:[e.jsx(i,{width:"5%",children:"Step"}),e.jsx(i,{width:"35%",children:"Instruction"}),e.jsx(i,{width:"35%",children:"Expected Result"}),e.jsx(i,{width:"15%",children:"Status"})]})}),e.jsx($,{children:a.steps.map((h,y)=>{const u=`${a.id}-${h.id}`,d=g[u];return e.jsxs(c,{children:[e.jsx(i,{children:y+1}),e.jsx(i,{sx:{color:d==="blocked"?n.palette.text.disabled:"inherit",textDecoration:d==="blocked"?"line-through":"none"},children:h.instruction}),e.jsx(i,{children:h.expectedResult}),e.jsx(i,{children:e.jsxs(t,{sx:{display:"flex",alignItems:"center",color:m(d)},children:[e.jsx(t,{sx:{width:10,height:10,borderRadius:"50%",bgcolor:m(d),mr:1}}),p(d)]})})]},h.id)})})]})]},a.id))]}),e.jsxs(t,{sx:{mt:6},children:[e.jsx(w,{}),e.jsxs(t,{sx:{display:"flex",justifyContent:"space-between",mt:2},children:[e.jsx(r,{variant:"caption",color:"text.secondary",children:"Generated with Regression Tester"}),e.jsx(r,{variant:"caption",color:"text.secondary",children:j})]})]}),e.jsx("style",{children:`
          @page {
            size: auto;
            margin: 10mm;
          }

          @media print {
            html, body {
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              width: 100% !important;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              position: relative;
              display: block;
              background-color: ${n.palette.background.paper} !important;
            }

            #app-bar {
              display: none !important;
          }
            
            /* Container should be full width */
            .MuiContainer-root {
              max-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              height: auto !important;
              overflow: visible !important;
              position: relative;
              display: block;
              float: none;
            }
            
            /* Critical: Force each scenario to be considered separately for pagination */
            
            /* Each major section should be considered for page breaks */
            .MuiBox-root {
              page-break-inside: auto;
              break-inside: auto;
              position: relative;
              overflow: visible !important;
            }


          }
          `})]})}):e.jsx(k,{maxWidth:"lg",sx:{py:4},children:e.jsx(S,{elevation:0,sx:{p:4},children:e.jsx(r,{color:"error",children:"Missing test configuration data"})})})},K=()=>{const o=L(),l=W(),[g,s]=x.useState({component:"",brand:"",uscContext:"",testType:"",testStatus:"",testDate:""}),[n,j]=x.useState({}),[p,m]=x.useState([]),[a,h]=x.useState({total:0,passed:0,failed:0,blocked:0,notTested:0,completion:0}),[y,u]=x.useState(!1),[d,f]=x.useState(null);x.useEffect(()=>{var T,C,R,B;u(!0),console.log("Location state:",l.state);try{(T=l.state)!=null&&T.selectedOptions?s(l.state.selectedOptions):f("No selected options provided"),(C=l.state)!=null&&C.stepStatuses&&j(l.state.stepStatuses),(R=l.state)!=null&&R.scenarios?m(l.state.scenarios):f("No test scenarios provided"),(B=l.state)!=null&&B.progressData&&h(l.state.progressData)}catch(E){console.error("Error processing report data:",E),f("Failed to process report data")}finally{u(!1)}},[l.state]);const N=()=>{window.print()},v=()=>{o(-1)};return e.jsxs(k,{maxWidth:"lg",sx:{py:2},children:[e.jsxs(S,{sx:{p:2,mb:2,display:"flex",justifyContent:"space-between",alignItems:"center","@media print":{display:"none"}},children:[e.jsx(b,{startIcon:e.jsx(F,{}),onClick:v,variant:"outlined",children:"Back"}),e.jsx(r,{variant:"h6",children:"Test Report"}),e.jsx(b,{startIcon:e.jsx(A,{}),onClick:N,variant:"contained",color:"primary",children:"Print / Export PDF"})]}),y?e.jsx(t,{sx:{p:4,textAlign:"center"},children:e.jsx(r,{children:"Loading test data..."})}):d?e.jsxs(t,{sx:{p:4,textAlign:"center"},children:[e.jsx(r,{color:"error",children:d}),e.jsx(b,{variant:"outlined",onClick:v,sx:{mt:2},children:"Go Back"})]}):p.length===0?e.jsxs(t,{sx:{p:4,textAlign:"center"},children:[e.jsx(r,{children:"No test scenarios found for the selected options."}),e.jsx(b,{variant:"outlined",onClick:v,sx:{mt:2},children:"Go Back"})]}):e.jsx(G,{selectedOptions:g,scenarios:p,stepStatuses:n,progressData:a})]})};export{K as default};
