/* ---------- planificación: Gantt, por recurso, mes, partes y habilitaciones ---------- */
function periodDays(){
  if(S.pv==='gantt')return Array.from({length:28},(_,i)=>addDays(S.gs,i));
  if(S.pv==='rec')return Array.from({length:7},(_,i)=>addDays(S.ws,i));
  const[y,m]=S.ms.split('-').map(Number);const n=new Date(y,m,0).getDate();return Array.from({length:n},(_,i)=>`${S.ms}-${String(i+1).padStart(2,'0')}`);
}
function periodLabel(){
  if(S.pv==='gantt'){const e=addDays(S.gs,27);return `${d8(S.gs).getDate()} ${MES[d8(S.gs).getMonth()]} – ${d8(e).getDate()} ${MES[d8(e).getMonth()]}`}
  if(S.pv==='rec'){const e=addDays(S.ws,6);return `Semana ${d8(S.ws).getDate()} – ${d8(e).getDate()} ${MES[d8(e).getMonth()]}`}
  const[y,m]=S.ms.split('-').map(Number);return MESL[m-1][0].toUpperCase()+MESL[m-1].slice(1)+' '+y;
}
function vPlan(){
  const L=fT(),days=periodDays(),oa=occAll(days,L);
  const ps=S.partes.filter(p=>(S.fop==='all'||p.op===S.fop)&&(S.fct==='all'||p.ct===S.fct));
  const filt=S.fop!=='all'||S.fct!=='all',rq=L.filter(t=>t.ext);
  const reqs=rq.length?`<div class="popw"><button class="btn sm2 warnb" data-a="reqs" aria-expanded="${!!UI.reqs}">${ic('flag')}Pedidos de más días<span class="cnt">${rq.length}</span></button>${UI.reqs?`<div class="popp" role="dialog" aria-label="Pedidos de los jefes de cuadrilla"><div class="poph"><b>Pedidos de los jefes de cuadrilla</b><button class="ibtn xs" data-a="reqs" aria-label="Cerrar">${ic('x')}</button></div>${rq.map(t=>{const sim=Object.assign({},t,{dias:t.dias+t.ext.dias});const cl=clashes(sim);
    return `<div class="req"><div class="txt"><span class="mono">${t.id}</span> · <b>${esc(t.ext.who)}</b> pide <b>${t.ext.dias} día${t.ext.dias>1?'s':''} más</b> para ${esc(recOf(t.rec).n)} en ${esc(t.pozo)} · hasta ${fDay(addDays(tEnd(t),t.ext.dias))}${cl.length?` <span class="errc">· se superpone con ${cl.map(x=>x.id).join(', ')}</span>`:''}<q>${esc(t.ext.motivo)}</q></div><div class="acts"><button class="btn sm2" data-a="x-no" data-id="${t.id}">Rechazar</button><button class="btn pri sm2" data-a="x-ok" data-id="${t.id}">Aprobar</button></div></div>`}).join('')}</div>`:''}</div>`:'';
  let h=`<div class="bar">${selF('f-op','s:fop',opOpts(),S.fop,' aria-label="Cliente"')}${ctSel('f-ct','s:fct',S.fop,S.fct,'Todos los contratos','','Contrato')}${filt?`<span class="factive">${ic('filter')}${L.length} trabajos<button class="ibtn xs" data-a="f-clear" aria-label="Quitar filtro">${ic('x')}</button></span>`:''}<span class="sp"></span>${reqs}
    <div class="seg" role="group" aria-label="Vista">${[['gantt','Gantt','gantt'],['rec','Por recurso','rows'],['mes','Mes','cal']].map(([k2,l,i])=>`<button data-a="p-view" data-v="${k2}" aria-pressed="${S.pv===k2}">${ic(i)}${l}</button>`).join('')}</div></div>`;
  h+=`<div class="bar"><div class="pnav"><button class="ibtn" data-a="p-nav" data-d="-1" aria-label="Período anterior">${ic('chl')}</button><b>${periodLabel()}</b><button class="ibtn" data-a="p-nav" data-d="1" aria-label="Período siguiente">${ic('chr')}</button></div><button class="btn sm2" data-a="p-nav" data-d="0">Hoy</button>
    <div class="kchips">${kchip(oa+'%','ocupación',occC(oa))}${kchip(ps.filter(p=>p.estado==='curso').length,'en curso','var(--st-curso)')}${kchip(ps.filter(p=>p.estado==='env').length,'para aprobar','var(--st-env)')}${kchip(ps.filter(p=>p.estado==='apr').length,'para certificar','var(--st-apr)')}${kchip(ps.filter(p=>p.estado==='obs').length,'observados','var(--st-obs)')}</div>
    <span class="sp"></span><span class="sm hint">${S.pv==='gantt'?'Arrastrá una barra para moverla o su borde para estirarla':'Tocá + para planificar en ese día'}</span></div>`;
  h+=S.pv==='gantt'?vGantt(L):S.pv==='rec'?vWeek(L):vMonth(L);
  h+=`<div class="legend">${['plan','curso','env','obs','apr','cert'].map(e=>pill(e)).join('')}<span class="sp"></span><span>Prioridad</span>${Object.entries(PRIO).map(([k2,l])=>`<span class="lg"><span class="gpr" style="--pc:${PRIO_C[k2]}"></span>${l}</span>`).join('')}</div>`;
  return h;
}
function lanes(ts){const L=[];ts.slice().sort((a,b)=>a.inicio.localeCompare(b.inicio)).forEach(t=>{let i=L.findIndex(end=>end<t.inicio);if(i<0){i=L.length;L.push('')}L[i]=t.ext?addDays(tEnd(t),t.ext.dias):tEnd(t);t._lane=i});return Math.max(1,L.length)}
const GL=36;   // alto de cada carril del Gantt
function vGantt(L){
  const N=28,days=periodDays(),start=S.gs,end=days[N-1];
  const pct=f=>diffD(start,f)/N*100;
  const we=days.map((f,i)=>{const w=d8(f).getDay();return w===6?`<div class="gwe" style="left:${i/N*100}%;width:${200/N}%"></div>`:w===0&&i===0?`<div class="gwe" style="left:0;width:${100/N}%"></div>`:''}).join('');
  const now=TODAY>=start&&TODAY<=end?`<div class="gnow" style="left:calc(${pct(TODAY)}% + ${100/N/2}%)"></div>`:'';
  const rows=RECURSOS.map(r=>{
    const ts=L.filter(t=>t.rec===r.id&&t.inicio<=end&&tEnd(t)>=start);
    const nl=lanes(ts),o=occRec(r.id,days,L);
    const bars=ts.map(t=>{const st=tState(t),cl=clashes(t).length,lk=started(t);
      const ds=tDays(t).map(f=>`<i class="s-${dayState(t,f)}"></i>`).join('');
      const top=7+t._lane*GL;
      const ext=t.ext?`<div class="gext" style="left:${pct(addDays(tEnd(t),1))}%;width:${t.ext.dias/N*100}%;top:${top}px">+${t.ext.dias} pedido</div>`:'';
      return `<div class="gbar s-${st}${cl?' clash':''}${lk?' lock':''}${t.cierre?' closed':''}" data-id="${t.id}" style="left:${pct(t.inicio)}%;width:${t.dias/N*100}%;top:${top}px" title="${t.id} · ${esc(OPS[CT(t.ct).op])} · ${esc(t.ct)} · ${esc(locOf(t))} · ${t.dias} días · ${t.pers.length} personas${t.ptw?' · permiso de operadora':''}${t.cierre?' · cerrado':''}${cl?' · se superpone con '+clashes(t).map(x=>x.id).join(', '):''}">
        <span class="gh l" data-h="l"></span>${t.cierre?`<span class="ck">${ic('okc')}</span>`:`<span class="gpr" style="--pc:${PRIO_C[t.prio]}"></span>`}<span class="gl"><span class="mono">${t.id}</span> ${esc(t.pozo)} · ${t.dias} d${t.ptw?' · PT':''}</span><span class="gd">${ds}</span><span class="gh r" data-h="r"></span></div>${ext}`}).join('');
    return `<div class="grow"><div class="glab"><b title="${esc(r.n)}">${esc(r.n)}</b><small>${esc(jefeOf(r.id))}</small><div class="occ" style="--c:${occC(o)}"><i><em style="width:${o}%"></em></i><b>${o}%</b></div></div><div class="gtrack" style="min-height:${14+nl*GL}px">${we}${now}${bars}</div></div>`}).join('');
  return `<div class="gantt fill"><div class="grow ghd"><div class="gmonth">Recurso · ocupación</div><div class="ghead">${days.map(f=>{const d=d8(f),w=d.getDay();return `<span class="${w===0||w===6?'we':''}${f===TODAY?' td':''}">${'DLMMJVS'[w]}<b>${d.getDate()}</b></span>`}).join('')}</div></div>
    <div class="gbody" data-keep="g">${rows||'<div class="empty" style="margin:14px">No hay cuadrillas cargadas.</div>'}</div>
    <div class="grow gfoot"><div class="glab"><b>Ocupación diaria</b><small>Recursos ocupados / ${RECURSOS.length}</small></div><div class="gocc">${days.map(f=>{const o=occDay(f,L);return `<span title="${fDay(f)}: ${o}%" style="--c:${occC(o)}"><i style="height:${Math.max(o,3)*0.22}px"></i>${o}</span>`}).join('')}</div></div></div>`;
}
function vWeek(L){
  const days=periodDays();
  let h=`<div class="board fill" role="grid" aria-label="Calendario por recurso" data-keep="w" style="grid-template-rows:auto repeat(${RECURSOS.length},minmax(76px,1fr))"><div class="bh">Recurso</div>`;
  days.forEach(f=>{const x=d8(f),o=occDay(f,L);h+=`<div class="bh${f===TODAY?' today':''}">${DIAS[x.getDay()]}${f===TODAY?' · hoy':''}<b>${x.getDate()}</b><span class="oc"><span class="gpr" style="--pc:${occC(o)}"></span>${o}%</span></div>`});
  RECURSOS.forEach((r,ri)=>{
    const last=ri===RECURSOS.length-1?' lastrow':'',o=occRec(r.id,days,L);
    h+=`<div class="rh${last}"><b>${esc(r.n)}</b><small>${esc(jefeOf(r.id))}</small><div class="occ" style="--c:${occC(o)}"><i><em style="width:${o}%"></em></i><b>${o}%</b></div></div>`;
    days.forEach(f=>{
      const ts=L.filter(t=>t.rec===r.id&&covers(t,f));
      h+=`<div class="cell${f===TODAY?' today':''}${last}">${ts.slice(0,2).map(t=>{const st=dayState(t,f),p=parteOf(t.id,f);
        return `<button class="job s-${st}" data-a="t-open" data-id="${t.id}" title="${t.id} · ${esc(t.pozo)} · ${t.pers.length} personas · ${t.eqs.join(', ')}"><span class="l1"><span class="mono">${t.id}</span><span class="gpr" style="--pc:${PRIO_C[t.prio]}"></span></span><span class="l2">${esc(t.pozo)} · d${diffD(t.inicio,f)+1}/${t.dias}${t.ptw?' · PT':''}${p?' · '+p.id.slice(3):''}</span></button>`}).join('')}${ts.length>2?`<span class="more">+${ts.length-2} más</span>`:''}
        ${f>=TODAY&&canPlan()&&ts.length<2?`<button class="add" data-a="p-cell" data-rec="${r.id}" data-d="${f}" aria-label="Planificar ${esc(r.n)} el ${fDay(f)}">+</button>`:''}</div>`;
    });
  });
  return h+'</div>';
}
function vMonth(L){
  const[y,m]=S.ms.split('-').map(Number);
  const first=`${S.ms}-01`,last=iso(new Date(y,m,0));
  let d=mondayOf(first);const cells=[];
  while(d<=last||(d8(d).getDay()!==1)){cells.push(d);d=addDays(d,1);if(cells.length>42)break}
  const wk=cells.length/7;
  let h=`<div class="mwrap fill"><div class="mhead">${['lun','mar','mié','jue','vie','sáb','dom'].map(x=>`<span>${x}</span>`).join('')}</div><div class="month" style="grid-template-rows:repeat(${wk},minmax(0,1fr))">`;
  cells.forEach(f=>{const ts=L.filter(t=>covers(t,f)).sort((a,b)=>a.rec.localeCompare(b.rec));const o=occDay(f,L);const out=f.slice(0,7)!==S.ms;
    h+=`<div class="mday${out?' out':''}${f===TODAY?' today':''}"><div class="mt"><span class="dn">${d8(f).getDate()}</span>${ts.length?`<span class="opct" style="--c:${occC(o)}" title="Recursos ocupados">${o}%</span>`:''}${f>=TODAY&&!out&&canPlan()?`<button class="add sm" data-a="p-cell" data-d="${f}" aria-label="Planificar el ${fDay(f)}">+</button>`:''}</div>
      ${ts.slice(0,3).map(t=>`<button class="mchip s-${dayState(t,f)}" data-a="t-open" data-id="${t.id}" title="${t.id} · ${esc(recOf(t.rec).n)} · ${esc(t.pozo)}">${esc(recOf(t.rec).n)} · ${esc(t.pozo)}</button>`).join('')}
      ${ts.length>3?`<span class="more">+${ts.length-3} más</span>`:''}</div>`});
  return h+'</div></div>';
}
function resList(kind,items,op,a,b,exceptId,days,delAct){
  return items.map(s=>{const h=habSpan(s,op,a,b),cl=days?busyRes(kind,s,days,exceptId):[];
    return `<div><span class="nm"><b>${kind==='p'?esc(s):`<span class="mono">${esc(s)}</span> ${esc(EQ[s])}`}</b><small>${kind==='p'?esc(ROLEP[s]||'Operario')+' · '+esc(homeOf(s)):esc(eqHome(s))}${cl.length?` · <span class="warn">también en ${cl.join(', ')}</span>`:''}</small></span>${habChip(h)}${delAct?`<button type="button" class="ibtn xs del" data-a="${delAct}" data-n="${esc(s)}" aria-label="Quitar ${esc(s)}">${ic('x')}</button>`:''}</div>`}).join('')||'<div class="sm">Sin asignar</div>';
}
function drawer(){
  const t=trab(UI.drawer);if(!t)return '';
  const c=CT(t.ct),st=tState(t),mn=minDias(t),cl=clashes(t),lockD=!!t.cierre;
  const dl=tDays(t).map((f,i)=>{const p=parteOf(t.id,f);return p?`<button data-a="sum" data-id="${p.id}"><span class="dd">${fDay(f)}</span><span class="mono sm">${p.id}</span>${p.fin==='fin'?`<span class="tag">${ic('flag')}Cierre</span>`:''}<span class="sp"></span>${pill(p.estado)}${ic('doc')}</button>`:`<div><span class="dd">${fDay(f)}</span><span class="sm">Día ${i+1} · sin iniciar</span><span class="sp"></span>${pill('plan')}</div>`}).join('');
  const canDel=isAdm()&&!started(t);
  return `<aside class="drawer" aria-label="Detalle del trabajo"><div class="dh"><div style="flex:1;min-width:0"><div class="trow"><span class="mono">${t.id}</span>${prioB(t.prio)}${pill(st)}${ptTag(t.ptw)}</div><h2>${esc(c.n)}</h2></div><button class="ibtn" data-a="close-drawer" aria-label="Cerrar">${ic('x')}</button></div>
  <div class="db" data-keep="d">
    ${canPlan()?`<div class="dacts"><button class="btn sm2" data-a="t-edit">${ic('edit')}Editar trabajo</button>${isAdm()&&t.cierre?`<button class="btn sm2" data-a="a-reopen">${ic('back')}Reabrir trabajo</button>`:''}${canDel?`<button class="btn sm2 danger" data-a="a-del">${ic('trash')}Eliminar</button>`:''}</div>`:''}
    ${t.cierre?`<div class="infobox">${ic('okc')}<div><b>Trabajo cerrado ${t.cierre.anticipado?'antes de lo planificado':''}</b>${esc(t.cierre.who)} · ${esc(when(t.cierre.t))} · parte ${esc(t.cierre.parte||'')}${t.cierre.obs?`<div class="sm">${esc(t.cierre.obs)}</div>`:''}</div></div>`:''}
    ${t.ext?`<div class="infobox w">${ic('flag')}<div><b>${esc(t.ext.who)} pide ${t.ext.dias} día${t.ext.dias>1?'s':''} más</b><div class="sm">${esc(t.ext.motivo)}</div>${canPlan()?`<div class="dacts" style="margin-top:8px"><button class="btn sm2" data-a="x-no" data-id="${t.id}">Rechazar</button><button class="btn pri sm2" data-a="x-ok" data-id="${t.id}">Aprobar</button></div>`:''}</div></div>`:''}
    <dl class="kv"><dt>Contrato</dt><dd><span class="mono">${esc(t.ct)}</span> · ${esc(OPS[c.op])}</dd><dt>Imputación</dt><dd><span class="mono">${esc(t.imp)}</span>${impN(t.ct,t.imp)?`<div class="sm">${esc(impN(t.ct,t.imp))}</div>`:''}</dd><dt>Centro de costo</dt><dd>${esc(t.cc||c.cc)} · ${esc(t.ccn||c.ccn)}</dd><dt>Ubicación</dt><dd>${esc(locOf(t))}</dd><dt>Fila del Gantt</dt><dd>${esc(recOf(t.rec).n)}</dd><dt>Permiso operadora</dt><dd>${t.ptw?'Sí, firma el supervisor de '+esc(OPS[c.op]):'No requiere'}</dd><dt>Supervisor</dt><dd>${esc(t.sup)}</dd><dt>Resp. técnico</dt><dd>${esc(t.rt)}</dd></dl>
    <div><div class="lab">Personas · ${t.pers.length}</div><div class="rlist">${resList('p',t.pers,c.op,t.inicio,tEnd(t),t.id,tDays(t))}</div></div>
    <div><div class="lab">Equipos · ${t.eqs.length}</div><div class="rlist">${resList('e',t.eqs,c.op,t.inicio,tEnd(t),t.id,tDays(t))}</div></div>
    <div><div class="lab">Duración</div><div class="trow">${canPlan()&&!lockD?`<div class="stepper"><button data-a="t-dias" data-d="-1"${t.dias<=mn?' disabled':''} aria-label="Un día menos">−</button><b>${t.dias} día${t.dias>1?'s':''}</b><button data-a="t-dias" data-d="1"${t.dias>=30?' disabled':''} aria-label="Un día más">+</button></div>`:`<b>${t.dias} día${t.dias>1?'s':''}</b>`}<span class="sm">${fDay(t.inicio)} → ${fDay(tEnd(t))}</span></div>
      ${mn>1&&!lockD&&canPlan()?`<p class="sm" style="margin:6px 0 0">No se puede acortar a menos de ${mn} días: ya hay partes cargados.</p>`:''}${cl.length?`<p class="note e" style="margin:6px 0 0">${ic('alert')}Se superpone con ${cl.map(x=>x.id).join(', ')} en el mismo recurso</p>`:''}</div>
    ${canPlan()?`<div><div class="lab">Prioridad</div><div class="seg">${Object.entries(PRIO).map(([k,l])=>`<button data-a="t-prio" data-p="${k}" aria-pressed="${t.prio===k}">${l}</button>`).join('')}</div></div>`:''}
    <div><div class="lab">Tareas previstas</div><div class="chips">${t.prev.map(x=>`<span class="tag">${esc(x)} · ${esc(unitOf(t.ct,x)||'sin unidad')}</span>`).join('')}</div></div>
    ${t.ind?`<div><div class="lab">Indicaciones</div><div style="font-size:14px">${esc(t.ind)}</div></div>`:''}
    <div><div class="lab">Partes diarios</div><div class="dlist">${dl}</div></div>
    <div><div class="lab">Historial</div><ol class="tl">${t.hist.map(x=>`<li>${esc(x.a)}<small>${esc(x.who)} · ${esc(when(x.t))}</small>${x.c?`<q>${esc(x.c)}</q>`:''}</li>`).join('')}</ol></div>
  </div></aside>`;
}
function vList(){
  const f=S.pf;
  const base=S.partes.filter(p=>(S.lop==='all'||p.op===S.lop)&&(S.lct==='all'||p.ct===S.lct)&&(S.lrec==='all'||p.rec===S.lrec)&&(!S.lq||norm([p.id,p.pl,p.pozo,p.yac,p.imp,p.ct].join(' ')).includes(norm(S.lq))));
  const opts=[['all','Todos'],...Object.entries(EST).filter(([k])=>k!=='plan')];
  const n=k=>k==='all'?base.length:base.filter(p=>p.estado===k).length;
  const rows=base.filter(p=>f==='all'||p.estado===f).sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.id.localeCompare(a.id));
  return `<div class="bar">${selF('l-op','s:lop',opOpts(),S.lop,' aria-label="Cliente"')}${ctSel('l-ct','s:lct',S.lop,S.lct,'Todos los contratos','','Contrato')}${selF('l-rec','s:lrec',[['all','Todos los recursos'],...RECURSOS.map(r=>[r.id,r.n])],S.lrec,' aria-label="Recurso"')}<div class="srch">${ic('search')}<input class="inp" type="search" id="l-q" data-bind="s:lq" data-rr value="${esc(S.lq)}" placeholder="Nº de parte, pozo, imputación…" aria-label="Buscar"></div></div>
  <div class="bar">${opts.map(([k,l])=>`<button class="chip sm3" data-a="p-filter" data-f="${k}" aria-pressed="${f===k}">${l} <span class="n">${n(k)}</span></button>`).join('')}<span class="sp"></span><span class="sm">${rows.length} partes</span></div>
  <div class="pnl tblp fill"><div class="body" data-keep="v"><table class="tbl sticky"><thead><tr><th>Nº</th><th>Fecha</th><th>Trabajo</th><th>Recurso</th><th>Contrato · imputación</th><th>Ubicación</th><th class="num">Horas</th><th>Estado</th></tr></thead><tbody>
  ${rows.map(p=>{const s=sums(p);return `<tr class="click" data-a="sum" data-id="${p.id}"><td class="mono">${p.id}</td><td class="nw">${fDay(p.fecha)}</td><td class="mono nw">${p.pl} <span class="sm">d${p.dia+1}</span>${p.fin==='fin'?` <span class="sm">· cierre</span>`:''}</td><td>${esc(recOf(p.rec).n)}</td><td><span class="mono">${esc(p.ct)}</span><div class="sm mono">${esc(p.imp||'')}</div></td><td>${esc(locOf(p))}</td><td class="num">${s.jor?fmtH(s.jor):'—'}</td><td>${pill(p.estado)}</td></tr>`}).join('')||`<tr><td colspan="8"><div class="empty">No hay partes con estos filtros.</div></td></tr>`}
  </tbody></table></div></div>`;
}
function vHab(){
  const isP=S.hf==='p';
  let subs=isP?ALLP.slice():Object.keys(EQ);
  if(S.hq)subs=subs.filter(s=>norm(s+' '+(EQ[s]||'')+' '+(isP?homeOf(s):eqHome(s))).includes(norm(S.hq)));
  if(S.hbad)subs=subs.filter(s=>Object.keys(OPS).some(op=>{const h=hab(s,op,TODAY);return habBad(h)||h.st==='pronto'}));
  const all=isP?ALLP:Object.keys(EQ);
  const bad=all.reduce((n,s)=>n+Object.keys(OPS).filter(op=>habBad(hab(s,op,TODAY))).length,0);
  return `<div class="bar"><div class="seg"><button data-a="h-filter" data-f="p" aria-pressed="${isP}">${ic('users')}Personal</button><button data-a="h-filter" data-f="v" aria-pressed="${!isP}">${ic('truck')}Vehículos y equipos</button></div><div class="srch">${ic('search')}<input class="inp" type="search" id="h-q" data-bind="s:hq" data-rr value="${esc(S.hq)}" placeholder="${isP?'Nombre o cuadrilla':'Interno, tipo o cuadrilla'}" aria-label="Buscar"></div><button class="chip sm3" data-a="h-bad" aria-pressed="${S.hbad}">${ic('alert')}Solo vencidas o por vencer</button><span class="sp"></span><span class="note">${ic('alert')}${bad} vencidas o faltantes hoy</span></div>
  <div class="pnl tblp fill"><div class="body" data-keep="v"><table class="tbl sticky habtbl"><thead><tr><th>${isP?'Persona':'Equipo'}</th><th>Asignado a</th>${Object.values(OPS).map(o=>`<th>${esc(o)}</th>`).join('')}</tr></thead><tbody>
  ${subs.map(s=>`<tr><td><b>${isP?esc(s):`<span class="mono">${esc(s)}</span> ${esc(EQ[s])}`}</b></td><td class="sm">${esc(isP?homeOf(s):eqHome(s))}</td>${Object.keys(OPS).map(op=>`<td>${habChip(hab(s,op,TODAY),isAdm()?[s,op]:null,true)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${2+Object.keys(OPS).length}"><div class="empty">Nada coincide con el filtro.</div></td></tr>`}
  </tbody></table></div></div>
  <p class="sm foot">La mantiene Seguridad e Higiene${isAdm()?' (como administrador podés editarla)':''}. Quien no está habilitado para el cliente del contrato no puede figurar como presente en el parte.</p>`;
}
