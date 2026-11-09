(function(){if(window.__prFix)return;window.__prFix=1;
/* طباعة «اطبع الأسئلة»: الخيارات الطويلة (معادلات عريضة) تُخرج العمودين عن عرض الورقة فيُقصّ المحتوى. تُحوَّل شبكة الخيارات إلى عمود واحد عند الحاجة قبل الطباعة */
var st=document.createElement('style');
st.textContent='#tmn-print .tp-o.one{grid-template-columns:minmax(0,1fr)}#tmn-print .tp-o>div{min-width:0}#tmn-print .tp-e,#tmn-print .tp-f{max-width:100%;overflow:visible}';
document.head.appendChild(st);
function fix(){
 var pb=document.getElementById('tmn-print');if(!pb||!pb.firstChild)return;
 var keep=pb.style.cssText;
 pb.style.cssText='display:block!important;visibility:hidden;position:absolute;left:0;top:0;width:680px';
 try{
  var os=pb.querySelectorAll('.tp-o');
  for(var i=0;i<os.length;i++){var o=os[i];o.classList.remove('one');
   if(o.scrollWidth>o.clientWidth+1)o.classList.add('one');}
 }catch(e){}
 pb.style.cssText=keep;
}
window.addEventListener('beforeprint',fix);
})();
