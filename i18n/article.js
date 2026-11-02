export function setupArticleLanguage(getLocale){
 const article=document.querySelector('article'),source=window.__TLH_SNAPSHOT__;if(!article||!source)return;
 const originals=new Map([...article.querySelectorAll('section')].filter(s=>s.querySelector('.markdown')).map(s=>[s.id,{title:s.querySelector('h2')?.textContent,html:s.querySelector('.markdown').innerHTML}]));
 const toc=[...document.querySelectorAll('.toc a')].map(a=>({node:a,label:a.innerHTML}));
 const notice=document.querySelector('.language-notice');let english=null,sequence=0,rechecks=0;
 function paint(container,language){
  for(const [id,original] of originals){const target=document.getElementById(id),translated=container?.querySelector('#'+CSS.escape(id));
   target.querySelector('h2').textContent=language==='en'?translated.querySelector('h2').textContent:original.title;
   target.querySelector('.markdown').innerHTML=language==='en'?translated.querySelector('.markdown').innerHTML:original.html;
  }
  for(const {node,label} of toc){node.innerHTML=label;const heading=(language==='en'?container:document).querySelector(node.hash+' h2');if(heading)node.title=heading.textContent}
  article.lang=language;window.TLH_ARTICLE_LANGUAGE=language;
  document.querySelector('#section-search')?.dispatchEvent(new Event('input'));
 }
 async function sync(){
  const mine=++sequence;
  if(getLocale()==='ru'){paint(null,'ru');if(notice)notice.hidden=true;return}
  if(notice){notice.hidden=false;notice.textContent='Preparing the English translation of this revision. The Russian original is shown until the full translation is ready.'}
  try{
   if(!english){const response=await fetch('/api/translation?revision='+source.revision_id,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('translation');const data=await response.json();if(!data.ready){if(mine===sequence&&getLocale()==='en'&&rechecks++<10)setTimeout(sync,30000);return;}if(data.snapshot.content_hash!==source.content_hash||data.snapshot.revision_id!==source.revision_id)throw new Error('revision');english=new DOMParser().parseFromString(data.html,'text/html')}
   if(mine!==sequence||getLocale()!=='en')return;
   paint(english,'en');if(notice){notice.hidden=false;notice.textContent='English translation of revision '+source.revision_id+'. The Russian original is the editorial source; translations are generated with AI.'}
  }catch{if(mine===sequence&&notice)notice.textContent='The English translation is temporarily unavailable. The Russian original is shown.'}
 }
 window.addEventListener('tlh:languagechange',sync);sync();
}
