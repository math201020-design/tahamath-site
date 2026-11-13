(function(){if(window.__prAr)return;window.__prAr=1;
/* ورقة الطباعة: \AR{..} و \text{عربي} لا يعرفهما MathJax في الطباعة، فتُحوَّل إلى نص عربي HTML قبل التنضيد */
var AR_RE=/\\AR\{:?([^{}]*?):?\}|\\text\{([^{}]*[؀-ۿ][^{}]*)\}/g;
var HAS=/\\AR\{|\\text\{[^{}]*[؀-ۿ]/;
function span(t){return '<span dir="rtl" style="unicode-bidi:isolate">'+t+'</span>';}
function mathPart(s){s=s.replace(/^(\s|\\[;,!: ]|\\q?quad)+|(\s|\\[;,!: ]|\\q?quad)+$/g,'');return s?'\\(\\displaystyle '+s+'\\)':'';}
function conv(inner){var out='',last=0,m;AR_RE.lastIndex=0;
 while((m=AR_RE.exec(inner))){out+=mathPart(inner.slice(last,m.index))+' '+span(m[0].indexOf('\\AR')===0?m[1]:m[2])+' ';last=AR_RE.lastIndex;}
 return out+mathPart(inner.slice(last));}
function fixHtml(h){return h.replace(/\\\(\\displaystyle ([\s\S]*?)\\\)/g,function(a,inner){return HAS.test(inner)?conv(inner):a;});}
window.__prArFix=fixHtml;
function hook(){var mj=window.MathJax;if(!mj||!mj.typesetPromise||mj.__arw)return false;
 var o=mj.typesetPromise.bind(mj);mj.__arw=1;
 mj.typesetPromise=function(els){try{(els||[]).forEach(function(e){if(e&&e.id==='tmn-print'){
  var ps=e.querySelectorAll('.tp-o span,.tp-e,.tp-f');
  for(var i=0;i<ps.length;i++){var h=ps[i].innerHTML,n=fixHtml(h);if(n!==h)ps[i].innerHTML=n;}}});}catch(x){}
  return o.apply(null,arguments);};
 return true;}
var n=0,t=setInterval(function(){if(hook()||++n>200)clearInterval(t);},100);
})();
