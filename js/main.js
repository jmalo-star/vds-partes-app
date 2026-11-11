/* ---------- eventos, escala de pantalla, conexión y arranque ---------- */
const scr=$('#screen');
let SCALE=1,drag=null,CB=null;

/* La app se diseña a 800 px de alto (y al menos 1180 de ancho) y se escala para llenar la pantalla:
   en la tablet del operador (10,1", 1280×800 horizontal) cada pantalla entra entera, sin scroll de página.
   Teclado en pantalla: si solo baja el alto mientras se escribe, no se reescala ni se cierra la lista abierta:
   la pantalla se corre hacia arriba lo justo para que el campo quede a la vista. */
let FIT={w:0,h:0,dy:0};
function fit(){
  const app=$('#app'),W0=app.clientWidth||innerWidth,H0=app.clientHeight||innerHeight,st=$('#stage'),ae=document.activeElement;
  const typing=ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)&&ae.inputMode!=='none'&&scr.contains(ae);
  if(typing&&W0===FIT.w&&H0<FIT.h){const r=ae.getBoundingClientRect();FIT.dy=Math.max(0,r.bottom+FIT.dy-H0+12);st.style.transform=`translateY(${-FIT.dy}px) scale(${SCALE})`;cbPlace();return}
  const same=W0===FIT.w&&H0===FIT.h;FIT={w:W0,h:H0,dy:0};
  let s=Math.min(H0/DH,W0/MINW);s=Math.max(.5,Math.min(1.5,s));SCALE=s;
  st.style.width=(W0/s)+'px';st.style.height=(H0/s)+'px';st.style.transform=`scale(${s})`;
  if(same)cbPlace();else cbClose();
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

/* ---------- desplegables propios: con búsqueda (cbx) y para elegir un valor (dd) ---------- */
function cbOpen(wrap){
  cbClose();
  const dd=wrap.classList.contains('dd'),inp=wrap.querySelector(dd?'.ddb':'input'),tpl=wrap.querySelector('template');if(!inp||!tpl)return;
  const pop=document.createElement('div');pop.className='cbx-pop';pop.id='cbx-pop';pop.setAttribute('role','listbox');
  pop.appendChild(tpl.content.cloneNode(true));
  pop.addEventListener('mousedown',e=>e.preventDefault());
  if(!dd&&inp.inputMode==='none'){const k=document.createElement('button');k.type='button';k.className='cbx-kb';k.innerHTML=ic('search')+'Escribir para buscar';pop.prepend(k)}
  scr.appendChild(pop);
  CB={wrap,inp,pop,act:-1,dd};
  inp.setAttribute('aria-expanded','true');inp.setAttribute('aria-controls','cbx-pop');
  cbPlace();
  if(dd){const o=[...pop.querySelectorAll('.cbx-o')];CB.act=o.findIndex(b=>b.classList.contains('sel'));cbHi();inp.focus({preventScroll:true})}
  else cbFilter();
}
/* Ubicaciones con coordenadas (miles): la lista se arma con lo que se escribe, no se carga entera */
function ubxFill(){
  const w=CB.wrap,op=w.dataset.op,i=w.dataset.i,q=CB.inp.value.trim(),kb=CB.inp.inputMode==='none';
  const opt=u=>`<button type="button" class="cbx-o" role="option" data-a="m-upick" data-i="${i}" data-u="${esc(u.id)}"><span class="nm"><b>${esc(u.n)}</b><small>${esc(ubicTxt(u))}</small></span></button>`;
  let h=kb?`<button type="button" class="cbx-kb">${ic('search')}Escribir para buscar</button>`:'';
  if(!UB.ready)h+='<div class="cbx-none">Cargando ubicaciones…</div>';
  else if(!q){const rec=[...new Set(S.trabajos.filter(t=>t.uid&&CT(t.ct)&&CT(t.ct).op===op).sort((a,b)=>b.inicio.localeCompare(a.inicio)).map(t=>t.uid))].map(id=>UB.byId[id]).filter(Boolean).slice(0,8);
    h+=`<div class="cbx-none">Escribí el nombre del pozo, la batería o el yacimiento. Hay ${ubicN(op).toLocaleString('es-AR')} ubicaciones de ${esc(OPS[op]||op)}.</div>`+(rec.length?`<div class="cbx-g">Usadas hace poco</div>${rec.map(opt).join('')}`:'')}
  else{const r=ubicFind(op,q,40);h+=r.list.map(opt).join('')||`<div class="cbx-none">Nada coincide con "${esc(q)}"</div>`;if(r.total>r.list.length)h+=`<div class="cbx-none">Se muestran ${r.list.length} de ${r.total.toLocaleString('es-AR')}: escribí más para acotar.</div>`}
  h+=`<button type="button" class="cbx-o otra" role="option" data-a="m-uotra" data-i="${i}">${ic('edit')}<span class="nm"><b>Otra ubicación: escribirla</b><small>Queda sin coordenadas: no se puede abrir en el mapa</small></span></button>`;
  CB.pop.innerHTML=h;CB.act=q&&CB.pop.querySelector('.cbx-o:not(.otra)')?0:-1;cbHi()}
function cbPlace(){
  if(!CB)return;const s=SCALE,r=CB.inp.getBoundingClientRect(),sr=scr.getBoundingClientRect(),vv=window.visualViewport;
  const W=sr.width/s,H=sr.height/s,top=(r.top-sr.top)/s,bot=(r.bottom-sr.top)/s,w=Math.max(r.width/s,320);
  // solo la parte visible: con el teclado abierto es más chica y la lista tiene que entrar ahí
  const vt=Math.max(0,((vv?vv.offsetTop:0)-sr.top)/s),vb=Math.min(H,((vv?vv.offsetTop+vv.height:innerHeight)-sr.top)/s);
  const left=Math.max(8,Math.min((r.left-sr.left)/s,W-w-8)),below=vb-bot-12,above=top-vt-12;
  Object.assign(CB.pop.style,{left:left+'px',width:w+'px',top:'',bottom:''});
  if(below>=240||below>=above){CB.pop.style.top=(bot+4)+'px';CB.pop.style.maxHeight=Math.min(340,below)+'px'}
  else{CB.pop.style.bottom=(H-top+4)+'px';CB.pop.style.maxHeight=Math.min(340,above)+'px'}
}
function cbFilter(){
  if(!CB)return;if(CB.wrap.dataset.ubx){ubxFill();return}const q=norm(CB.inp.value);let n=0;
  CB.pop.querySelectorAll('.cbx-o').forEach(b=>{const ok=!q||b.dataset.q.includes(q);b.hidden=!ok;if(ok)n++});
  let head=null,cnt=0;[...CB.pop.children].forEach(el=>{if(el.classList.contains('cbx-g')){if(head)head.hidden=!cnt;head=el;cnt=0}else if(el.classList.contains('cbx-o')&&!el.hidden)cnt++});if(head)head.hidden=!cnt;
  let none=CB.pop.querySelector('.cbx-nores');
  if(!n&&q){if(!none){none=document.createElement('div');none.className='cbx-none cbx-nores';CB.pop.appendChild(none)}none.textContent=`Nada coincide con "${CB.inp.value}"`;none.hidden=false}else if(none)none.hidden=true;
  CB.act=q&&n?0:-1;cbHi();
}
function cbHi(){if(!CB)return;const vis=[...CB.pop.querySelectorAll('.cbx-o:not([hidden])')];vis.forEach((b,i)=>b.classList.toggle('act',i===CB.act));if(vis[CB.act])vis[CB.act].scrollIntoView({block:'nearest'})}
function cbClose(){if(!CB)return;CB.pop.remove();if(CB.inp.isConnected){CB.inp.setAttribute('aria-expanded','false');if(!CB.dd)CB.inp.inputMode=''}CB=null}
/* Tablet: el primer toque abre la lista sin teclado (casi siempre alcanza con elegir). Para buscar escribiendo:
   "Escribir para buscar" arriba de la lista, o tocar de nuevo el campo. */
function cbKb(){if(!CB||CB.dd)return;const i=CB.inp,k=CB.pop.querySelector('.cbx-kb');if(k)k.remove();i.inputMode='text';i.blur();i.focus()}
if(window.visualViewport){visualViewport.addEventListener('resize',()=>{if(CB)cbPlace()});visualViewport.addEventListener('scroll',()=>{if(CB)cbPlace()})}
scr.addEventListener('focusin',e=>{const w=e.target.closest&&e.target.closest('.cbx');if(w&&e.target.tagName==='INPUT'&&(!CB||CB.wrap!==w||!CB.pop.isConnected))cbOpen(w)});
scr.addEventListener('focusout',e=>{if(CB&&e.target===CB.inp)setTimeout(()=>{if(CB&&document.activeElement!==CB.inp)cbClose()},150)});
scr.addEventListener('scroll',e=>{if(CB&&e.target!==CB.pop)cbPlace()},true);
/* Las listas se cierran al tocar afuera. En la tablet, el campo de búsqueda arranca sin teclado (ver cbKb) */
document.addEventListener('pointerdown',e=>{
  if(CB&&!CB.pop.contains(e.target)&&!CB.wrap.contains(e.target))cbClose();
  const inp=(e.pointerType==='touch'||e.pointerType==='pen')&&e.target.closest&&e.target.closest('.cbx input');
  if(inp){const was=document.activeElement===inp;inp.dataset.was=was?'1':'';if(!was)inp.inputMode='none'}
},true);
scr.addEventListener('keydown',e=>{
  if(!CB){const b=e.target.closest&&e.target.closest('.ddb');if(b&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();cbOpen(b.parentElement)}return}
  if(e.target!==CB.inp)return;
  const vis=[...CB.pop.querySelectorAll('.cbx-o:not([hidden])')];
  if(e.key==='ArrowDown'){e.preventDefault();CB.act=Math.min(vis.length-1,CB.act+1);cbHi()}
  else if(e.key==='ArrowUp'){e.preventDefault();CB.act=Math.max(0,CB.act-1);cbHi()}
  else if(e.key==='Enter'){e.preventDefault();const b=vis[CB.act]||(vis.length===1?vis[0]:null);if(b)b.click()}
  else if(e.key==='Escape'){e.preventDefault();const i=CB.inp,dd=CB.dd;if(!dd)i.value='';cbClose();if(dd)i.focus();else i.blur()}
  else if(e.key==='Tab')cbClose();
});

/* ---------- clics, cambios y envíos ---------- */
scr.addEventListener('click',ev=>{
  if(Date.now()<noClick){ev.preventDefault();return}
  if(ev.target.closest('.cbx-kb')){ev.preventDefault();cbKb();return}
  const ci=ev.target.closest('.cbx input');
  if(ci&&ci.dataset.was==='1'&&ci.inputMode==='none'){ci.dataset.was='';if(CB&&CB.inp===ci)cbKb();else{cbOpen(ci.closest('.cbx'))}return}
  const ddb=ev.target.closest('.ddb');
  if(ddb){ev.preventDefault();if(CB&&CB.inp===ddb)cbClose();else cbOpen(ddb.parentElement);return}
  const t=ev.target.closest('[data-a]');
  if(UI.reqs&&!ev.target.closest('.popw')){UI.reqs=false;if(!t){render();return}}
  if(t&&!t.disabled&&scr.contains(t)){ev.preventDefault();const f=A[t.dataset.a];if(f){cbClose();f(t.dataset)}}
});
scr.addEventListener('input',ev=>{
  if(CB&&ev.target===CB.inp){cbFilter();return}
  const b=ev.target.dataset&&ev.target.dataset.bind;if(b&&!('rr' in ev.target.dataset&&ev.target.type==='search')){clampNum(ev.target);setBind(b,ev.target.value);save()}
});
scr.addEventListener('change',ev=>{
  if(ev.target.id==='f-import'){onImport(ev.target);return}
  if(ev.target.type==='file'){onFiles(ev.target);return}
  if(ev.target.closest&&ev.target.closest('.cbx'))return;
  if(ev.target.dataset&&ev.target.dataset.tbind){
    const tp=ev.target.closest('.tpick'),path=ev.target.dataset.tbind,cv=getBind(path)||(tp&&tp.dataset.v)||'';let h='',m='';
    if(mins(cv)!==null)[h,m]=cv.split(':');else if(UI.tp[path]){h=UI.tp[path].h;m=UI.tp[path].m}
    if(ev.target.dataset.part==='h')h=ev.target.value;else m=ev.target.value;
    if(h&&!m&&ev.target.dataset.part==='h')m='00';
    if(h&&m){delete UI.tp[path];setBind(path,h+':'+m)}else{if(!h&&!m)delete UI.tp[path];else UI.tp[path]={h,m};setBind(path,'')}
    render();return}
  const b=ev.target.dataset&&ev.target.dataset.bind;if(!b)return;
  clampNum(ev.target);setBind(b,ev.target.value);
  if('rr' in ev.target.dataset)render();else save();
});
/* Números: nunca negativos ni fuera de rango. Los límites van en min/max del campo (ver LIM en config.js) */
function clampNum(el){if(el.type!=='number'||el.value==='')return;const n=Number(el.value);if(!isFinite(n))return;
  const mn=el.min!==''?Number(el.min):-Infinity,mx=el.max!==''?Number(el.max):Infinity;if(n>=mn&&n<=mx)return;
  const v=Math.min(mx,Math.max(mn,n));el.value=String(v);toast(`Ese valor no es posible: va de ${num(mn)} a ${num(mx)}. Quedó en ${num(v)}.`)}
scr.addEventListener('submit',ev=>{ev.preventDefault();
  if(ev.target.id==='loginf'){const L=UI.login,id=L.u.trim().toLowerCase(),r=Object.keys(ALLU()).find(k=>UO(k).id===id),u=r&&UO(r);
    const fail=(det,msg)=>{S.log.push({ts:tsNow(),who:L.u.trim()||'(vacío)',rol:'',accion:'Ingreso fallido',obj:'',det,mot:'',tipo:'ingreso'});L.err=msg;render()};
    pwOk(u,L.p).then(ok=>{if(!ok)return fail('Usuario o clave incorrectos','Usuario o contraseña incorrectos.'+(EVAL?' Probá con un usuario de prueba.':''));
      if(u.off)return fail('Usuario desactivado','Este usuario está desactivado. Pedile al administrador que lo active.');
      enter(r,'Usuario y clave')}).catch(()=>fail('Sin conexión segura','No se pudo verificar la clave. Abrí la app desde su dirección segura (https).'))}
  if(ev.target.id==='usrf')submitUsr();
  if(ev.target.id==='nvvf')submitNvv();
  if(ev.target.id==='trabf')submitTrab();
  if(ev.target.id==='habf')submitHab();
  if(ev.target.id==='whyf'){const m=UI.whyTxt.trim();if(!m){UI.modal.err='Escribí el motivo para poder guardar el cambio.';render();setTimeout(()=>{const t=$('#why-t');if(t)t.focus()},20);return}
    const fn=UI.whyFn;UI.modal=UI.whyBack||null;UI.whyFn=null;UI.whyBack=null;UI.whyTxt='';if(fn)fn(m);render()}
});

/* Aviso flotante en lugar del title. En la tablet no hay cursor: el toque abre el detalle */
document.addEventListener('pointerover',ev=>{
  if(ev.pointerType==='touch'||drag||cdrag)return;
  const el=ev.target.closest&&ev.target.closest('[data-tip],[data-ttl],[title]');
  if(el===tipEl)return;tipHide();if(!el)return;
  if(el.title){el.dataset.ttl=el.title;el.removeAttribute('title')}
  tipEl=el;const x=ev.clientX;tipTo=setTimeout(()=>{if(el.isConnected&&tipEl===el)tipShow(el,x)},220);
});
document.addEventListener('pointerout',ev=>{if(tipEl&&!(ev.relatedTarget&&tipEl.contains(ev.relatedTarget)))tipHide()});
['pointerdown','keydown','scroll'].forEach(n=>document.addEventListener(n,tipHide,true));
document.addEventListener('focusin',ev=>{const el=ev.target.closest&&ev.target.closest('[data-ttl],[data-tip]');if(el&&el.matches(':focus-visible')){tipEl=el;const r=el.getBoundingClientRect();tipShow(el,r.x+r.width/2)}});
document.addEventListener('focusout',tipHide);

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

/* ---------- calendario (por recurso y mes): arrastrar un trabajo a otro día ---------- */
let cdrag=null,noClick=0;
scr.addEventListener('pointerdown',ev=>{
  const chip=ev.target.closest('.drg[data-id]');if(!chip||!canPlan())return;
  const cell=chip.closest('[data-d]');if(!cell)return;
  cdrag={chip,t:trab(chip.dataset.id),from:cell.dataset.d,rec:cell.dataset.rec||null,x0:ev.clientX,y0:ev.clientY,moved:false,ghost:null,tgt:null};
});
scr.addEventListener('pointermove',ev=>{
  const g=cdrag;if(!g)return;
  if(!g.moved){if(Math.hypot(ev.clientX-g.x0,ev.clientY-g.y0)<8)return;g.moved=true;
    const r=g.chip.getBoundingClientRect();g.dx=(ev.clientX-r.left)/SCALE;g.dy=(ev.clientY-r.top)/SCALE;
    g.ghost=g.chip.cloneNode(true);g.ghost.classList.add('dragghost');g.ghost.style.width=(r.width/SCALE)+'px';scr.appendChild(g.ghost);g.chip.classList.add('dragsrc')}
  const sr=scr.getBoundingClientRect();g.ghost.style.left=((ev.clientX-sr.left)/SCALE-g.dx)+'px';g.ghost.style.top=((ev.clientY-sr.top)/SCALE-g.dy)+'px';
  const el=document.elementFromPoint(ev.clientX,ev.clientY),cell=el&&el.closest('#screen [data-d]');
  if(g.tgt&&g.tgt!==cell)g.tgt.classList.remove('droptgt','dropbad');
  g.tgt=cell;if(cell)cell.classList.add(cell.dataset.d>=TODAY&&(!g.rec||cell.dataset.rec===g.rec)&&!started(g.t)&&!g.t.cierre?'droptgt':'dropbad');
});
const endCal=ev=>{
  const g=cdrag;if(!g)return;cdrag=null;if(!g.moved)return;
  noClick=Date.now()+400;if(g.ghost)g.ghost.remove();g.chip.classList.remove('dragsrc');if(g.tgt)g.tgt.classList.remove('droptgt','dropbad');
  const cell=ev.type==='pointerup'?g.tgt:null,t=g.t;
  if(!cell||cell.dataset.d===g.from){render();return}
  if(g.rec&&cell.dataset.rec!==g.rec){toast('Solo se mueve de día dentro de la misma cuadrilla. Para cambiar de cuadrilla, editá el trabajo.');render();return}
  if(t.cierre){toast(`${t.id} ya está cerrado`);render();return}
  if(started(t)){toast(`${t.id} ya tiene partes cargados: no se puede mover de día. Se puede estirar o acortar desde el Gantt.`);render();return}
  const ni=addDays(t.inicio,diffD(g.from,cell.dataset.d));
  if(ni<TODAY){toast('No se puede mover a un día que ya pasó');render();return}
  moveT(t,ni,t.dias);render();
};
scr.addEventListener('pointerup',endCal);scr.addEventListener('pointercancel',endCal);

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
