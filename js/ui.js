/* ---------- render, estructura de la app y componentes ---------- */
let toastT=null;
function render(){
  TODAY=iso(new Date());
  const scr=$('#screen');
  const sig=[S.route,S.step,S.sel,S.vsel,S.csel,S.vf,S.cf,S.pv,S.dtab,S.itab,S.ctab,S.cct,S.ccu,UI.modal?UI.modal.kind:'',UI.drawer].join('|');
  const keep={};
  if(sig===UI.sig)scr.querySelectorAll('[data-keep]').forEach(el=>keep[el.dataset.keep]=el.scrollTop);
  let h=S.user?shell():login();
  if(UI.modal)h+=modal();
  if(UI.toast)h+=`<div class="toast" role="status">${ic('check')}<span>${esc(UI.toast)}</span></div>`;
  if(UI.update)h+=`<button class="updbar" data-a="upd">${ic('refresh')}Hay una versión nueva de la app · tocá para actualizar</button>`;
  scr.innerHTML=h;
  scr.querySelectorAll('[data-keep]').forEach(el=>{if(keep[el.dataset.keep]!=null)el.scrollTop=keep[el.dataset.keep]});
  UI.sig=sig;
  initSigs();save();
}
function toast(m){UI.toast=m;clearTimeout(toastT);toastT=setTimeout(()=>{UI.toast=null;const t=$('#screen .toast');if(t)t.remove()},3600)}
function go(route){S.route=route;UI.drawer=null;render()}

/* ---------- tema diurno / nocturno ---------- */
const themeNow=()=>{const t=document.documentElement.dataset.theme;return t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')};
function applyTheme(t){const r=document.documentElement;if(t==='dark'||t==='light')r.dataset.theme=t;else delete r.dataset.theme;
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',themeNow()==='dark'?'#0A1016':'#13212C')}
const themeLbl=()=>themeNow()==='dark'?['sun','Modo diurno']:['moon','Modo nocturno'];

/* ---------- piezas ---------- */
function brand(sub){return `<div class="brand"><svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--accent)"/><path d="M8 8h4.2L16 19.2 19.8 8H24l-6 16h-4z" fill="#FFFFFF"/></svg><div><b>VIENTOS DEL SUR</b><small>${sub||'Partes de campo'}</small></div></div>`}
const selF=(id,bind,opts,cur,attrs)=>`<select class="inp" id="${id}" data-bind="${bind}" data-rr${attrs||''}>${opts.map(([v,l])=>`<option value="${esc(v)}"${String(v)===String(cur)?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
/* Selector de contrato agrupado por cliente y ordenado */
function ctSel(id,bind,op,cur,all,attrs,lab){
  const g={};ctKeys(op).forEach(k=>{const o=CT(k).op;(g[o]=g[o]||[]).push(k)});
  const opt=k=>`<option value="${esc(k)}"${k===cur?' selected':''}>${esc(k)} · ${esc(CT(k).n)}</option>`;
  return `<select class="inp" id="${id}" data-bind="${bind}" data-rr${attrs||''}${lab?` aria-label="${esc(lab)}"`:''}>${all?`<option value="all"${cur==='all'?' selected':''}>${esc(all)}</option>`:''}${Object.entries(g).map(([o,l])=>Object.keys(g).length>1||all?`<optgroup label="${esc(OPS[o]||o)}">${l.map(opt).join('')}</optgroup>`:l.map(opt).join('')).join('')}</select>`;
}
const opOpts=()=>[['all','Todos los clientes'],...Object.entries(OPS)];
const pill=e=>`<span class="pill s-${e}">${EST[e]}</span>`;
const prioB=p=>`<span class="prio p-${p}">${PRIO[p]}</span>`;
const ptTag=on=>on?`<span class="tag pt" title="Requiere permiso de trabajo firmado por la operadora">${ic('sign')}Permiso operadora</span>`:'';
const invTag=on=>on?' <span class="tag inv">inventado</span>':'';
const habChip=(h,edit,long)=>`<${edit?'button':'span'} class="hab h-${h.st}"${edit?` data-a="a-hab" data-s="${esc(edit[0])}" data-op="${edit[1]}" title="Editar habilitación"`:` title="${h.vence?'Vence '+fS(h.vence):h.st==='nd'?'Todavía no se cargaron habilitaciones':'Sin habilitación cargada'}"`}>${ic(h.st==='ok'?'check':h.st==='pronto'||h.st==='nd'?'clock':'x')}${habTxt(h,long)}</${edit?'button':'span'}>`;
const tabsH=(key,cur,items)=>`<div class="tabs" role="tablist">${items.map(([k,l,i,n])=>`<button role="tab" aria-selected="${cur===k}" data-a="tab" data-k="${key}" data-v="${k}">${i?ic(i):''}${l}${n!=null&&n!==''?`<span class="tn">${n}</span>`:''}</button>`).join('')}</div>`;
const kchip=(n,l,c)=>`<div class="kchip" style="--c:${c||'var(--ink)'}"><b>${n}</b><span>${l}</span></div>`;

/* Desplegable con búsqueda: se escribe para acotar y se toca la opción para agregarla.
   groups: [[título|null,[{v,t,s,b}]]] · v: valor · t: texto · s: detalle · b: html a la derecha (habilitación) */
function cbx(key,ph,groups,act,extra){
  const body=groups.filter(g=>g[1].length).map(([lab,items])=>(lab?`<div class="cbx-g">${esc(lab)}</div>`:'')+items.map(o=>`<button type="button" class="cbx-o" role="option" data-a="${act}" data-n="${esc(o.v)}"${extra||''} data-q="${esc(norm(o.v+' '+o.t+' '+(o.s||'')))}"><span class="nm"><b>${o.th||esc(o.t)}</b>${o.s?`<small>${esc(o.s)}</small>`:''}</span>${o.b||''}</button>`).join('')).join('');
  return `<div class="cbx" data-cbx="${key}">${ic('search')}<input class="inp" type="text" placeholder="${esc(ph)}" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-label="${esc(ph)}"><template>${body||'<div class="cbx-none">No queda nada para agregar.</div>'}</template></div>`;
}

/* ---------- ingreso ---------- */
function login(){
  const L=UI.login,dark=themeNow()==='dark',[ti,tl]=themeLbl();
  const card=L.demo?`<div class="lgn-demo"><div class="lgn-dh"><button class="ibtn" data-a="l-demo" aria-label="Volver">${ic('left')}</button><div><b>Usuarios de prueba</b><small>Clave para todos: <span class="mono">${PW}</span></small></div></div>
      ${Object.keys(USERS).map(r=>{const u=USERS[r],ad=u.rol==='planner'&&admOf(r);return `<button data-a="demo" data-r="${r}"><span class="av">${esc(u.ini)}</span><span class="dn"><span class="rolet">${ROLE_N[u.rol]}${ad?' · con permisos de administración':''}</span><b>${esc(u.n)} <span class="mono sm">${esc(u.id)}</span></b><small>${ROLE_D[u.rol]}</small></span>${ic('right')}</button>`}).join('')}</div>`
    :`<form id="loginf" novalidate>
      <div class="fld"><label for="lu">Usuario</label><input id="lu" class="inp${L.err?' bad':''}" data-bind="l:u" value="${esc(L.u)}" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Tu usuario"></div>
      <div class="fld"><label for="lp">Contraseña</label><div class="pwd"><input id="lp" type="${L.show?'text':'password'}" class="inp${L.err?' bad':''}" data-bind="l:p" value="${esc(L.p)}" autocomplete="current-password" placeholder="Tu contraseña"><button type="button" class="ibtn" data-a="l-eye" aria-label="${L.show?'Ocultar':'Mostrar'} contraseña">${ic(L.show?'eyeoff':'eye')}</button></div></div>
      ${L.err?`<div class="ferr">${esc(L.err)}</div>`:''}
      <button class="btn pri lg" type="submit">Ingresar ${ic('right')}</button>
    </form>
    <div class="lgn-note">${ic('badge')}<span>Acceso administrado por tu empresa. Si necesitás una cuenta, pedila a tu administrador.</span></div>
    ${EVAL?`<div class="lgn-eval"><span class="dot"></span><span>Versión de evaluación · los registros quedan en este dispositivo</span><button type="button" data-a="l-demo">Usuarios de prueba</button></div>`:''}`;
  return `<div class="lgn${dark?'':' day'}">
  <div class="lgn-bg" aria-hidden="true"></div><div class="lgn-shade" aria-hidden="true"></div>
  <header class="lgn-top">${brand('Sistema de partes de campo')}<button class="lgn-theme" data-a="theme">${ic(ti)}${tl}</button></header>
  <section class="lgn-hero">
    <span class="lgn-kicker">Operación · trazabilidad · control</span>
    <h1>Cada jornada.<br>Un registro claro.</h1>
    <p>Del trabajo planificado a lo que pasa en campo, con aprobación y certificación del cliente en la misma herramienta.</p>
    <ol class="lgn-steps"><li>${ic('gantt')}<b>Planificar</b><small>Organizar el trabajo</small></li><li>${ic('day')}<b>Registrar</b><small>Parte diario en campo</small></li><li>${ic('shield')}<b>Aprobar</b><small>Revisión de VDS</small></li><li>${ic('stamp')}<b>Certificar</b><small>Firma del cliente</small></li></ol>
    <div class="lgn-loc"><i></i>Patagonia Argentina · Base ${BASE_GEO.n}</div>
  </section>
  <div class="lgn-card"><span class="lgn-eyebrow">Sistema de partes</span><h2>Ingresar a tu operación</h2><p class="lgn-sub">Tu cuenta habilita la vista correspondiente a tu rol.</p>${card}</div>
  </div>`;
}

/* ---------- estructura: menú lateral + barra superior + vista ---------- */
function shell(){
  const u=USERS[S.user],r=u.rol,[ti,tl]=themeLbl();
  const navs={
    admin:[['p-plan','Planificación','gantt'],['v-inbox','Aprobación de partes','shield'],['p-list','Partes','list'],['p-hab','Habilitaciones','badge'],['c-inbox','Certificación','stamp'],['c-dash','Dashboard cliente','chart'],['a-log','Registro de actividad','log'],['a-conf','Configuración','cog']],
    planner:[['p-plan','Planificación','gantt'],['v-inbox','Aprobación de partes','shield'],['p-list','Partes','list'],['p-hab','Habilitaciones','badge']],
    operador:[['o-day','Mi jornada','day']],
    cliente:[['c-dash','Dashboard','chart'],['c-inbox','Certificación','stamp']]}[r].slice();
  if(r==='planner'&&isAdm())navs.push(['a-log','Registro de actividad','log'],['a-conf','Configuración','cog']);
  const badge=k=>{let n=0;
    if(k==='v-inbox')n=S.partes.filter(p=>p.estado==='env'&&!p.cola).length;
    if(k==='o-day')n=S.partes.filter(p=>p.rec===USERS.operador.rec&&p.estado==='obs').length;
    if(k==='p-plan')n=S.trabajos.filter(t=>t.ext).length;
    if(k==='p-list')n=S.partes.filter(p=>p.estado==='obs').length;
    if(k==='c-inbox')n=S.partes.filter(p=>p.estado==='apr'&&(r==='admin'||p.op===USERS.cliente.op)).length;
    return n?`<span class="cnt" aria-label="${n} pendientes">${n}</span>`:''};
  const curR=S.route==='o-edit'?(S.back||'o-day'):S.route;
  return `<aside class="rail${S.rmin?' min':''}"><div class="rtop">${brand()}<button class="rtog" data-a="rail" aria-label="${S.rmin?'Expandir menú':'Contraer menú'}" title="${S.rmin?'Expandir menú':'Contraer menú'}">${ic(S.rmin?'dbr':'dbl')}</button></div><div class="rrole">${ROLE_N[r]}${r==='planner'&&isAdm()?' · admin':''}</div>
    <nav>${navs.map(([k,l,i])=>`<button class="nav" data-a="nav" data-r="${k}"${curR===k?' aria-current="page"':''} title="${l}">${ic(i)}<span>${l}</span>${badge(k)}</button>`).join('')}</nav>
    <div class="rfoot"><button class="nav" data-a="theme" title="${tl}">${ic(ti)}<span>${tl}</span></button>
    <div class="who"><span class="av" title="${esc(u.n)}">${esc(u.ini)}</span><div class="wn"><b>${esc(u.n)}</b><small>${esc(u.cargo)}</small></div><button class="ibtn rl" data-a="logout" aria-label="Cerrar sesión" title="Cerrar sesión">${ic('out')}</button></div></div>
  </aside><section class="main">${topbar()}${view()}${UI.drawer?drawer():''}</section>`;
}
function netChip(){const off=offline();return `<button class="sync${off?' off':''}" data-a="sync" title="${EVAL?'Tocá para simular que no hay señal':''}">${ic(off?'nowifi':'wifi')}${off?'Sin señal · guarda en la tablet':'En línea'}</button>`}
function topbar(){
  const R=S.route;let t='',s='',right='';
  const date=`<span class="datechip">${ic('cal')}${fDay(TODAY)} ${TODAY.slice(0,4)}</span>`;
  const nb=`<button class="btn pri" data-a="p-new">${ic('plus')}Nueva planificación</button>`;
  if(R==='p-plan'){t='Planificación';s='Trabajos por contrato, recurso y día';right=date+nb}
  else if(R==='p-list'){t='Partes diarios';s='Todos los partes de la base';right=date+nb}
  else if(R==='p-hab'){t='Habilitaciones de ingreso';s=isAdm()?'Tocá una habilitación para editarla':'Personal y vehículos habilitados por operadora';right=date}
  else if(R==='o-day'){t='Mi jornada';s=recOf(USERS.operador.rec).n+' · '+fDayM(TODAY);right=netChip()}
  else if(R==='o-edit'){const p=cur(),tt=trab(p.pl);return `<header class="top"><button class="btn ghost" data-a="nav" data-r="${S.back||'o-day'}">${ic('left')}${S.back&&S.back!=='o-day'?'Volver':'Mi jornada'}</button><div class="ttl"><h1>Parte diario <span class="mono">${p.id}</span></h1><div class="sub">${fDay(p.fecha)} · ${p.pl} día ${p.dia+1} de ${tt?tt.dias:'—'} · ${esc(locOf(p))}</div></div><span class="sp"></span><div class="tr">${ptTag(p.ptw)}${prioB(p.prio)}${pill(p.estado)}${role()==='operador'?netChip():''}</div></header>`}
  else if(R==='v-inbox'){t='Aprobación de partes';s='Planificación revisa y aprueba lo que cargan las cuadrillas';right=date}
  else if(R==='c-inbox'){t='Certificación de partes';s=isAdm()?'Todas las operadoras':OPS[USERS.cliente.op]+' · contratos con Vientos del Sur';right=date}
  else if(R==='c-dash'){t='Dashboard del servicio';s=(isAdm()?OPS[S.dop]:OPS[USERS.cliente.op])+' · datos de partes aprobados';right=date}
  else if(R==='a-conf'){t='Configuración';s='Datos maestros, contratos, cuadrillas, usuarios y permisos';right=date}
  else if(R==='a-log'){t='Registro de actividad';s='Ingresos y cambios en partes, trabajos y configuración';right=date}
  return `<header class="top"><div class="ttl"><h1>${t}</h1><div class="sub">${esc(s)}</div></div><span class="sp"></span><div class="tr">${right}</div></header>`;
}
function view(){
  switch(S.route){
    case 'p-plan':return `<div class="view">${vPlan()}</div>`;
    case 'p-list':return `<div class="view">${vList()}</div>`;
    case 'p-hab':return `<div class="view">${vHab()}</div>`;
    case 'o-day':return `<div class="view">${vDay()}</div>`;
    case 'o-edit':return `<div class="view flush">${vEdit()}</div>`;
    case 'v-inbox':return `<div class="view flush">${vInbox('v')}</div>`;
    case 'c-inbox':return `<div class="view flush">${vInbox('c')}</div>`;
    case 'c-dash':return `<div class="view">${vDash()}</div>`;
    case 'a-conf':return `<div class="view">${vConf()}</div>`;
    case 'a-log':return `<div class="view">${vLog()}</div>`;
  }
  return '';
}
