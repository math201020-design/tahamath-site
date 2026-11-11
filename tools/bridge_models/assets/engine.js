const D=@@D@@;
const REV=@@REV@@;
const KEY="tm-g11ab-"+D.id+"-v1";
const L="ABCD";
let S={name:"",a:{},cur:0,done:false,started:false,code:""};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s)S=Object.assign(S,s);}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}try{bar();}catch(e){}};
function bar(){if(D.min>0)return;const t=$("tmr");if(!t)return;if(S.done||!S.started){t.classList.add("hidden");return;}t.classList.remove("hidden");const n=D.qs.length,a=D.qs.filter((q,i)=>answered(i)).length;t.innerHTML="المجاب: "+bdi(a)+" من "+bdi(n)+'<div class="pbar"><i style="width:'+Math.round(100*a/n)+'%"></i></div>';}
const $=id=>document.getElementById(id);
const bdi=t=>'<bdi dir="ltr">'+t+'</bdi>';
const mj=(t,disp)=>disp?'\\['+t+'\\]':'\\('+t+'\\)';
function typeset(el){if(window.MathJax&&MathJax.typesetPromise){MathJax.typesetPromise([el]).then(()=>fit(el));}else{setTimeout(()=>typeset(el),150);}}
const ARW=/\\AR\{:?([^{}]*?):?\}/g;
function mt(s){if(!/\\AR\{/.test(s))return mj('\\displaystyle '+s,false);let o='',last=0,m;ARW.lastIndex=0;
  while((m=ARW.exec(s))){const a=s.slice(last,m.index).replace(/^(\\[ ,;!]|\\q?quad|\s)+|(\\[ ,;!]|\\q?quad|\s)+$/g,'');if(a)o+=mj('\\displaystyle '+a,false);o+='<span class="arw">'+m[1]+'</span>';last=ARW.lastIndex;}
  const z=s.slice(last).replace(/^(\\[ ,;!]|\\q?quad|\s)+/g,'');if(z)o+=mj('\\displaystyle '+z,false);return '<span class="mix">'+o+'</span>';}
const mk=m=>m==1?"درجة واحدة":m==2?"درجتان":(m>=3&&m<=10?bdi(m)+" درجات":bdi(m)+" درجة");
function fit(el){el.querySelectorAll('.ln,.mx,.opt>span,.inp .lab').forEach(e=>{let f=100;e.style.fontSize='';while(e.scrollWidth>e.clientWidth+1&&f>55){f-=5;e.style.fontSize=f+'%';}});}
function wnorm(v){return String(v==null?'':v).replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776)
  .replace(/[٫]/g,'.').replace(/[−–—‒﹣－]/g,'-').replace(/[،]/g,',').replace(/×|·/g,'*').replace(/÷/g,'/');}
function num(v){let t=wnorm(v).replace(/\s+/g,'').replace(/(\d),(\d)/g,'$1.$2');if(!t)return NaN;
  t=t.replace(/sqrt\(/g,'√(').replace(/√(\d+(?:\.\d+)?)/g,'R($1)').replace(/√\(/g,'R(');
  if(!/^[0-9.+\-*/()R]*$/.test(t))return NaN;
  t=t.replace(/(\d|\))(?=R|\()/g,'$1*').replace(/\)(?=\d)/g,')*');
  try{const x=Function('R','"use strict";return ('+t+')')(Math.sqrt);return typeof x==='number'&&isFinite(x)?x:NaN;}catch(e){return NaN;}}
function wtex(v){let t=wnorm(v).trim();if(!t)return '';
  t=t.replace(/√\(([^()]*)\)/g,'\\sqrt{$1}').replace(/√(\d+(?:\.\d+)?)/g,'\\sqrt{$1}');
  t=t.replace(/\(([^()]+)\)\/\(([^()]+)\)/g,'\\dfrac{$1}{$2}').replace(/(\d+(?:\.\d+)?|\\sqrt\{[^}]*\})\/(\d+(?:\.\d+)?)/g,'\\dfrac{$1}{$2}');
  return t;}
function wfromMF(mf){let a=(mf.getValue('ascii-math')||'').replace(/"/g,' ').replace(/sqrt\(/g,'√(').replace(/\bxx\b|·|×/g,'*');
  for(let k=0;k<3;k++)a=a.replace(/(^|[\/+\-*(\s])\(([\d.]+)\)/g,'$1$2');
  return a.replace(/\s+/g,'').trim();}
const WINS={frac:'\\frac{#0}{#?}',sqrt:'\\sqrt{#0}','−':'-','(':'(',')':')'};
function wtools(){const K=[['frac','<span class="fr"><i></i><b></b><i></i></span>','كسر'],['sqrt','<span class="sq">√<i></i></span>','جذر'],['−','−'],['(','('],[')',')']];
  return '<div class="mtools"><span class="mt-l">أزرار الرموز:</span>'+K.map(k=>'<button type="button" class="mk" data-k="'+k[0]+'"'+(k[2]?' aria-label="'+k[2]+'" title="'+k[2]+'"':'')+'>'+k[1]+'</button>').join('')+'<button type="button" class="mk" data-k="DEL" aria-label="حذف">⌫</button></div>';}
let WLAST=null;
document.addEventListener('focusin',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('mf'))WLAST=e.target;});
document.addEventListener('mousedown',e=>{if(e.target&&e.target.closest&&e.target.closest('.mk'))e.preventDefault();});
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('.mk');if(!b)return;const qd=b.closest('.q');
  const mf=WLAST&&qd.contains(WLAST)?WLAST:qd.querySelector('math-field.mf');if(!mf||!mf.executeCommand)return;const k=b.dataset.k;
  if(k==='DEL')mf.executeCommand('deleteBackward');else mf.executeCommand(['insert',WINS[k]||k,{insertionMode:'replaceSelection',selectionMode:'placeholder',focus:true}]);mf.focus();});
function wbad(inp){const w=inp.parentElement.querySelector('.pvbad');if(!w)return;const v=inp.value.trim();
  const typing=/^\/|\/$|\(\)|\/\)|\(\/|[-+*/]$/.test(v.replace(/\s/g,''));w.textContent=v&&!typing&&isNaN(num(v))?'لا يمكن قراءة هذه الكتابة؛ راجعها، واستعمل أزرار الرموز للكسر والجذر.':'';}
function wmount(inp,i){const mf=document.createElement('math-field');mf.className='mf';mf.setAttribute('dir','ltr');
  mf.setAttribute('math-virtual-keyboard-policy','manual');mf.setAttribute('smart-mode','off');mf.setAttribute('aria-label','خانة الإجابة');
  inp.classList.add('hid');inp.insertAdjacentElement('afterend',mf);
  if(S.done||inp.disabled)mf.setAttribute('read-only','');
  customElements.whenDefined('math-field').then(()=>{try{MathfieldElement.soundsDirectory=null;MathfieldElement.plonkSound=null;MathfieldElement.keypressSound=null;}catch(e){}
    try{if(inp.value)mf.setValue(wtex(inp.value),{silenceNotifications:true});}catch(e){}});
  mf.addEventListener('input',()=>{inp.value=wfromMF(mf);S.a[i]=S.a[i]||{};S.a[i][inp.dataset.k]=inp.value;save();wbad(inp);upd();});}
function fok(f,v){const x=num(v);if(isNaN(x))return false;return Math.abs(x-f.ans)<=(f.tol||1e-9)+1e-12;}
function answered(i){const q=D.qs[i],a=S.a[i];if(!q.inputs.length)return a!==undefined;return !!a&&Object.values(a).some(v=>String(v).trim()!=="");}
function score(i){const q=D.qs[i];if(q.inputs.length){const a=S.a[i]||{};return q.inputs.reduce((s,f,k)=>s+(fok(f,a[k])?f.mark:0),0);}return S.a[i]===q.ans?q.mark:0;}
function dots(){const d=$("dots");d.innerHTML="";D.qs.forEach((q,i)=>{const b=document.createElement("button");b.className="dot";b.textContent=i+1;
  if(S.done){b.classList.add(...(score(i)===q.mark?["ok"]:(score(i)>0?["part","half"]:["bad","no"])));}else if(answered(i))b.classList.add("ans");
  if(i===S.cur)b.classList.add("cur");b.onclick=()=>{pend=false;S.cur=i;save();show();};d.appendChild(b);});}
function show(){const i=S.cur,q=D.qs[i];$("result").classList.toggle("hidden",S.done&&i!==0);$("tores").classList.toggle("hidden",!S.done||i===0);
  let h='<div class="q"><div class="chips"><span class="chip c1">س'+bdi(i+1)+'</span>'+(q.lesson?'<span class="chip c2">الدرس '+bdi(q.lesson)+'</span>':'')+(q.lvl?'<span class="chip c2">المستوى: '+q.lvl+'</span>':'')+'<span class="chip c3">'+mk(q.mark)+'</span><span class="chip c4">البند '+bdi(q.item)+'</span>'+(q.ref?'<span class="chip c4">'+q.ref+'</span>':'')+'</div>';
  if(q.out_ar)h+='<div class="qout">'+q.out_ar+'</div>';
  const tm=(q.terms||[]).slice();if(q.out_en)tm.push([q.out_ar||'',q.out_en]);
  if(tm.length)h+='<div class="terms">'+tm.map(t=>'<span class="term">'+(t[0]?t[0]+' | ':'')+'<i>'+t[1]+'</i></span>').join('')+'</div>';
  h+='<div class="stem">'+q.stem+'</div>';
  if(q.tex)h+='<div class="mx">'+(/\\AR\{/.test(q.tex)?mt(q.tex):mj(q.tex,true))+'</div>';
  if(q.img)h+='<img class="gimg" src="'+q.img+'" alt="التمثيل البياني">';
  if(q.inputs.length){const a=S.a[i]||{};h+='<div class="inps">';q.inputs.forEach((f,k)=>{let c="inp";const v=a[k]===undefined?"":String(a[k]);
      if(S.done)c+=fok(f,v)?" right":" wrong";
      h+='<div class="'+c+'"><span class="lab">'+mt(f.label)+'</span><input class="mi" inputmode="decimal" data-k="'+k+'" value="'+v.replace(/"/g,'&quot;')+'"'+(S.done?' disabled':'')+' placeholder="?"><div class="pvbad"></div>';
      if(S.done)h+=fok(f,v)?'<div class="fix ok">✓ '+bdi(f.mark+' / '+f.mark)+'</div>':'<div class="fix bad">الصحيح: <bdi dir="ltr">'+mj(wtex(f.show),false)+'</bdi></div>';
      h+='</div>';});h+='</div>';if(!S.done)h+=wtools();
    if(q.note)h+='<p class="hint">'+q.note+'</p>';}
  else{h+='<div class="opts'+(q.one?' one':'')+'">';q.opts.forEach((o,k)=>{let c="opt";const l=L[k];
    if(S.done){if(l===q.ans)c+=" right";else if(S.a[i]===l)c+=" wrong";}else if(S.a[i]===l)c+=" sel";
    h+='<div class="'+c+'" data-l="'+l+'">'+(o.startsWith('<img')?o:'<b>'+l+')</b><span>'+mt(o)+'</span>')+'</div>';});
  h+='</div>';}
  if(S.done&&q.inputs.length){const g=score(i);h+='<div class="verdict '+(g===q.mark?'ok':(g>0?'none':'bad'))+'">حصلت على '+bdi(g)+' من '+bdi(q.mark)+' في هذا السؤال</div>';}
  if(S.done&&!q.inputs.length){const a=S.a[i];
    if(a===undefined)h+='<div class="verdict none">لم تُجب عن هذا السؤال. <span class="nw">الإجابة الصحيحة: '+bdi(q.ans)+'</span></div>';
    else if(a===q.ans)h+='<div class="verdict ok">إجابة صحيحة ✓ ('+bdi(q.mark+' / '+q.mark)+')</div>';
    else h+='<div class="verdict bad">إجابتك '+bdi(a)+' غير صحيحة، <span class="nw">والإجابة الصحيحة: '+bdi(q.ans)+'</span></div>';
  }
  if(S.done){if(q.remember)h+='<div class="rem"><b>تذكّر:</b> '+q.remember+'</div>';
    h+='<div class="sol"><h4>الحل التفصيلي</h4>'+q.sol.map(s=>'<div class="ln">'+(s.startsWith('<img')?s:mt(s))+'</div>').join('')+'</div>';}
  h+='</div>';
  const box=$("qbox");box.innerHTML=h;
  if(!S.done)box.querySelectorAll(".opt").forEach(o=>o.onclick=()=>{S.a[i]=o.dataset.l;save();show();});
  box.querySelectorAll(".inp input.mi").forEach(o=>wmount(o,i));
  $("cnt").innerHTML='السؤال '+bdi(i+1)+' من '+bdi(D.qs.length);
  $("prev").disabled=i===0;$("next").disabled=i===D.qs.length-1;
  upd();typeset(box);}
function upd(){const left=D.qs.filter((q,i)=>!answered(i)).length;
  $("subw").classList.toggle("hidden",S.done);
  $("left").textContent=left?("أسئلة لم تُجب عنها: "+left):"أجبت عن كل الأسئلة";
  $("sub").textContent=pend?"اضغط مرة أخرى لتأكيد التسليم":"تسليم الإجابات";
  dots();}
let pend=false;
function code(){const s=D.qs.map((q,i)=>JSON.stringify(S.a[i]||"-")).join("")+"|"+S.name;let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;
  return D.cp+"-"+D.qs.map((q,i)=>score(i)).reduce((x,y)=>x+y,0)+"-"+(h%100000).toString().padStart(5,"0");}
function result(){const tot=D.qs.reduce((s,q,i)=>s+score(i),0);
  let r='<div class="panel score"><h3>بطاقة النتيجة • '+document.title.replace(/[<>&]/g,'')+'</h3><div>'+(S.name?('الطالب: <b>'+S.name.replace(/[<>&]/g,'')+'</b>'):'')+'</div><div class="big">'+bdi(tot+' / '+D.total)+'</div>';
  const G=location.pathname.split('/')[1];const rv=(q,g)=>{if(g>=q.mark)return '<span class="rv-ok">✓</span>';const L=(window.tmnReview&&tmnReview(G,q.item))||{u:'/'+G+'/',l:'✎ تدرّب على البند'};return '<a class="rv-a'+(L.v?' v':'')+'" href="'+L.u+'" target="_blank" rel="noopener">'+L.l+'</a>';};
  const miss=D.qs.some((q,i)=>score(i)<q.mark);
  r+='<table><tr><th>البند</th><th>الدرجة</th>'+(REV?'<th>المراجعة</th>':'')+'</tr>'+D.qs.map((q,i)=>'<tr><td>البند '+bdi(q.item)+'</td><td>'+bdi(score(i)+' / '+q.mark)+'</td>'+(REV?'<td>'+rv(q,score(i))+'</td>':'')+'</tr>').join('')+'</table>';
  if(REV&&miss)r+='<p class="rv-note">بجانب كل بند لم تحصل فيه على الدرجة كاملة زرّ يفتح شرح البند، أو تدريباً عليه إن لم يُنشر شرحه بعد.</p>';
  r+='<div>رمز التحقق</div><div class="code">'+S.code+'</div><p class="hint">التقط صورة لهذه البطاقة وأرسلها إلى معلمك، ثم راجع الحل التفصيلي لكل سؤال بالأسفل.</p></div>';
  $("result").innerHTML=r;$("result").classList.add("show");}
$("go").onclick=()=>{S.name=$("nm").value.trim();S.started=true;if(!S.t0)S.t0=Date.now();tick();save();$("start").classList.add("hidden");$("quiz").classList.remove("hidden");show();window.scrollTo(0,0);};
$("prev").onclick=()=>{pend=false;if(S.cur>0){S.cur--;save();show();}};
$("next").onclick=()=>{pend=false;if(S.cur<D.qs.length-1){S.cur++;save();show();}};
function finish(){S.done=true;S.code=code();S.cur=0;pend=false;save();result();show();tick();window.scrollTo(0,0);}
function tick(){if(!(D.min>0)){bar();return;}const t=$("tmr");if(S.done||!S.t0){t.classList.add("hidden");return;}t.classList.remove("hidden");const left=Math.max(0,D.min*60000-(Date.now()-S.t0));const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);t.innerHTML="الوقت المتبقي: "+bdi(m+":"+String(s).padStart(2,"0"));t.classList.toggle("low",left<300000);if(left<=0){finish();return;}setTimeout(tick,1000);}
$("sub").onclick=()=>{if(!pend){pend=true;show();return;}S.done=true;S.code=code();S.cur=0;pend=false;save();result();show();window.scrollTo(0,0);};
$("nm").value=S.name||"";
if(S.started){$("start").classList.add("hidden");$("quiz").classList.remove("hidden");if(S.done)result();else tick();
  document.addEventListener("DOMContentLoaded",()=>show());if(document.readyState!=="loading")show();}
window.addEventListener("resize",()=>fit($("qbox")));
