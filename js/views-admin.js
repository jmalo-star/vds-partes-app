/* ---------- configuración (admin) y registro de actividad ---------- */
const idk=k=>String(k).replace(/[^A-Za-z0-9-]/g,'_');
const wlist=W=>`<div class="wlist">${W.map(([l,m])=>`<div class="${l}">${ic(l==='warn'?'alert':'okc')}<span>${esc(m)}</span></div>`).join('')}</div>`;
function vConf(){
  const T=S.ctab||'datos',cat=S.cat;
  const tabs=tabsH('ctab',T,[['datos','Datos maestros','list'],['ct','Contratos','doc',Object.keys(S.contratos).length],['cu','Cuadrillas','users',cat.cuadrillas.length],['us','Usuarios y permisos','badge']]);
  return tabs+(T==='ct'?confCt():T==='cu'?confCu():T==='us'?confUs():confDatos());
}
function confDatos(){
  const cat=S.cat,src=cat.src==='demo'?'Datos de ejemplo':`Importados de "${esc(cat.file)}" el ${fDay(cat.at)} por ${esc(cat.by)}`;
  return `<div class="cols fill" style="grid-template-columns:minmax(0,1fr) minmax(0,1.15fr)">
    <div class="pnl col"><h3>${ic('list')}Datos maestros<span class="sp"></span><span class="tag">${cat.src==='demo'?'Ejemplo':'Importados'}</span></h3><p class="sm" style="margin:-4px 0 12px">${src}. Quedan guardados solo en este dispositivo.</p>
      <div class="mdat">${catCounts(cat,S.contratos,S.hab).map(([l,n])=>`<div class="stat"><b${l==='Tareas sin unidad'&&n?' class="warn"':''}>${n}</b><span>${l}</span></div>`).join('')}</div>
      <div class="acts-v"><label class="btn pri">${ic('plus')}Importar archivo (.xlsx o .json)<input type="file" id="f-import" accept=".xlsx,.xls,.json" class="hidin"></label><button class="btn" data-a="tpl-dl">${ic('xls')}Descargar plantilla Excel con los datos actuales</button><button class="btn" data-a="regen">${ic('refresh')}Regenerar planificación de ejemplo</button>${cat.src!=='demo'?`<button class="btn ghost" data-a="cat-demo">Volver a los datos de ejemplo</button>`:''}</div></div>
    <div class="pnl col"><h3>Pendientes de la última importación<span class="sp"></span><span class="sm">${(cat.warns||[]).length}</span></h3><div class="body">${cat.warns&&cat.warns.length?wlist(cat.warns):'<div class="empty">Sin pendientes.</div>'}</div></div>
  </div>`;
}
function confCt(){
  const ks=ctKeys();if(!ks.includes(S.cct))S.cct=ks[0];const k=S.cct,c=CT(k);
  const g={};ks.forEach(x=>{const o=CT(x).op;(g[o]=g[o]||[]).push(x)});
  const list=Object.entries(g).map(([o,l])=>`<div class="cg">${esc(OPS[o]||o)}</div>${l.map(x=>`<button class="crow" data-a="tab" data-k="cct" data-v="${esc(x)}"${x===k?' aria-current="true"':''}><b class="mono">${esc(x)}</b><small>${esc(CT(x).n)}</small></button>`).join('')}`).join('');
  if(!c)return `<div class="empty">No hay contratos cargados.</div>`;
  UI.newT[k]=UI.newT[k]||{d:'',u:'m³'};UI.newI[k]=UI.newI[k]||{c:'',n:''};UI.newU[k]=UI.newU[k]||'';const n=UI.newT[k],ni=UI.newI[k],ik=idk(k);
  const cats=[...new Set((c.eqs||[]).map(e=>EQ[e]).filter(Boolean))];
  return `<div class="cols fill" style="grid-template-columns:290px minmax(0,1fr)">
    <div class="pnl col"><h3>Contratos<span class="sp"></span><span class="sm">${ks.length}</span></h3><div class="body clist" data-keep="cl">${list}</div></div>
    <div class="ctd">
      <div class="pnl"><h3><span class="mono">${esc(k)}</span> ${esc(c.n)}<span class="sp"></span><span class="tag">${esc(OPS[c.op])}</span></h3>
        <dl class="kv kvw"><dt>Centro${(c.ccs||[]).length>1?'s':''} de costo</dt><dd>${(c.ccs||[[c.cc,c.ccn]]).map(x=>`<span class="tag">${esc(x[0])} · ${esc(x[1])}</span>`).join(' ')}</dd><dt>Cuadrillas</dt><dd>${c.recs.map(r=>esc(recOf(r).n)).join(', ')||'—'}</dd><dt>Equipos</dt><dd>${(c.eqs||[]).map(e=>`<span class="mono">${esc(e)}</span> ${esc(EQ[e]||'')}${invTag((S.cat.eqInv||[]).includes(e))}`).join(' · ')||'—'}</dd></dl></div>
      <div class="cols" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
        <div class="pnl col"><h3>Imputaciones de cuenta del cliente<span class="sp"></span><span class="sm">${c.imps.length}</span></h3><div class="body"><div class="rlist one">${c.imps.map(([cd,nm,iv],i)=>`<div><span class="nm"><b class="mono">${esc(cd)}${invTag(iv)}</b>${nm?`<small>${esc(nm)}</small>`:''}</span><span class="sm">${S.trabajos.filter(t=>t.ct===k&&t.imp===cd).length} trabajos</span><button class="ibtn xs del" data-a="c-delimp" data-ct="${esc(k)}" data-i="${i}" aria-label="Quitar ${esc(cd)}">${ic('x')}</button></div>`).join('')}</div></div>
          <div class="addrow"><input class="inp" id="ni-${ik}" data-bind="i:${k}.c" value="${esc(ni.c)}" placeholder="Código" aria-label="Código de imputación"><input class="inp" id="nn-${ik}" data-bind="i:${k}.n" value="${esc(ni.n)}" placeholder="Descripción" aria-label="Descripción de la imputación"><button class="btn sm2" data-a="c-addimp" data-ct="${esc(k)}">${ic('plus')}Agregar</button></div></div>
        <div class="pnl col"><h3>Ubicaciones<span class="sp"></span><span class="sm">${(c.ubic||[]).length}</span></h3><div class="body"><div class="chips">${(c.ubic||[]).map((u,i)=>`<span class="chip sm3">${esc(u)}<button class="ibtn xs" data-a="c-delubi" data-ct="${esc(k)}" data-i="${i}" aria-label="Quitar ${esc(u)}">${ic('x')}</button></span>`).join('')||'<span class="sm">Sin ubicaciones</span>'}</div></div>
          <div class="addrow"><input class="inp" id="nub-${ik}" data-bind="w:${k}" value="${esc(UI.newU[k])}" placeholder="Nueva ubicación, ej. BAT 84" aria-label="Nueva ubicación"><button class="btn sm2" data-a="c-addubi" data-ct="${esc(k)}">${ic('plus')}Agregar</button></div></div>
      </div>
      <div class="pnl col"><h3>Catálogo de tareas<span class="sp"></span><span class="sm">${c.tareas.length}</span></h3><div class="body"><table class="tbl sticky ttbl"><thead><tr><th>Tarea</th><th>Unidad</th><th>Categoría de equipo</th><th></th></tr></thead><tbody>${c.tareas.map((t,i)=>`<tr><td>${esc(t[0])}${invTag(t[3])}</td><td class="w130"><select class="inp${t[1]?'':' soft'}" id="tu-${ik}-${i}" data-bind="k:${k}.tareas.${i}.1" data-rr aria-label="Unidad de ${esc(t[0])}"><option value="">Sin unidad</option>${UNITS.map(u=>`<option${t[1]===u?' selected':''}>${u}</option>`).join('')}</select></td><td class="w230"><select class="inp" id="tc-${ik}-${i}" data-bind="k:${k}.tareas.${i}.2" data-rr aria-label="Categoría de equipo de ${esc(t[0])}"><option value="">Cualquier equipo</option>${[...new Set([...cats,t[2]].filter(Boolean))].map(x=>`<option${t[2]===x?' selected':''}>${esc(x)}</option>`).join('')}</select></td><td class="w44"><button class="ibtn xs del" data-a="c-deltask" data-ct="${esc(k)}" data-i="${i}" aria-label="Quitar ${esc(t[0])}">${ic('x')}</button></td></tr>`).join('')}</tbody></table></div>
        <div class="addrow"><input class="inp" id="nt-${ik}" data-bind="n:${k}.d" value="${esc(n.d)}" placeholder="Nueva tarea" aria-label="Nueva tarea"><select class="inp w120" id="nu-${ik}" data-bind="n:${k}.u" aria-label="Unidad">${UNITS.map(u=>`<option${n.u===u?' selected':''}>${u}</option>`).join('')}</select><button class="btn sm2" data-a="c-addtask" data-ct="${esc(k)}">${ic('plus')}Agregar tarea</button></div></div>
    </div></div>`;
}
function confCu(){
  const cat=S.cat,L=cat.cuadrillas;if(!L.some(x=>x.id===S.ccu))S.ccu=L[0]&&L[0].id;
  const i=L.findIndex(x=>x.id===S.ccu),x=L[i];
  const list=L.map(y=>`<button class="crow" data-a="tab" data-k="ccu" data-v="${esc(y.id)}"${y.id===S.ccu?' aria-current="true"':''}><b>${esc(y.n)}${invTag(y.inv)}</b><small><span class="mono">${esc(y.id)}</span> · ${y.pers.length} personas · ${y.eqs.length} equipos</small></button>`).join('');
  if(!x)return `<div class="empty">No hay cuadrillas.</div>`;
  const used=S.trabajos.some(t=>t.rec===x.id);
  const pIt=n=>{const h=homeOf(n);return {v:n,t:n,s:(ROLEP[n]||'')+(h!=='Base · disponible'?' · está en '+h:' · disponible')}};
  const eIt=c=>{const h=eqHome(c);return {v:c,t:c+' · '+EQ[c],th:`<span class="mono">${esc(c)}</span> ${esc(EQ[c])}`,s:h!=='Base · disponible'?'Está en '+h:'Disponible'}};
  const freeP=ALLP.filter(n=>!x.pers.includes(n)),freeE=Object.keys(EQ).filter(c=>!x.eqs.includes(c));
  const ceq=new Set(ctKeys().filter(k=>CT(k).recs.includes(x.id)).flatMap(k=>CT(k).eqs||[]));
  return `<div class="cols fill" style="grid-template-columns:290px minmax(0,1fr)">
    <div class="pnl col"><h3>Cuadrillas<span class="sp"></span><button class="btn sm2" data-a="cu-new">${ic('plus')}Nueva</button></h3><div class="body clist" data-keep="cl">${list}</div></div>
    <div class="pnl col cuc"><div class="row"><input class="inp nmw" id="cun-${i}" data-bind="q:${i}.n" data-rr value="${esc(x.n)}" aria-label="Nombre de la cuadrilla"><span class="mono sm">${esc(x.id)}</span><span class="sp"></span>${used?`<span class="sm">${S.trabajos.filter(t=>t.rec===x.id).length} trabajos planificados</span>`:`<button class="btn ghost sm2" data-a="cu-del" data-i="${i}">${ic('trash')}Eliminar</button>`}</div>
      <p class="sm" style="margin:0">Cada cuadrilla es una fila del Gantt. Sus personas y equipos se proponen al planificar, y en cada trabajo se pueden cambiar.</p>
      <div><div class="lab">Contratos en los que trabaja</div><div class="chips">${ctKeys().map(k=>`<button class="chip sm3" data-a="cu-ct" data-i="${i}" data-ct="${esc(k)}" aria-pressed="${CT(k).recs.includes(x.id)}">${CT(k).recs.includes(x.id)?ic('check'):''}${esc(k)} <span class="n">${esc(CT(k).n)}</span></button>`).join('')}</div></div>
      <div class="cols fill" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
        <div class="rbox col"><div class="hh">${ic('users')}Personas · ${x.pers.length}</div><div class="rlist body">${x.pers.map(n=>`<div><span class="nm"><b>${esc(n)}${invTag((cat.personal.find(p=>p.n===n)||{}).inv)}</b><small>${esc(ROLEP[n]||'')}</small></span><button class="ibtn xs del" data-a="cu-pdel" data-i="${i}" data-n="${esc(n)}" aria-label="Quitar ${esc(n)}">${ic('x')}</button></div>`).join('')||'<div class="sm warn">Sin personal</div>'}</div><div class="addz">${cbx('cu-p'+i,'Agregar persona: escribí el nombre',[[null,freeP.map(pIt)]],'cu-padd',` data-i="${i}"`)}</div></div>
        <div class="rbox col"><div class="hh">${ic('truck')}Equipos · ${x.eqs.length}</div><div class="rlist body">${x.eqs.map(c=>`<div><span class="nm"><b><span class="mono">${esc(c)}</span> ${esc(EQ[c]||'')}${invTag((cat.eqInv||[]).includes(c))}</b></span><button class="ibtn xs del" data-a="cu-edel" data-i="${i}" data-n="${esc(c)}" aria-label="Quitar ${esc(c)}">${ic('x')}</button></div>`).join('')||'<div class="sm">Sin equipos</div>'}</div><div class="addz">${cbx('cu-e'+i,'Agregar equipo: escribí el interno o el tipo',[['De sus contratos',freeE.filter(c=>ceq.has(c)).map(eIt)],['Otros equipos',freeE.filter(c=>!ceq.has(c)).map(eIt)]],'cu-eadd',` data-i="${i}"`)}</div></div>
      </div></div></div>`;
}
function confUs(){
  return `<div class="pnl tblp fill"><div class="body"><table class="tbl sticky"><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Permisos de administración</th></tr></thead><tbody>${Object.entries(USERS).map(([k,u])=>`<tr><td><b>${esc(u.n)}</b><div class="sm">${esc(u.cargo)}</div></td><td class="mono">${esc(u.id)}</td><td>${ROLE_N[u.rol]}</td><td>${u.rol==='admin'?'<span class="sm">Siempre</span>':u.rol==='planner'?`<div class="trow"><button class="sw" role="switch" aria-checked="${!!S.adm[k]}" aria-label="Permisos de administración para ${esc(u.n)}" data-a="a-perm" data-k="${k}"${k===S.user?' disabled title="No podés cambiar tus propios permisos"':''}><span></span></button><span class="sm">${S.adm[k]?'Corrige partes, edita habilitaciones y catálogos, ve el registro':'Solo planificación y aprobación'}</span></div>`:'<span class="sm">No aplica</span>'}</td></tr>`).join('')}</tbody></table></div></div>
  <p class="sm foot">Los planners con permisos de administración pueden corregir partes, cambiar estados, editar habilitaciones y catálogos, y ver el registro de actividad. Cada cambio pide un motivo y queda registrado. En producción los usuarios se gestionan desde el directorio de la empresa.</p>`;
}

/* ---------- registro de actividad ---------- */
const LTYPE={all:'Todo',ingreso:'Ingresos',parte:'Partes',trabajo:'Trabajos',config:'Configuración',export:'Exportaciones'};
const fdt=ts=>{const d=ts.slice(0,10);return (d===TODAY?'hoy':fDay(d))+' · '+ts.slice(11,16)};
function logRows(){return S.log.map((x,i)=>[x,i]).filter(([x])=>(S.gt==='all'||x.tipo===S.gt)&&(S.gu==='all'||x.who===S.gu)&&(!S.gq||norm([x.accion,x.obj,x.det,x.mot,x.who].join(' ')).includes(norm(S.gq)))).sort((a,b)=>b[0].ts.localeCompare(a[0].ts)||b[1]-a[1]).map(([x])=>x)}
function vLog(){
  const who=[...new Set(S.log.map(x=>x.who))].sort((a,b)=>a.localeCompare(b));
  const rows=logRows(),nm=rows.filter(x=>x.mot).length;
  return `<div class="bar"><div class="seg">${Object.entries(LTYPE).map(([k,l])=>`<button data-a="g-type" data-v="${k}" aria-pressed="${S.gt===k}">${l}</button>`).join('')}</div>${selF('g-u','s:gu',[['all','Todos los usuarios'],...who.map(n=>[n,n])],S.gu,' aria-label="Usuario"')}<div class="srch">${ic('search')}<input class="inp" type="search" id="g-q" data-bind="s:gq" data-rr value="${esc(S.gq)}" placeholder="Parte, trabajo, acción o motivo" aria-label="Buscar"></div><span class="sp"></span><button class="btn sm2" data-a="xls-log"${rows.length?'':' disabled'}>${ic('xls')}Exportar a Excel</button></div>
  <div class="pnl tblp fill"><div class="body" data-keep="v"><table class="tbl sticky logtbl"><thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Tipo</th><th>Acción</th><th>Sobre</th><th>Detalle y motivo</th></tr></thead><tbody>${rows.slice(0,300).map(x=>{const lk=/^PD-/.test(x.obj)&&byId(x.obj)?'sum':/^PL-/.test(x.obj)&&trab(x.obj)?'t-open':'';return `<tr${lk?` class="click" data-a="${lk}" data-id="${esc(x.obj)}"`:''}><td class="nw">${fdt(x.ts)}</td><td><b>${esc(x.who)}</b><div class="sm">${esc(x.rol)}</div></td><td><span class="ltype lt-${x.tipo}">${LTYPE[x.tipo]||x.tipo}</span></td><td>${esc(x.accion)}</td><td class="mono nw">${esc(x.obj)}</td><td>${x.det?esc(x.det):''}${x.mot?`<div class="mot">Motivo: ${esc(x.mot)}</div>`:''}</td></tr>`}).join('')||'<tr><td colspan="6"><div class="empty">No hay registros con estos filtros.</div></td></tr>'}</tbody></table></div></div>
  <p class="sm foot">${rows.length} registros, ${nm} con motivo${rows.length>300?' · se muestran los 300 más recientes, el Excel trae todos':''}. El registro no se puede editar ni borrar desde la app.</p>`;
}
