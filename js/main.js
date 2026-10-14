/* ---------- eventos, escala de pantalla, conexión y arranque ---------- */
const scr=$('#screen');
let SCALE=1,drag=null,CB=null;

/* La app se diseña a 800 px de alto (y al menos 1180 de ancho) y se escala para llenar la pantalla:
   en la tablet de 11" horizontal cada pantalla entra entera, sin scroll de página. */
function fit(){
  const app=$('#app'),W0=app.clientWidth||innerWidth,H0=app.clientHeight||innerHeight;
  let s=Math.min(H0/DH,W0/MINW);s=Math.max(.5,Math.min(1.5,s));SCALE=s;
  const st=$('#stage');st.style.width=(W0/s)+'px';st.style.height=(H0/s)+'px';st.style.transform=`scale(${s})`;
  cbClose();
}

/* ---------- firmas ---------- */
function initSigs(){
  document.querySelectorAll('#screen canvas.sig').forEach(cv=>{
    const kind=cv.dataset.sig;
    const get=()=>kind==='op'?cur().ejec.firma:UI.csig;
    const set=v=>{if(kind==='op')cur().ejec.firma=v;else{UI.csig=v;if(UI.verr&&UI.verr.startsWith('Firm'))UI.verr=''}};
    const ctx=cv.getContext('2d');
    const ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#14202A';
    ctx.lineWidth=kind==='op'?5:4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=ink;
    const f=get();
    if(f==='seed'){ctx.beginPath();const sx=cv.width/300,sy=cv.height/90;ctx.moveTo(SEEDSIG[0][0]*sx,SEEDSIG[0][1]*sy);SEEDSIG.slice(1).forEach(q=>ctx.bezierCurveTo(q[0]*sx,q[1]*sy,q[2]*sx,q[3]*sy,q[4]*sx,q[5]*sy));ctx.stroke()}
    else if(f){const im=new Image();im.onload=()=>ctx.drawImage(im,0,0,cv.width,cv.height);im.src=f}
    let down=false,last=null;
    const pt=ev=>{const r=cv.getBoundingClientRect();return [(ev.clientX-r.left)*cv.width/r.width,(ev.clientY-r.top)*cv.height/r.height]};
    cv.addEventListener('pointerdown',ev=>{down=true;last=pt(ev);cv.setPointerCapture(ev.pointerId);ctx.beginPath();ctx.arc(last[0],last[1],2.5,0,7);ctx.fillStyle=ink;ctx.fill()});
    cv.addEventListener('pointermove',ev=>{if(!down)return;const q=pt(ev);ctx.beginPath();ctx.moveTo(last[0],last[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();last=q});
    const up=()=>{if(!down)return;down=false;set(cv.toDataURL('image/png'));render()};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  });
}

/* ---------- desplegable con búsqueda (cbx) ---------- */
function cbOpen(wrap){
  cbClose();
  const inp=wrap.querySelector('input'),tpl=wrap.querySelector('template');if(!inp||!tpl)return;
  const pop=document.createElement('div');pop.className='cbx-pop';pop.id='cbx-pop';pop.setAttribute('role','listbox');
  pop.appendChild(tpl.content.cloneNode(true));
  pop.addEventListener('mousedown',e=>e.preventDefault());
  scr.appendChild(pop);
  CB={wrap,inp,pop,act:-1};
  inp.setAttribute('aria-expanded','true');inp.setAttribute('aria-controls','cbx-pop');
  cbPlace();cbFilter();
}
function cbPlace(){
  if(!CB)return;const s=SCALE,r=CB.inp.getBoundingClientRect(),sr=scr.getBoundingClientRect();
  const W=sr.width/s,H=sr.height/s,top=(r.top-sr.top)/s,bot=(r.bottom-sr.top)/s,w=Math.max(r.width/s,320);
  const left=Math.max(8,Math.min((r.left-sr.left)/s,W-w-8)),below=H-bot-12,above=top-12;
  Object.assign(CB.pop.style,{left:left+'px',width:w+'px',top:'',bottom:''});
  if(below>=240||below>=above){CB.pop.style.top=(bot+4)+'px';CB.pop.style.maxHeight=Math.min(340,below)+'px'}
  else{CB.pop.style.bottom=(H-top+4)+'px';CB.pop.style.maxHeight=Math.min(340,above)+'px'}
}
function cbFilter(){
  if(!CB)return;const q=norm(CB.inp.value);let n=0;
  CB.pop.querySelectorAll('.cbx-o').forEach(b=>{const ok=!q||b.dataset.q.includes(q);b.hidden=!ok;if(ok)n++});
  let head=null,cnt=0;[...CB.pop.children].forEach(el=>{if(el.classList.contains('cbx-g')){if(head)head.hidden=!cnt;head=el;cnt=0}else if(el.classList.contains('cbx-o')&&!el.hidden)cnt++});if(head)head.hidden=!cnt;
  let none=CB.pop.querySelector('.cbx-nores');
  if(!n&&q){if(!none){none=document.createElement('div');none.className='cbx-none cbx-nores';CB.pop.appendChild(none)}none.textContent=`Nada coincide con "${CB.inp.value}"`;none.hidden=false}else if(none)none.hidden=true;
  CB.act=q&&n?0:-1;cbHi();
}
function cbHi(){if(!CB)return;const vis=[...CB.pop.querySelectorAll('.cbx-o:not([hidden])')];vis.forEach((b,i)=>b.classList.toggle('act',i===CB.act));if(vis[CB.act])vis[CB.act].scrollIntoView({block:'nearest'})}
function cbClose(){if(!CB)return;CB.pop.remove();if(CB.inp.isConnected)CB.inp.setAttribute('aria-expanded','false');CB=null}
scr.addEventListener('focusin',e=>{const w=e.target.closest&&e.target.closest('.cbx');if(w&&e.target.tagName==='INPUT'&&(!CB||CB.wrap!==w||!CB.pop.isConnected))cbOpen(w)});
scr.addEventListener('focusout',e=>{if(CB&&e.target===CB.inp)setTimeout(()=>{if(CB&&document.activeElement!==CB.inp)cbClose()},150)});
scr.addEventListener('scroll',e=>{if(CB&&e.target!==CB.pop)cbPlace()},true);
scr.addEventListener('keydown',e=>{
  if(!CB||e.target!==CB.inp)return;
  const vis=[...CB.pop.querySelectorAll('.cbx-o:not([hidden])')];
  if(e.key==='ArrowDown'){e.preventDefault();CB.act=Math.min(vis.length-1,CB.act+1);cbHi()}
  else if(e.key==='ArrowUp'){e.preventDefault();CB.act=Math.max(0,CB.act-1);cbHi()}
  else if(e.key==='Enter'){e.preventDefault();const b=vis[CB.act]||(vis.length===1?vis[0]:null);if(b)b.click()}
  else if(e.key==='Escape'){e.preventDefault();CB.inp.value='';const i=CB.inp;cbClose();i.blur()}
});

/* ---------- clics, cambios y envíos ---------- */
scr.addEventListener('click',ev=>{
  const t=ev.target.closest('[data-a]');
  if(UI.reqs&&!ev.target.closest('.popw')){UI.reqs=false;if(!t){render();return}}
  if(t&&!t.disabled&&scr.contains(t)){ev.preventDefault();const f=A[t.dataset.a];if(f){cbClose();f(t.dataset)}}
});
scr.addEventListener('input',ev=>{
  if(CB&&ev.target===CB.inp){cbFilter();return}
  const b=ev.target.dataset&&ev.target.dataset.bind;if(b&&!('rr' in ev.target.dataset&&ev.target.type==='search')){setBind(b,ev.target.value);save()}
});
scr.addEventListener('change',ev=>{
  if(ev.target.id==='f-import'){onImport(ev.target);return}
  if(ev.target.type==='file'){onFiles(ev.target);return}
  if(ev.target.closest&&ev.target.closest('.cbx'))return;
  if(ev.target.dataset&&ev.target.dataset.tbind){
    const path=ev.target.dataset.tbind,cv=getBind(path);let h='',m='';
    if(mins(cv)!==null)[h,m]=cv.split(':');else if(UI.tp[path]){h=UI.tp[path].h;m=UI.tp[path].m}
    if(ev.target.dataset.part==='h')h=ev.target.value;else m=ev.target.value;
    if(h&&!m&&ev.target.dataset.part==='h')m='00';
    if(h&&m){delete UI.tp[path];setBind(path,h+':'+m)}else{if(!h&&!m)delete UI.tp[path];else UI.tp[path]={h,m};setBind(path,'')}
    render();return}
  const b=ev.target.dataset&&ev.target.dataset.bind;if(!b)return;
  setBind(b,ev.target.value);
  if('rr' in ev.target.dataset)render();else save();
});
scr.addEventListener('submit',ev=>{ev.preventDefault();
  if(ev.target.id==='loginf'){const L=UI.login;const r=Object.keys(USERS).find(k=>USERS[k].id===L.u.trim().toLowerCase());
    if(!r||L.p!==PW){S.log.push({ts:tsNow(),who:L.u.trim()||'(vacío)',rol:'',accion:'Ingreso fallido',obj:'',det:'Usuario o clave incorrectos',mot:'',tipo:'ingreso'});L.err='Usuario o contraseña incorrectos.'+(EVAL?' Probá con un usuario de prueba.':'');render();return}
    enter(r,'Usuario y clave')}
  if(ev.target.id==='trabf')submitTrab();
  if(ev.target.id==='habf')submitHab();
  if(ev.target.id==='whyf'){const m=UI.whyTxt.trim();if(!m){UI.modal.err='Escribí el motivo para poder guardar el cambio.';render();setTimeout(()=>{const t=$('#why-t');if(t)t.focus()},20);return}
    const fn=UI.whyFn;UI.modal=UI.whyBack||null;UI.whyFn=null;UI.whyBack=null;UI.whyTxt='';if(fn)fn(m);render()}
});

/* ---------- Gantt: arrastrar para mover, bordes para estirar o acortar ---------- */
scr.addEventListener('pointerdown',ev=>{
  const bar=ev.target.closest('.gbar');if(!bar)return;
  const t=trab(bar.dataset.id),track=bar.parentElement;
  const h=ev.target.dataset&&ev.target.dataset.h;
  drag={bar,t,mode:h==='r'?'r':h==='l'?'l':'m',x0:ev.clientX,px:track.getBoundingClientRect().width/28,o:{i:t.inicio,d:t.dias},n:{i:t.inicio,d:t.dias},moved:false,lock:started(t),closed:!!t.cierre,min:minDias(t),ok:canPlan()};
  bar.setPointerCapture(ev.pointerId);ev.preventDefault();
});
scr.addEventListener('pointermove',ev=>{
  if(!drag)return;const dx=ev.clientX-drag.x0;if(Math.abs(dx)>6)drag.moved=true;if(!drag.moved||!drag.ok||drag.closed)return;
  const dd=Math.round(dx/drag.px),o=drag.o;let i=o.i,d=o.d;
  if(drag.mode==='r')d=Math.max(drag.min,Math.min(30,o.d+dd));
  else if(drag.lock)return;
  else if(drag.mode==='l'){const k=Math.min(dd,o.d-1);i=addDays(o.i,k);d=o.d-k;if(i<TODAY){d-=diffD(i,TODAY);i=TODAY}}
  else{i=addDays(o.i,dd);if(i<TODAY)i=TODAY}
  drag.n={i,d};drag.bar.classList.add('drag');
  drag.bar.style.left=(diffD(S.gs,i)/28*100)+'%';drag.bar.style.width=(d/28*100)+'%';
  const gl=drag.bar.querySelector('.gl');if(gl)gl.innerHTML=`<span class="mono">${drag.t.id}</span> ${d} días · ${fDay(i)} → ${fDay(addDays(i,d-1))}`;
});
const endDrag=()=>{
  if(!drag)return;const g=drag;drag=null;
  if(!g.moved){UI.drawer=g.t.id;render();return}
  if(!g.ok){render();return}
  if(g.closed){toast(`${g.t.id} ya está cerrado. ${isAdm()?'Reabrilo desde el detalle para cambiar fechas.':'Solo administración puede reabrirlo.'}`);render();return}
  if(g.lock&&g.mode!=='r'){toast(`${g.t.id} ya tiene partes cargados: solo se puede estirar o acortar desde el final`);render();return}
  if(g.n.i!==g.o.i||g.n.d!==g.o.d)moveT(g.t,g.n.i,g.n.d);
  render();
};
scr.addEventListener('pointerup',endDrag);scr.addEventListener('pointercancel',endDrag);

/* ---------- conexión: sin señal se guarda en la tablet y al volver se sincroniza ---------- */
addEventListener('online',()=>{NET.online=true;if(S&&!offline()){const n=syncQueue();if(n)toast(`Señal recuperada · ${n} parte${n>1?'s':''} sincronizado${n>1?'s':''}`)}if(S)render()});
addEventListener('offline',()=>{NET.online=false;if(S){toast('Sin señal: los cambios quedan guardados en la tablet');render()}});
addEventListener('resize',fit);
addEventListener('orientationchange',()=>setTimeout(fit,200));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S&&iso(new Date())!==TODAY)render()});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{applyTheme(document.documentElement.dataset.theme);if(S)render()});

/* ---------- actualización de la app (service worker) ---------- */
let SWREG=null;
A.upd=()=>{if(SWREG&&SWREG.waiting)SWREG.waiting.postMessage('skip');else location.reload()};
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').then(reg=>{SWREG=reg;
    const ready=()=>{if(reg.waiting&&navigator.serviceWorker.controller){UI.update=true;render()}};ready();
    reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed')ready()})});
  }).catch(()=>{})});
  let reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(UI.update&&!reloaded){reloaded=true;location.reload()}});
}

/* ---------- arranque ---------- */
(()=>{let t=null;try{t=localStorage.getItem(THEME_KEY)}catch(e){}applyTheme(t)})();
S=load()||fresh();
fit();render();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{fit();render()});
