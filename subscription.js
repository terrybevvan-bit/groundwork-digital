(function(){
  const h=document.documentElement;
  const btn=document.getElementById('theme-toggle');
  const icon=document.getElementById('theme-icon');
  const SUN='*';
  const MOON='o';

  if(localStorage.getItem('gwd-theme')==='light'){
    h.classList.add('light');
    if(icon)icon.textContent=MOON;
  }else if(icon){
    icon.textContent=SUN;
  }

  if(btn)btn.addEventListener('click',function(){
    h.classList.add('transitioning');
    setTimeout(function(){h.classList.remove('transitioning');},400);
    const isLight=h.classList.toggle('light');
    if(icon)icon.textContent=isLight?MOON:SUN;
    localStorage.setItem('gwd-theme',isLight?'light':'dark');
  });
})();

(function(){
  const burger=document.getElementById('nav-burger');
  const menu=document.getElementById('nav-menu');
  if(!burger||!menu)return;
  burger.addEventListener('click',function(){
    const open=menu.classList.toggle('open');
    burger.setAttribute('aria-expanded',String(open));
  });
  menu.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click',function(){menu.classList.remove('open');});
  });
})();
