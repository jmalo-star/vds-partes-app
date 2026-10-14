/* ---------- acciones: enlaces de formularios y botones (data-a) ---------- */
function bindObj(root){return root==='m'?UI.modal&&UI.modal.f:root==='e'?cur().ejec:root==='p'?cur():root==='l'?UI.login:root==='v'||root==='u'?UI:root==='n'?UI.newT:root==='i'?UI.newI:root==='w'?UI.newU:root==='s'?S:root==='k'?S.contratos:root==='q'?S.cat.cuadrillas:null}
function getBind(path){const i=path.indexOf(':');let o=bindObj(path.slice(0,i));for(const k of path.slice(i+1).split('.')){if(o==null)return '';o=o[k]}return o??''}
function setBind(path,val){
  const i=path.indexOf(':'),root=path.slice(0,i),keys=path.slice(i+1).split('.');
  let o=bindObj(root);
  if(!o)return;
  if(root==='e'&&keys[0]==='clima'){if(!o.clima)o.clima={t:'',v:'',r:'',dir:'O',cond:'Despejado',src:'manual'};o.clima.src='manual'}
  if(root==='e'&&keys[0]==='permiso'&&!o.permiso)o.permiso={num:'',firmo:'',hora:''};
  for(let k=0;k<keys.length-1;k++)o=o[keys[k]];
  o[keys[keys.length-1]]=val;
  if(root==='v')UI.verr='';
  if(root==='s'&&keys[0]==='fop'){if(S.fct!=='all'&&val!=='all'&&CT(S.fct).op!==val)S.fct='all'}
  if(root==='s'&&keys[0]==='lop'){if(S.lct!=='all'&&val!=='all'&&CT(S.lct).op!==val)S.lct='all'}
  if(root==='s'&&keys[0]==='dop'){S.dct='all';S.dimp='all'}
  if(root==='s'&&keys[0]==='dct'){S.dimp='all'}
  if(root==='m'&&keys[0]==='ct'){const c=CT(val);const f=UI.modal.f;f.rec=c.recs.includes(f.rec)?f.rec:c.recs[0];f.pozo='';f.prev=[];f.imp=c.imps[0][0];f.ccsel=ccFor(val,f.rec);f.pers=(CREW[f.rec]||[]).slice();f.eqs=(VEH[f.rec]||[]).slice()}
  if(root==='m'&&keys[0]==='rec'){const f=UI.modal.f;f.pers=(CREW[val]||[]).slice();f.eqs=(VEH[val]||[]).slice();f.ccsel=ccFor(f.ct,val)}
  if(root==='k'){logA('Catálogo de tareas modificado',keys[0],`${CT(keys[0]).tareas[keys[2]][0]}: ${keys[3]==='1'?'unidad':'categoría de equipo'} → ${val||'(vacío)'}`,'','config')}
  if(root==='q'){applyCat(S.cat);logA('Cuadrilla renombrada',S.cat.cuadrillas[keys[0]].id,val,'','config')}
  if(root==='e'&&keys[0]==='reg'){const p=cur(),r=p.ejec.reg[keys[1]];
    if(keys[2]==='d'&&r.c==='op'){const u=unitOf(p.ct,val);if(u)r.u=u}
    if(keys[2]==='c'){if(val==='vi'){r.u='km/h';r.q='';if(r.d&&ESP.includes(r.d))r.d=''}else if(val==='op'){r.u=unitOf(p.ct,r.d)||'';r.q=''}else{r.q='';r.u=''}if(val==='es'&&!ESP.includes(r.d))r.d='';if(val!=='es'&&ESP.includes(r.d))r.d=''}}
}
function moveT(t,inicio,dias,why){
  const a={i:t.inicio,d:t.dias};t.inicio=inicio;t.dias=dias;
  const txt=a.d!==dias&&a.i===inicio?`Duración: ${a.d} → ${dias} días (hasta ${fDay(tEnd(t))})`:a.i!==inicio&&a.d===dias?`Reprogramado: ${fDay(a.i)} → ${fDay(inicio)}`:`Reprogramado: ${fDay(inicio)} → ${fDay(tEnd(t))} · ${dias} días`;
  t.hist.push({t:nowT(),who:meN(),a:txt,c:why||''});
  logA(a.d!==dias&&a.i===inicio?'Duración modificada':'Trabajo reprogramado',t.id,txt,why||'','trabajo');
  const cl=clashes(t);toast(`${t.id} · ${txt}${cl.length?' · se superpone con '+cl.map(x=>x.id).join(', '):''}`);
}
const whoCli=p=>role()==='cliente'?USERS.cliente.n+' · '+OPS[p.op]:meN()+' (admin)';
function askWhy(title,desc,ok,fn){UI.whyBack=UI.modal;UI.whyFn=fn;UI.whyTxt='';UI.modal={kind:'why',title,desc,ok,err:''};render();setTimeout(()=>{const t=$('#why-t');if(t)t.focus()},30)}
function diffParte(b,p){const e0=b.ejec||{},e1=p.ejec||{},J=JSON.stringify,ch=[];
  [['check','checklist'],['llegada','llegada'],['permiso','permiso'],['clima','clima'],['personal','personal'],['equipos','equipos'],['reg','tareas y tiempos'],['obs','observaciones'],['fotos','fotos'],['firma','firma']].forEach(([k,l])=>{if(J(e0[k])!==J(e1[k]))ch.push(l)});
  if(b.sup!==p.sup||b.rt!==p.rt)ch.push('responsables');if(b.fin!==p.fin||J(b.ext)!==J(p.ext)||b.cierreObs!==p.cierreObs)ch.push('cierre');return ch}
function discardEdit(){const p=cur();if(p&&UI.editSnap){const b=JSON.parse(UI.editSnap);Object.keys(p).forEach(k=>{if(!(k in b))delete p[k]});Object.assign(p,b)}UI.editSnap=null;UI.tp={}}
/* Al volver la señal se envían los partes que quedaron en cola */
function syncQueue(){const q=S.partes.filter(p=>p.cola);q.forEach(p=>{delete p.cola;p.hist.push({t:nowT(),who:'Sistema',a:'Sincronizado con la base',c:''})});return q.length}
function enter(r,how){S.user=r;S.route=HOME[USERS[r].rol];S.back=null;S.rmin=USERS[r].rol==='operador';UI.login={u:'',p:'',err:'',show:false,demo:false};UI.drawer=null;UI.modal=null;logA('Ingreso','',how,'','ingreso');render()}
const A={
  demo:d=>enter(d.r,'Usuario de prueba'),
  'l-demo':()=>{UI.login.demo=!UI.login.demo;UI.login.err='';render()},
  'l-eye':()=>{UI.login.show=!UI.login.show;render();const i=$('#lp');if(i)i.focus()},
  theme:()=>{const nx=themeNow()==='dark'?'light':'dark';try{localStorage.setItem(THEME_KEY,nx)}catch(e){}applyTheme(nx);render()},
  logout:()=>{if(UI.editSnap)discardEdit();logA('Salida','','','','ingreso');S.user=null;S.route='login';UI.drawer=null;UI.modal=null;UI.reqs=false;render()},
  nav:d=>{if(UI.editSnap&&S.route==='o-edit'){discardEdit();toast('Edición descartada: no se guardó ningún cambio')}if(d.r!=='o-edit')S.back=null;UI.reqs=false;go(d.r)},
  tab:d=>{S[d.k]=d.v;render()},
  rail:()=>{S.rmin=!S.rmin;render()},
  reqs:()=>{UI.reqs=!UI.reqs;render()},
  sync:()=>{if(!EVAL)return;S.simOff=!S.simOff;
    if(!offline()){const n=syncQueue();toast(n?`${n} parte${n>1?'s':''} sincronizado${n>1?'s':''}`:'Señal recuperada · todo al día')}
    else toast('Sin señal (simulado): los cambios quedan guardados en la tablet');
    render()},
  'p-view':d=>{S.pv=d.v;render()},
  'f-clear':()=>{S.fop='all';S.fct='all';render()},
  'p-nav':d=>{const k=Number(d.d);
    if(S.pv==='gantt')S.gs=k?addDays(S.gs,k*7):addDays(mondayOf(TODAY),-7);
    else if(S.pv==='rec')S.ws=k?addDays(S.ws,k*7):mondayOf(TODAY);
    else{if(!k)S.ms=TODAY.slice(0,7);else{const[y,m]=S.ms.split('-').map(Number);S.ms=iso(new Date(y,m-1+k,1)).slice(0,7)}}
    render()},
  'p-new':()=>openTrab(),
  'p-cell':d=>openTrab(d.rec,d.d),
  't-open':d=>{UI.drawer=d.id;render()},
  't-edit':()=>openTrab(null,null,UI.drawer),
  'close-drawer':()=>{UI.drawer=null;render()},
  't-dias':d=>{const t=trab(UI.drawer);const nd=t.dias+Number(d.d);if(nd<minDias(t)||nd>30)return;moveT(t,t.inicio,nd);render()},
  't-prio':d=>{const t=trab(UI.drawer);if(t.prio===d.p)return;const txt=`Prioridad: ${PRIO[t.prio]} → ${PRIO[d.p]}`;t.hist.push({t:nowT(),who:meN(),a:txt,c:''});logA('Prioridad modificada',t.id,txt,'','trabajo');t.prio=d.p;render()},
  'x-ok':d=>{const t=trab(d.id);const x=t.ext;t.ext=null;t.hist.push({t:nowT(),who:meN(),a:`Extensión aprobada: +${x.dias} día(s)`,c:x.motivo});moveT(t,t.inicio,t.dias+x.dias,'Pedido de '+x.who+': '+x.motivo);if(!S.trabajos.some(y=>y.ext))UI.reqs=false;render()},
  'x-no':d=>{const t=trab(d.id);const x=t.ext;t.ext=null;t.hist.push({t:nowT(),who:meN(),a:'Extensión rechazada',c:x.motivo});logA('Extensión rechazada',t.id,`Pedido de ${x.who}: +${x.dias} día(s) · ${x.motivo}`,'','trabajo');toast(`${t.id}: extensión rechazada. El trabajo termina el ${fDay(tEnd(t))}`);if(!S.trabajos.some(y=>y.ext))UI.reqs=false;render()},
  'a-del':()=>{const t=trab(UI.drawer);askWhy(`Eliminar ${t.id}`,`Se borra la planificación de ${recOf(t.rec).n} en ${t.pozo} (${fDay(t.inicio)} → ${fDay(tEnd(t))}). No tiene partes cargados.`,'Eliminar trabajo',m=>{S.trabajos=S.trabajos.filter(x=>x!==t);UI.drawer=null;logA('Trabajo eliminado',t.id,`${t.ct} · ${t.pozo} · ${fDay(t.inicio)} → ${fDay(tEnd(t))}`,m,'trabajo');toast(`${t.id} eliminado`)})},
  'a-reopen':()=>{const t=trab(UI.drawer);askWhy(`Reabrir ${t.id}`,'El trabajo vuelve a quedar abierto y se pueden cambiar sus fechas.','Reabrir trabajo',m=>{t.cierre=null;t.hist.push({t:nowT(),who:meN(),a:'Trabajo reabierto por administración',c:m});logA('Trabajo reabierto',t.id,'',m,'trabajo');toast(`${t.id} reabierto`)})},
  'p-filter':d=>{S.pf=d.f;render()},
  'h-filter':d=>{S.hf=d.f;render()},
  'h-bad':()=>{S.hbad=!S.hbad;render()},
  sum:d=>{UI.modal={kind:'sum',id:d.id};UI.admEst='';render()},
  pdf:d=>downloadPdf(d.id),
  'modal-close':()=>{UI.modal=null;render()},
  'm-ptw':d=>{UI.modal.f.ptw=d.v==='1';render()},
  'm-prio':d=>{UI.modal.f.prio=d.p;render()},
  'm-dias':d=>{const f=UI.modal.f;const ed=UI.modal.edit?trab(UI.modal.edit):null;f.dias=Math.max(ed?minDias(ed):1,Math.min(30,f.dias+Number(d.d)));render()},
  'm-tarea':d=>{const f=UI.modal.f;f.prev=f.prev.includes(d.t)?f.prev.filter(x=>x!==d.t):[...f.prev,d.t];UI.modal.err.prev='';render()},
  'm-padd':d=>{const f=UI.modal.f;if(!f.pers.includes(d.n))f.pers.push(d.n);UI.modal.err.pers='';render()},
  'm-pdel':d=>{const f=UI.modal.f;f.pers=f.pers.filter(x=>x!==d.n);render()},
  'm-eadd':d=>{const f=UI.modal.f;if(!f.eqs.includes(d.n))f.eqs.push(d.n);render()},
  'm-edel':d=>{const f=UI.modal.f;f.eqs=f.eqs.filter(x=>x!==d.n);render()},
  'a-hab':d=>{const h=S.hab[d.s+'|'+d.op];UI.modal={kind:'hab',f:{s:d.s,op:d.op,vence:h?h.vence:addDays(TODAY,365),sin:!h,mot:'',err:''}};render()},
  'h-sin':d=>{UI.modal.f.sin=d.v==='1';render()},
  'a-est':d=>{const p=byId(d.id);const ne=UI.admEst||p.estado;if(ne===p.estado)return;const old=p.estado;
    askWhy(`Cambiar estado de ${p.id}`,`${EST[old]} → ${EST[ne]}`,'Cambiar estado',m=>{p.hist.push({t:nowT(),who:meN(),a:`Estado cambiado por administración: ${EST[old]} → ${EST[ne]}`,c:m});logA('Estado de parte cambiado',p.id,`${EST[old]} → ${EST[ne]}`,m,'parte');p.estado=ne;if(ne!=='plan'&&!p.ejec)p.ejec=newEjec(p);UI.admEst='';UI.modal={kind:'sum',id:p.id};toast(`${p.id} ahora está ${EST[ne]}`)})},
  'a-edit':d=>{UI.modal=null;S.back=S.route;S.sel=d.id;S.step=0;UI.editSnap=JSON.stringify(byId(d.id));go('o-edit')},
  'a-cancel':()=>{const p=cur();discardEdit();toast(`Edición de ${p.id} descartada`);S.route=S.back||'p-list';render()},
  'a-save':()=>{const p=cur();const ch=diffParte(JSON.parse(UI.editSnap||'{}'),p);if(!ch.length){discardEdit();toast('No hubo cambios para guardar');S.route=S.back||'p-list';render();return}
    askWhy(`Guardar cambios en ${p.id}`,`Cambió: ${ch.join(', ')}.`,'Guardar cambios',m=>{UI.editSnap=null;p.hist.push({t:nowT(),who:meN(),a:'Editado por administración: '+ch.join(', '),c:m});logA('Parte editado',p.id,'Cambió: '+ch.join(', '),m,'parte');toast(`${p.id} guardado`);S.route=S.back||'p-list';UI.drawer=null})},
  'a-perm':d=>{const u=USERS[d.k],on=!S.adm[d.k];askWhy(`${on?'Dar':'Quitar'} permisos de administración`,`${u.n} ${on?'va a poder corregir partes, cambiar estados, editar habilitaciones y catálogos y ver el registro de actividad':'vuelve a tener solo planificación y aprobación de partes'}.`,on?'Dar permisos':'Quitar permisos',m=>{S.adm[d.k]=on;logA(on?'Permisos de administración otorgados':'Permisos de administración quitados',u.n,'',m,'config');toast(`${u.n}: permisos de administración ${on?'activados':'quitados'}`)})},
  'g-type':d=>{S.gt=d.v;render()},
  'c-addubi':d=>{const v=(UI.newU[d.ct]||'').trim();if(!v){toast('Escribí la ubicación');render();return}const c=CT(d.ct);c.ubic=c.ubic||[];if(c.ubic.some(u=>norm(u)===norm(v))){toast('Esa ubicación ya está cargada');render();return}c.ubic.push(v);UI.newU[d.ct]='';logA('Ubicación agregada al catálogo',d.ct,v,'','config');toast(`Ubicación agregada a ${d.ct}`);render()},
  'c-delubi':d=>{const c=CT(d.ct);const x=c.ubic.splice(Number(d.i),1)[0];logA('Ubicación quitada del catálogo',d.ct,x,'','config');toast(`Quitada: ${x}`);render()},
  'cu-new':()=>{const ids=S.cat.cuadrillas.map(x=>Number(String(x.id).replace(/\D/g,''))||0);const id='CU-'+String(Math.max(0,...ids)+1).padStart(2,'0');S.cat.cuadrillas.push({id,n:'Cuadrilla nueva',k:'Cuadrilla',pers:[],eqs:[]});applyCat(S.cat);S.ccu=id;logA('Cuadrilla creada',id,'','','config');toast(`${id} creada: poné nombre, contratos, personas y equipos`);render()},
  'cu-del':d=>{const x=S.cat.cuadrillas[Number(d.i)];if(S.trabajos.some(t=>t.rec===x.id))return;if(S.cat.cuadrillas.length<=1){toast('Tiene que quedar al menos una cuadrilla');render();return}
    S.cat.cuadrillas.splice(Number(d.i),1);Object.values(S.contratos).forEach(c=>{c.recs=c.recs.filter(r=>r!==x.id);if(!c.recs.length)c.recs=[S.cat.cuadrillas[0].id]});if(S.cat.opUser.rec===x.id){const o=S.cat.cuadrillas.find(y=>y.pers.length)||S.cat.cuadrillas[0];S.cat.opUser={n:o.pers[0]||'Operador de prueba',id:o.pers[0]?userOf(o.pers[0]):'operador',rec:o.id}}
    applyCat(S.cat);S.ccu=null;logA('Cuadrilla eliminada',x.id,x.n,'','config');toast(`${x.n} eliminada`);render()},
  'cu-ct':d=>{const x=S.cat.cuadrillas[Number(d.i)],c=CT(d.ct),on=!c.recs.includes(x.id);if(!on&&c.recs.length<=1){toast(`El contrato ${d.ct} necesita al menos una cuadrilla`);render();return}
    c.recs=on?[...c.recs,x.id]:c.recs.filter(r=>r!==x.id);logA(on?'Cuadrilla habilitada en contrato':'Cuadrilla quitada de contrato',x.id,d.ct,'','config');render()},
  'cu-padd':d=>cuAdd(Number(d.i),'pers',d.n),
  'cu-eadd':d=>cuAdd(Number(d.i),'eqs',d.n),
  'cu-pdel':d=>{const x=S.cat.cuadrillas[Number(d.i)];x.pers=x.pers.filter(n=>n!==d.n);applyCat(S.cat);logA('Persona quitada de cuadrilla',x.id,d.n,'','config');render()},
  'cu-edel':d=>{const x=S.cat.cuadrillas[Number(d.i)];x.eqs=x.eqs.filter(n=>n!==d.n);applyCat(S.cat);logA('Equipo quitado de cuadrilla',x.id,d.n,'','config');render()},
  'tpl-dl':async()=>{try{await loadLib('xlsx')}catch(e){toast('No se pudo cargar el generador de Excel: '+e.message);render();return}logA('Plantilla de datos maestros descargada','','','','export');saveBlob(templateBlob(),`VDS_datos_maestros_${TODAY}.xlsx`,'Plantilla descargada con los datos actuales')},
  regen:()=>askWhy('Regenerar la planificación de ejemplo','Se reemplazan los trabajos y partes por una planificación de ejemplo nueva sobre los datos actuales. Los catálogos, habilitaciones, permisos y el registro se conservan.','Regenerar',m=>{if(S.cat.src==='demo'){const keep={log:S.log,adm:S.adm,user:S.user};S=fresh();Object.assign(S,keep,{route:'a-conf',ctab:'datos'})}else{regenExamples();S.ctab='datos'}logA('Planificación de ejemplo regenerada','','',m,'config');toast('Planificación de ejemplo regenerada')}),
  'cat-demo':()=>askWhy('Volver a los datos de ejemplo','Se reemplazan los catálogos y la planificación por los datos de ejemplo. El registro de actividad y los permisos se conservan.','Volver a los de ejemplo',m=>{const log=S.log,adm=S.adm,user=S.user;S=fresh();Object.assign(S,{log,adm,user,route:'a-conf'});logA('Datos de ejemplo restaurados','','',m,'config');toast('Se restauraron los datos de ejemplo')}),
  'imp-apply':()=>{const f=UI.modal.f;if(!(f.mot||'').trim()){UI.modal.err='Contá por qué se importan estos datos.';render();return}const r=UI.imp;
    S.cat=r.cat;S.contratos=r.contratos;S.hab=r.hab;applyCat(S.cat);CTS=S.contratos;const s=exampleSeed();Object.assign(S,baseState(),{user:S.user,route:'a-conf',ctab:'datos',trabajos:s.T,partes:s.P});
    logA('Datos maestros importados',r.cat.file,`${Object.keys(r.contratos).length} contratos · ${r.cat.cuadrillas.length} cuadrillas · ${r.cat.personal.length} personas · ${Object.keys(r.cat.equipos).length} equipos`,f.mot.trim(),'config');
    UI.imp=null;UI.modal=null;UI.drawer=null;toast('Datos importados. Se generó una planificación de ejemplo para probar los flujos.');render()},
  'd-clrdate':()=>{S.dfrom='';S.dto='';render()},
  'xls-dash':()=>exportDash(),
  'xls-log':()=>exportLog(),
  'why-cancel':()=>{UI.modal=UI.whyBack||null;UI.whyFn=null;UI.whyBack=null;render()},
  'c-addtask':d=>{const n=UI.newT[d.ct];if(!n||!n.d.trim()){toast('Escribí el nombre de la tarea');render();return}const c=CT(d.ct);if(c.tareas.some(x=>norm(x[0])===norm(n.d))){toast('Esa tarea ya está en el catálogo');render();return}c.tareas.push([n.d.trim(),n.u,'']);logA('Tarea agregada al catálogo',d.ct,`${n.d.trim()} (${n.u})`,'','config');toast(`Tarea agregada a ${d.ct}`);UI.newT[d.ct]={d:'',u:n.u};render()},
  'c-deltask':d=>{const c=CT(d.ct);const x=c.tareas.splice(Number(d.i),1)[0];logA('Tarea quitada del catálogo',d.ct,`${x[0]} (${x[1]})`,'','config');toast(`Quitada: ${x[0]}`);render()},
  'c-addimp':d=>{const n=UI.newI[d.ct];const cd=(n&&n.c||'').trim().toUpperCase().replace(/\s+/g,'-');if(!cd){toast('Escribí el código de la imputación');render();return}const c=CT(d.ct);if(c.imps.some(x=>x[0].toUpperCase()===cd)){toast('Esa imputación ya existe');render();return}c.imps.push([cd,(n.n||'').trim(),'']);logA('Imputación agregada',d.ct,[cd,(n.n||'').trim()].filter(Boolean).join(' · '),'','config');UI.newI[d.ct]={c:'',n:''};toast(`Imputación ${cd} agregada a ${d.ct}`);render()},
  'c-delimp':d=>{const c=CT(d.ct);const x=c.imps[Number(d.i)];if(S.trabajos.some(t=>t.ct===d.ct&&t.imp===x[0])){toast(`${x[0]} está en uso por trabajos: no se puede quitar`);render();return}if(c.imps.length<=1){toast('El contrato necesita al menos una imputación');render();return}c.imps.splice(Number(d.i),1);logA('Imputación quitada',d.ct,[x[0],x[1]].filter(Boolean).join(' · '),'','config');toast(`Quitada: ${x[0]}`);render()},
  'sent-ok':()=>{UI.modal=null;S.route='o-day';render()},
  'o-start':d=>{const t=trab(d.pl);const h0=t.hist[0]||{t:nowT(),who:APROB};const p=Object.assign(snap(t,TODAY),{id:nextPD(),estado:'curso',dec:null,cert:null,ext:null,cierreObs:'',hist:[{t:h0.t,who:h0.who,a:'Planificado',c:''},{t:nowT(),who:USERS.operador.n,a:'Parte iniciado',c:''}]});
    p.fin=p.dia>=t.dias-1?'fin':'sigue';p.ejec=newEjec(p);S.partes.push(p);logA('Parte iniciado',p.id,`${t.id} · día ${p.dia+1} de ${t.dias}`,'','parte');S.sel=p.id;S.step=0;S.back='o-day';go('o-edit')},
  'o-open':d=>{S.sel=d.id;S.back='o-day';const p=byId(d.id);S.step=0;if(p.estado==='obs'){const c=errs(p)[0];if(c)S.step=STEP_OF[c[2]]}go('o-edit')},
  'o-step':d=>{S.step=Number(d.i);render()},
  'o-check':d=>{const e=cur().ejec;e.check[d.k]=!e.check[d.k];render()},
  'o-ptnow':()=>{const p=cur(),e=p.ejec;e.permiso=e.permiso||{num:'',firmo:'',hora:''};UI.ptPrev={id:p.id,v:JSON.stringify(e.permiso)};e.permiso.hora=hm5();if(!e.permiso.firmo)e.permiso.firmo=OPSUP[p.op];toast(`Permiso marcado como firmado a las ${e.permiso.hora}. Si fue sin querer, tocá Deshacer firma.`);render()},
  'o-ptundo':()=>{const p=cur(),e=p.ejec;if(UI.ptPrev&&UI.ptPrev.id===p.id)e.permiso=JSON.parse(UI.ptPrev.v);else e.permiso={num:(e.permiso||{}).num||'',firmo:'',hora:''};UI.ptPrev=null;toast('Firma del permiso deshecha');render()},
  'o-clima':()=>fetchClima(),
  'o-pres':d=>{const x=cur().ejec.personal[d.i];x.pres=!x.pres;render()},
  'o-allz':()=>{const ps=cur().ejec.personal,j=ps[0];ps.forEach(x=>{if(x!==j&&x.pres){x.base=j.base;x.zona=j.zona;x.out=j.out}});render()},
  'o-addp':d=>{const e=cur().ejec;if(!e.personal.some(x=>x.n===d.n))e.personal.push({n:d.n,rol:ROLEP[d.n]||'Operario',base:'',zona:'',out:'',pres:true,add:true});render()},
  'o-delp':d=>{cur().ejec.personal.splice(Number(d.i),1);render()},
  'o-adde':d=>{const e=cur().ejec;if(!e.equipos.some(q=>q.c===d.n))e.equipos.push({c:d.n,km:'',obs:''});render()},
  'o-dele':d=>{cur().ejec.equipos.splice(Number(d.i),1);render()},
  'o-addr':d=>{const p=cur(),r=p.ejec.reg;const lastA=r.reduce((m,x)=>mins(x.a)>mins(m)?x.a:m,r.length?r[0].a:null);const de=lastA||(d.c==='tr'?'06:45':p.ejec.llegada||'07:30');
    const it={c:d.c,de,a:addM(de,d.c==='rf'?30:60),d:d.d||'',q:'',u:d.c==='vi'?'km/h':'',det:''};if(d.d)it.u=unitOf(p.ct,d.d);r.push(it);render();
    const tb=document.querySelector('.edbody [data-keep="t"]');if(tb)tb.scrollTop=tb.scrollHeight;
    if((d.c==='op'&&!d.d)||d.c==='es'||d.c==='vi')setTimeout(()=>{const el=document.getElementById((d.c==='vi'?'f-rq':'f-rd')+(r.length-1));if(el)el.focus()},20)},
  'o-delr':d=>{cur().ejec.reg.splice(Number(d.i),1);render()},
  'o-delf':d=>{cur().ejec.fotos.splice(Number(d.i),1);render()},
  'o-sigclear':()=>{cur().ejec.firma=null;render()},
  'o-fin':d=>{const p=cur();p.fin=d.v;if(d.v==='ext'&&!p.ext)p.ext={dias:1,motivo:''};render()},
  'o-extd':d=>{const p=cur();p.ext.dias=Math.max(1,Math.min(10,p.ext.dias+Number(d.d)));render()},
  'o-send':()=>{const p=cur();if(errs(p).length)return;const re=p.estado==='obs';const t=trab(p.pl);const prev=p.dec,off=offline();p.estado='env';p.dec=null;if(off)p.cola=true;
    p.hist.push({t:nowT(),who:USERS.operador.n,a:re?'Reenviado con correcciones':'Enviado para aprobación',c:''});
    logA(re?'Parte reenviado con correcciones':'Parte enviado para aprobación',p.id,[p.fin==='fin'?'Cierra el trabajo '+t.id:p.fin==='ext'?`Pide ${p.ext.dias} día(s) más`:'',off?'Cargado sin señal':''].filter(Boolean).join(' · '),re&&prev?'Responde a la observación de '+prev.who+': '+prev.com:'','parte');
    if(p.fin==='fin'&&!t.cierre){const ant=p.dia<t.dias-1;t.cierre={fecha:p.fecha,parte:p.id,who:USERS.operador.n,t:nowT(),obs:p.cierreObs,anticipado:ant};
      if(ant){const old=t.dias;t.dias=p.dia+1;t.hist.push({t:nowT(),who:USERS.operador.n,a:`Trabajo cerrado antes de lo planificado: ${old} → ${t.dias} días`,c:p.cierreObs})}else t.hist.push({t:nowT(),who:USERS.operador.n,a:'Trabajo cerrado por el jefe de cuadrilla',c:p.cierreObs})}
    if(p.fin==='ext'&&!t.ext){t.ext={dias:p.ext.dias,motivo:p.ext.motivo,who:USERS.operador.n,t:nowT(),parte:p.id};t.hist.push({t:nowT(),who:USERS.operador.n,a:`Pidió ${p.ext.dias} día(s) más`,c:p.ext.motivo})}
    UI.modal={kind:'sent',id:p.id};render()},
  'v-filter':d=>{S.vf=d.f;S.vsel=null;UI.vcom='';UI.verr='';render()},
  'v-sel':d=>{S.vsel=d.id;UI.vcom='';UI.verr='';render()},
  'v-ok':()=>{const p=byId(S.vsel);if(errs(p).length)return;const com=UI.vcom.trim();p.estado='apr';p.dec={d:'ok',who:meN(),t:nowT(),com};p.hist.push({t:nowT(),who:meN(),a:'Aprobado',c:com});logA('Parte aprobado',p.id,com,'','parte');UI.vcom='';toast(`${p.id} aprobado · pasa a certificación de ${OPS[p.op]}`);S.vsel=null;render()},
  'v-obs':()=>{const p=byId(S.vsel);const com=UI.vcom.trim();if(!com){UI.verr='Escribí qué tiene que corregir la cuadrilla para poder devolver el parte.';render();setTimeout(()=>{const t=$('#v-com');if(t)t.focus()},20);return}
    p.estado='obs';p.dec={d:'obs',who:meN(),t:nowT(),com};p.hist.push({t:nowT(),who:meN(),a:'Devuelto con observaciones',c:com});logA('Parte devuelto a la cuadrilla',p.id,'',com,'parte');UI.vcom='';toast(`${p.id} devuelto a ${recOf(p.rec).n}`);S.vsel=null;render()},
  'c-filter':d=>{S.cf=d.f;S.csel=null;UI.vcom='';UI.verr='';UI.csig=null;render()},
  'c-sel':d=>{S.csel=d.id;UI.vcom='';UI.verr='';UI.csig=null;render()},
  'c-sigclear':()=>{UI.csig=null;render()},
  'c-ok':()=>{const p=byId(S.csel);if(!UI.csig){UI.verr='Firmá en el recuadro para certificar el parte.';render();return}const com=UI.vcom.trim();const who=whoCli(p);p.estado='cert';p.cert={d:'ok',who,t:nowT(),com,firma:UI.csig};p.hist.push({t:nowT(),who,a:'Certificado y firmado',c:com});logA('Parte certificado y firmado',p.id,com,'','parte');UI.vcom='';UI.csig=null;toast(`${p.id} certificado y firmado`);S.csel=null;render()},
  'c-obs':()=>{const p=byId(S.csel);const com=UI.vcom.trim();if(!com){UI.verr='Escribí el motivo de la observación para que VDS pueda corregir el parte.';render();setTimeout(()=>{const t=$('#v-com');if(t)t.focus()},20);return}
    const who=whoCli(p);p.estado='obs';p.dec={d:'obs',who,t:nowT(),com};p.hist.push({t:nowT(),who,a:'Observado por el cliente',c:com});logA('Parte observado por el cliente',p.id,'',com,'parte');UI.vcom='';UI.csig=null;toast(`${p.id} observado · vuelve a VDS`);S.csel=null;render()}
};
/* Asignar persona o equipo a una cuadrilla (si estaba en otra, se mueve) */
function cuAdd(i,key,v){const x=S.cat.cuadrillas[i];if(!x||!v||x[key].includes(v))return;
  const other=S.cat.cuadrillas.find(y=>y!==x&&y[key].includes(v));if(other)other[key]=other[key].filter(n=>n!==v);
  x[key].push(v);applyCat(S.cat);logA(key==='pers'?'Persona asignada a cuadrilla':'Equipo asignado a cuadrilla',x.id,v+(other?` (antes en ${other.n})`:''),'','config');if(other)toast(`${v} pasó de ${other.n} a ${x.n}`);render()}
function submitTrab(){
  const M=UI.modal,f=M.f;M.err={};
  if(!f.pozo.trim())M.err.pozo='Indicá el pozo, la locación o la instalación.';
  if(!f.prev.length)M.err.prev='Elegí al menos una tarea prevista.';
  if(!f.pers.length)M.err.pers='Asigná al menos una persona.';
  if(M.edit&&!(f.mot||'').trim())M.err.mot='Contá por qué se modifica el trabajo.';
  if(M.err.pozo||M.err.prev||M.err.pers||M.err.mot){render();return}
  const cU=CT(f.ct);cU.ubic=cU.ubic||[];const fu=cU.ubic.find(u=>norm(u)===norm(f.pozo));
  if(fu)f.pozo=fu;else{cU.ubic.push(f.pozo.trim());logA('Ubicación agregada al catálogo',f.ct,f.pozo.trim(),'','config')}
  const ccx=(cU.ccs||[[cU.cc,cU.ccn]])[Number(f.ccsel)||0]||[cU.cc,cU.ccn];
  const vals={ct:f.ct,imp:f.imp,cc:ccx[0],ccn:ccx[1],rec:f.rec,yac:'',pozo:f.pozo.trim(),inicio:f.inicio,dias:f.dias,prio:f.prio,ptw:f.ptw,sup:f.sup,rt:f.rt,prev:f.prev.slice(),ind:f.ind.trim(),pers:f.pers.slice(),eqs:f.eqs.slice()};
  if(M.edit){const t=trab(M.edit);const ch=[];
    [['ct','contrato'],['imp','imputación'],['cc','centro de costo'],['rec','recurso'],['pozo','ubicación'],['inicio','inicio'],['dias','duración'],['prio','prioridad'],['ptw','permiso'],['sup','supervisor'],['rt','responsable técnico'],['ind','indicaciones']].forEach(([k,l])=>{const before=k==='cc'?(t.cc||CT(t.ct).cc):k==='pozo'?locOf(t):t[k];if(String(before)!==String(vals[k]))ch.push(l)});
    if(t.prev.join('|')!==vals.prev.join('|'))ch.push('tareas');if(t.pers.join('|')!==vals.pers.join('|'))ch.push('personas');if(t.eqs.join('|')!==vals.eqs.join('|'))ch.push('equipos');
    Object.assign(t,vals);
    t.hist.push({t:nowT(),who:meN(),a:'Editado: '+(ch.join(', ')||'sin cambios'),c:f.mot.trim()});logA('Trabajo editado',t.id,'Cambió: '+(ch.join(', ')||'sin cambios'),f.mot.trim(),'trabajo');UI.modal=null;UI.drawer=t.id;toast(`${t.id} actualizado`);render();return}
  const n=Math.max(0,...S.trabajos.map(t=>Number(t.id.slice(3))||0))+1;
  const id='PL-'+String(n).padStart(3,'0');
  const t=Object.assign({id,cierre:null,ext:null,hist:[{t:nowT(),who:meN(),a:'Planificado',c:''}]},vals);
  S.trabajos.push(t);UI.modal=null;logA('Trabajo planificado',id,`${recOf(f.rec).n} · ${f.pozo.trim()} · ${fDay(f.inicio)} → ${fDay(tEnd(t))} · ${f.imp}`,'','trabajo');
  const cl=clashes(t);toast(`${id} planificado · ${recOf(f.rec).n}, ${fDay(f.inicio)} → ${fDay(tEnd(t))}${cl.length?' · se superpone con '+cl.map(x=>x.id).join(', '):''}`);render();
}
function submitHab(){const f=UI.modal.f;const k=f.s+'|'+f.op;
  if(!f.sin&&!f.vence){f.err='Elegí la fecha de vencimiento.';render();return}
  if(!(f.mot||'').trim()){f.err='Contá por qué cambia la habilitación.';render();return}
  const before=S.hab[k]?'vence '+fS(S.hab[k].vence):'sin habilitación';
  if(f.sin)delete S.hab[k];else S.hab[k]={vence:f.vence};
  const after=f.sin?'sin habilitación':'vence '+fS(f.vence);
  logA('Habilitación modificada',f.s,`${OPS[f.op]}: ${before} → ${after}`,f.mot.trim(),'config');
  UI.modal=null;toast(`Habilitación de ${f.s} para ${OPS[f.op]} actualizada`);render()}
function onFiles(inp){
  const e=cur().ejec;const files=[...inp.files].slice(0,8);let pending=files.length;
  files.forEach(file=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    e.fotos.push({src:c.toDataURL('image/jpeg',.75),cap:file.name.replace(/\.[^.]+$/,'')});if(--pending===0)render()};im.onerror=()=>{if(--pending===0)render()};im.src=r.result};r.readAsDataURL(file)});
}
async function onImport(inp){const file=inp.files&&inp.files[0];if(!file)return;
  try{let res;if(/\.json$/i.test(file.name))res=fromJson(JSON.parse(await file.text()),file.name);
    else{await loadLib('xlsx');res=fromXlsx(XLSX.read(await file.arrayBuffer(),{cellDates:true}),file.name)}
    UI.imp=res;UI.modal={kind:'imp',f:{mot:''},err:''};render()}
  catch(e){toast('No se pudo leer el archivo: '+(e&&e.message?e.message:'formato no reconocido'));render()}}

/* Clima actual desde Open-Meteo (sin clave). Usa la ubicación de la tablet si la da; si no, la base. */
const WMO=c=>c===0?'Despejado':c<=2?'Nublado parcial':c===3||c===45||c===48?'Nublado':(c>=71&&c<=77)||c===85||c===86?'Nieve':(c>=51&&c<=67)||(c>=80&&c<=82)||c>=95?'Lluvia':'Nublado';
async function fetchClima(){
  const pid=S.sel;
  if(offline()){toast('Sin señal: cargá el clima a mano');render();return}
  UI.clima=true;render();
  const pos=await new Promise(res=>{if(!navigator.geolocation)return res(null);navigator.geolocation.getCurrentPosition(p=>res(p.coords),()=>res(null),{timeout:6000,maximumAge:1800000})});
  const lat=pos?pos.latitude:BASE_GEO.lat,lon=pos?pos.longitude:BASE_GEO.lon;
  try{
    const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),9000);
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code&wind_speed_unit=kmh&timezone=auto`,{signal:ctl.signal});
    clearTimeout(to);if(!r.ok)throw new Error('HTTP '+r.status);
    const c=(await r.json()).current,p=byId(pid);if(!p||!p.ejec)throw new Error('parte');
    const g=Math.round(c.wind_gusts_10m),v=Math.round(c.wind_speed_10m);let cond=WMO(c.weather_code);if(g>=50&&['Despejado','Nublado parcial','Nublado'].includes(cond))cond='Ventoso';
    p.ejec.clima={t:String(Math.round(c.temperature_2m)),v:String(v),r:String(g),dir:DIRS[Math.round((((c.wind_direction_10m%360)+360)%360)/45)%8],cond,src:'app',fuente:'Open-Meteo · '+(pos?'ubicación de la tablet':BASE_GEO.n),at:hm()};
    toast(`Clima actualizado: ${p.ejec.clima.t} °C, ráfagas de ${g} km/h`);
  }catch(e){toast('No se pudo obtener el clima: cargalo a mano')}
  UI.clima=false;render();
}
