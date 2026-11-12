// render every sol/opts/stem/steps string through the page's arTex and report structural problems
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'../../site/g11-general-bridge');
let bad=0,n=0,ar=0;
for(const d of fs.readdirSync(root).filter(x=>/^(haykal|prac)-/.test(x))){
  const s=fs.readFileSync(path.join(root,d,'index.html'),'utf8');
  const a=s.indexOf('// ---- Arabic-safe'), b=s.indexOf('// teacher 6 Nov 2026 20:31');
  const esc=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  eval(s.slice(a,b).replace(/^function (\w+)/gm,'global.$1=function $1').replace(/^const /gm,'var '));
  const D=JSON.parse(s.slice(s.search(/const D\s*=\s*/)).replace(/^const D\s*=\s*/,'').match(/^[\s\S]*?\n(?=\S)/)[0].trim().replace(/;$/,''));
  const strs=[];
  (function w(o,k){ if(Array.isArray(o)) o.forEach(v=>w(v,k)); else if(o&&typeof o==='object') for(const kk in o) w(o[kk],kk); else if(typeof o==='string'&&hasAr(o)) strs.push([k,o]); else if(typeof o==='string'&&/\\\(.*\\text\{[^{}]*[؀-ۿ]/s.test(o)) strs.push([k,o]); })(D,'');
  for(const [k,o] of strs){ n++;
    const r = k==='stem'?stemH(o):arTex(o,k==='t').h; ar++;
    // math segments: \( ... \)
    for(const m of r.matchAll(/\\\((.*?)\\\)/gs)){ const x=m[1].replace(/\\[{}]/g,''); let dep=0; for(const c of x){ if(c==='{')dep++; if(c==='}')dep--; if(dep<0)break;} 
      const L=(x.match(/\\left/g)||[]).length,R=(x.match(/\\right/g)||[]).length;
      if(dep!==0||L!==R||/\\(frac|sqrt)\s*$/.test(x)||/[\^_]\s*$/.test(x)){bad++;console.log('BAD',d,k,'|',o,'|',m[1]);} }
  }
}
console.log('checked',n,'strings with Arabic text; bad',bad);
