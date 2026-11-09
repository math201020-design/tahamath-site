(function(){
/* السابق/التالي بين بنود التدريب: يظهر الرابط فقط إن كانت الصفحة المجاورة موجودة */
var m=location.pathname.match(/^(.*\/band-)(\d+)\/?(?:index\.html?)?$/);if(!m)return;
var n=+m[2],base=m[1];
var box=document.createElement('nav');box.className='bnav';box.setAttribute('aria-label','التنقل بين البنود');
var st=document.createElement('style');
st.textContent='.bnav{display:flex;gap:10px;justify-content:space-between;align-items:center;max-width:760px;margin:18px auto 28px;padding:0 16px;direction:rtl}.bnav a{flex:1;text-align:center;padding:12px 14px;border:1.5px solid #8FA3BF;border-radius:12px;background:#fff;color:#1E2A44;text-decoration:none;font-weight:700;font-size:16px;min-height:44px;display:flex;align-items:center;justify-content:center}.bnav a:hover,.bnav a:focus-visible{border-color:#B8892B;box-shadow:0 0 0 2px #F6E3B4;outline:none}.bnav a[hidden]{display:none}@media print{.bnav{display:none}}';
document.head.appendChild(st);
function mk(label,k){var a=document.createElement('a');a.hidden=true;a.href=base+k+'/';a.textContent=label;a.rel=k<n?'prev':'next';
 fetch(a.href,{method:'HEAD',cache:'force-cache'}).then(function(r){if(r.ok)a.hidden=false;}).catch(function(){});return a;}
if(n>1)box.appendChild(mk('→ البند '+(n-1),n-1));
box.appendChild(mk('البند '+(n+1)+' ←',n+1));
var s=document.getElementById('mf-touch')||document.currentScript;
(s&&s.parentNode?s.parentNode:document.body).insertBefore(box,s||null);
})();
