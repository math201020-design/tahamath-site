(function(){if(window.__mfTouch)return;window.__mfTouch=1;
/* لوحة أرقام للأجهزة اللمسية: خانة MathLive تمنع لوحة مفاتيح الجهاز (inputmode=none)، فتُضاف أزرار الأرقام داخل صفحة التدريب نفسها */
var touch=(navigator.maxTouchPoints>0)||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
if(!touch)return;
var st=document.createElement('style');
st.textContent='.mtools.mpad{justify-content:center;margin:2px 0 4px}.mtools.mpad .mk{min-width:46px;height:46px;font-size:22px;font-weight:700;touch-action:manipulation}@media(max-width:420px){.mtools.mpad .mk{min-width:40px}}';
document.head.appendChild(st);
var KEYS=['1','2','3','4','5','6','7','8','9','0','.','/'];
function build(){var d=document.createElement('div');d.className='mtools mpad';d.setAttribute('role','group');d.setAttribute('aria-label','أزرار الأرقام');
 KEYS.forEach(function(k){var b=document.createElement('button');b.type='button';b.className='mk';b.dataset.k=k;b.textContent=k;d.appendChild(b);});return d;}
function scan(){var ts=document.querySelectorAll('.mtools');
 for(var i=0;i<ts.length;i++){var t=ts[i];if(t.classList.contains('mpad'))continue;var n=t.nextElementSibling;if(n&&n.classList.contains('mpad'))continue;
  var box=t.parentElement;if(!box)continue;
  var mf=box.querySelector('math-field.mf:not([read-only])');if(!mf)continue;
  t.insertAdjacentElement('afterend',build());}}
var q=0;function sched(){if(q)return;q=requestAnimationFrame(function(){q=0;scan();});}
new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
scan();
})();
