import {resolveLocale,translate} from './locale.js';
import {setupArticleLanguage} from './article.js';
(()=>{
 let preference='auto';try{preference=localStorage.getItem('tlh-language')||'auto'}catch{}
 const requested=new URLSearchParams(location.search).get('lang');if(['ru','en'].includes(requested))preference=requested;
 let locale=resolveLocale(preference,navigator.languages||[navigator.language]);
 const texts=new WeakMap(),attributes=new WeakMap();
 const excluded='script,style,textarea,input,code,pre,.markdown,.bibliography,#author-preview,[data-user-content]';
 function original(record,current){return !record||current!==record.last?{source:current,last:current}:record}
 function apply(){
  document.documentElement.lang=locale;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
   if(node.parentElement?.closest(excluded)||!node.nodeValue.trim())continue;
   const record=original(texts.get(node),node.nodeValue),next=translate(record.source,locale);
   record.last=next;texts.set(node,record);if(node.nodeValue!==next)node.nodeValue=next;
  }
  for(const element of document.querySelectorAll('[aria-label],[placeholder],[title]')){
   if(element.closest('[data-user-content],pre,code,.markdown,.bibliography'))continue;
   const saved=attributes.get(element)||{};
   for(const name of ['aria-label','placeholder','title'])if(element.hasAttribute(name)){
    const record=original(saved[name],element.getAttribute(name)),next=translate(record.source,locale);record.last=next;saved[name]=record;
    if(element.getAttribute(name)!==next)element.setAttribute(name,next);
   }
   attributes.set(element,saved);
  }
  const pickerLabel=locale==='ru'?'Язык интерфейса':'Interface language';if(picker.getAttribute('aria-label')!==pickerLabel)picker.setAttribute('aria-label',pickerLabel);
  document.title=locale==='ru'?'The Living Handbook — понятная разработка с ИИ':'The Living Handbook — build with understanding';
 }
 const picker=document.createElement('select');picker.className='language-select';picker.dataset.languagePicker='';picker.innerHTML='<option value="auto">Auto</option><option value="ru">Русский</option><option value="en">English</option>';picker.value=['ru','en'].includes(preference)?preference:'auto';
 const host=document.querySelector('.toplinks,.author-header');host?.append(picker);
 const article=document.querySelector('article');if(article)article.lang='ru';
 const notice=article?document.createElement('p'):null;
 if(notice){notice.className='language-notice';notice.lang='en';notice.dataset.userContent='';document.querySelector('.hero')?.append(notice)}
 window.TLH_I18N={get locale(){return locale},t:text=>translate(text,locale)};
 picker.addEventListener('change',()=>{preference=picker.value;try{localStorage.setItem('tlh-language',preference)}catch{}const address=new URL(location.href);if(preference==='auto')address.searchParams.delete('lang');else address.searchParams.set('lang',preference);history.replaceState(null,'',address);locale=resolveLocale(preference,navigator.languages||[navigator.language]);apply();window.dispatchEvent(new Event('tlh:languagechange'))});
 window.addEventListener('languagechange',()=>{if(preference==='auto'){locale=resolveLocale(preference,navigator.languages||[navigator.language]);apply();window.dispatchEvent(new Event('tlh:languagechange'))}});
 let scheduled=false;new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
 setupArticleLanguage(()=>locale);
 apply();
})();
