/* ---------- operador: mi jornada y parte diario en 5 pasos ---------- */
const saludo=()=>{const h=new Date().getHours();return h<13?'Buen día':h<20?'Buenas tardes':'Buenas noches'};
function vDay(){
  const R=USERS.operador.rec;
  const obs=S.partes.filter(p=>p.rec===R&&p.estado==='obs');
  const hoy=S.trabajos.filter(t=>t.rec===R&&covers(t,TODAY)&&!t.cierre).sort(byOrd).map(t=>({t,p:parteOf(t.id,TODAY)})).filter(x=>!x.p||x.p.estado==='curso');
  const prox=S.trabajos.filter(t=>t.rec===R&&t.inicio>TODAY).sort((a,b)=>a.inicio.localeCompare(b.inicio));
  const env=S.partes.filter(p=>p.rec===R&&['env','apr','cert'].includes(p.estado)).sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.id.localeCompare(a.id));
  const meta=x=>`<div class="meta"><span>${ic('pin')}${esc(locOf(x))}</span><span>${esc(OPS[CT(x.ct).op])} · <span class="mono">${esc(x.ct)}</span></span><span>${ic('users')}${(x.pers||[]).length} personas · ${esc((x.eqs||[]).join(', '))}</span></div>`;
  const cards=[...obs.map(p=>`<div class="tcard obs"><div><div class="t1"><span class="mono">${p.id}</span>${pill(p.estado)}<span class="sm">${fDay(p.fecha)}</span></div><h4>${p.prev.map(esc).join(' · ')}</h4>${meta(p)}</div><div><button class="btn pri lg" data-a="o-open" data-id="${p.id}">Corregir parte</button></div>${p.dec?`<div class="vnote">${ic('back')}<div><b>Observado por ${esc(p.dec.who)} · ${esc(when(p.dec.t))}</b>${esc(p.dec.com)}</div></div>`:''}</div>`),
    ...hoy.map(({t,p})=>{const i=diffD(t.inicio,TODAY);const last=i===t.dias-1;
    const act=p?`<button class="btn pri lg" data-a="o-open" data-id="${p.id}">Continuar ${ic('right')}</button>`:`<button class="btn pri lg" data-a="o-start" data-pl="${t.id}">Iniciar parte ${ic('right')}</button>`;
    return `<div class="tcard${p?' cur':''}"><div><div class="t1">${t.orden||t.hora?`<span class="tag ordt">${ic('clock')}${esc(ordTxt(t))}</span>`:''}${p?`<span class="mono">${p.id}</span>`:''}${pill(p?p.estado:'plan')}${prioB(t.prio)}${ptTag(t.ptw)}<span class="tag">${t.id} · día ${i+1} de ${t.dias}${last?' · último':''}</span></div><h4>${t.prev.map(esc).join(' · ')}</h4>${meta(t)}</div><div>${act}</div>${p?`<div class="prog" aria-label="Avance del parte">${STEPS.map((s,k)=>`<i class="${stepOk(p,k)?'on':''}" title="${s}"></i>`).join('')}</div>`:''}${t.ind?`<div class="vnote n">${ic('pin')}<div>${esc(t.ind)}</div></div>`:''}${t.ext?`<div class="vnote n">${ic('flag')}<div>Pediste ${t.ext.dias} día(s) más · esperando aprobación de planificación</div></div>`:''}</div>`})];
  return `<div class="hero-op"><div><h2>${saludo()}, ${esc(USERS.operador.n.split(' ')[0])}</h2><p>${esc(recOf(R).n)} · ${fDayM(TODAY)}</p></div><div class="kchips">${kchip(hoy.length,'para hoy','var(--accent)')}${kchip(obs.length,'para corregir',obs.length?'var(--st-obs)':'var(--faint)')}${kchip(env.filter(p=>p.estado==='env').length,'en aprobación','var(--st-env)')}</div></div>
  <div class="opgrid fill">
    <section class="opmain" data-keep="v"><h3 class="sect">${obs.length?`<span style="color:var(--st-obs)">${ic('alert')}Para corregir y hoy</span>`:'Hoy'}</h3>${cards.join('')||'<div class="empty">No tenés trabajo pendiente para hoy.</div>'}</section>
    <section class="opside">
      <div class="pnl col"><h3>Próximos trabajos<span class="sp"></span><span class="sm">${prox.length}</span></h3><div class="body mlist">${prox.map(t=>`<div class="mrow"><div class="t1"><span class="mono">${t.id}</span>${prioB(t.prio)}${ptTag(t.ptw)}</div><b>${t.prev.map(esc).join(' · ')}</b><small>${fDay(t.inicio)} → ${fDay(tEnd(t))} · ${t.dias} días · ${esc(locOf(t))}</small></div>`).join('')||'<div class="empty">Sin planificación cargada.</div>'}</div></div>
      <div class="pnl col"><h3>Enviados<span class="sp"></span><span class="sm">${env.length}</span></h3><div class="body mlist">${env.slice(0,12).map(p=>`<button class="mrow" data-a="sum" data-id="${p.id}"><div class="t1"><span class="mono">${p.id}</span>${pill(p.estado)}${p.fin==='fin'?`<span class="tag">${ic('flag')}Cierre</span>`:''}${p.cola?`<span class="flag warn">${ic('nowifi')}En cola</span>`:''}</div><b>${esc(locOf(p))}</b><small>${fDay(p.fecha)} · ${p.pl}</small></button>`).join('')||'<div class="empty">Todavía no enviaste partes.</div>'}</div></div>
    </section>
  </div>`;
}
const H24=Array.from({length:24},(_,i)=>String(i).padStart(2,'0'));
const M5=Array.from({length:12},(_,i)=>String(i*5).padStart(2,'0'));
function tin(bind,v,dis,lab){
  const id='f-'+bind.replace(/[^a-z0-9]/gi,'-'),tp=UI.tp[bind];
  let hh='',mm='';if(mins(v)!==null)[hh,mm]=v.split(':');else if(tp){hh=tp.h;mm=tp.m}
  const ms=!mm||M5.includes(mm)?M5:[...M5,mm].sort();
  const L=esc(lab||'Hora'),D=dis?' disabled':'';
  return `<span class="tpick" data-v="${esc(v||'')}"><select class="inp" id="${id}" data-tbind="${bind}" data-part="h" aria-label="${L}: hora"${D}><option value="">hh</option>${H24.map(h=>`<option${h===hh?' selected':''}>${h}</option>`).join('')}</select><span class="tcolon">:</span><select class="inp" id="${id}-m" data-tbind="${bind}" data-part="m" aria-label="${L}: minutos"${D}><option value="">mm</option>${ms.map(m=>`<option${m===mm?' selected':''}>${m}</option>`).join('')}</select></span>`;
}
function vEdit(){
  const p=cur(),e=p.ejec,c=CT(p.ct);if(S.step>3)S.step=3;const st=S.step;
  const body=[stInicio,stPersEq,stReg,stCierre][st](p,e);
  const ban=p.estado==='obs'&&p.dec?`<div class="banner" title="${esc(p.dec.com)}">${ic('back')}<div><b>Devuelto por ${esc(p.dec.who)} · ${esc(when(p.dec.t))}</b>${esc(p.dec.com)}</div></div>`:'';
  const admEdit=isAdm()&&!!UI.editSnap;
  const er=errs(p).length;
  const last=admEdit?`<button class="btn lg ghost" data-a="a-cancel">Descartar cambios</button><button class="btn pri lg" data-a="a-save">${ic('check')}Guardar cambios</button>`:`<button class="btn pri lg" data-a="o-send"${er?' disabled':''}>${ic('send')}${p.estado==='obs'?'Reenviar corregido':p.fin==='fin'?'Enviar y cerrar trabajo':'Enviar para aprobación'}</button>`;
  return `<div class="edhead"><span>Contrato <b class="mono">${esc(p.ct)}</b></span><span>Imputación <b class="mono">${esc(p.imp||'—')}</b></span><span>Centro de costo <b>${esc(p.cc)} · ${esc(p.ccn||c.ccn)}</b></span><span>Cliente <b>${esc(OPS[p.op])}</b></span><span>Supervisor <b>${esc(p.sup)}</b></span>${admEdit?'<span><b class="acc">Edición de administración</b></span>':''}</div>
  <nav class="steps" aria-label="Secciones del parte">${STEPS.map((s,i)=>`<button class="stp${stepOk(p,i)&&i!==st?' ok':''}" data-a="o-step" data-i="${i}"${i===st?' aria-current="step"':''}><i>${stepOk(p,i)&&i!==st?ic('check'):i+1}</i>${s}</button>`).join('')}</nav>
  <div class="edbody" data-keep="e">${ban}${body}</div>
  <div class="edfoot"><span class="saved${offline()?' off':''}">${ic(offline()?'nowifi':'cloud')}${offline()?'Guardado en la tablet · se envía al recuperar señal':'Guardado automático'}</span>
    ${st>0?`<button class="btn lg" data-a="o-step" data-i="${st-1}">${ic('left')}${STEPS[st-1]}</button>`:''}
    ${st<3?`<button class="btn pri lg" data-a="o-step" data-i="${st+1}">${STEPS[st+1]} ${ic('right')}</button>`:last}
  </div>`;
}
function stInicio(p,e){
  const tg=(k,t,s)=>`<button class="tog" data-a="o-check" data-k="${k}" aria-pressed="${e.check[k]}"><span class="bx">${ic('check')}</span><span>${t}<small>${s}</small></span></button>`;
  const cl=e.clima||{t:'',v:'',r:'',dir:'O',cond:'Despejado',src:''};
  const t=trab(p.pl),w=e.permiso||{num:'',firmo:'',hora:''};
  const sel=(id,bind,opts,v)=>`<select class="inp" id="${id}" data-bind="${bind}" data-rr><option value=""${!v?' selected':''}>Elegir…</option>${opts.map(o=>`<option${o===v?' selected':''}>${esc(o)}</option>`).join('')}</select>`;
  const pl=trab(p.pl)||p;
  return `<div class="g3 fill">
    <div class="stack"><div class="pnl col fill"><h3>Lo planificado<span class="sp"></span>${prioB(p.prio)}</h3><div class="body"><dl class="kv kv1"><dt>Servicio</dt><dd>${esc(CT(p.ct).n)}</dd><dt>Imputación</dt><dd><span class="mono">${esc(p.imp||'—')}</span>${impN(p.ct,p.imp)?`<div class="sm">${esc(impN(p.ct,p.imp))}</div>`:''}</dd><dt>Trabajo</dt><dd><span class="mono">${p.pl}</span> · día ${p.dia+1} de ${t.dias} · ${fDay(t.inicio)} → ${fDay(tEnd(t))}</dd>${ordTxt(pl)?`<dt>En el día</dt><dd>${esc(ordTxt(pl))} <span class="sm">(guía, no obligatorio)</span></dd>`:''}<dt>Ubicación</dt><dd>${esc(locOf(p))}</dd><dt>Tareas</dt><dd>${p.prev.map((x,k)=>`<span class="sm">${k+1}.</span> ${esc(x)} <span class="sm">${esc(unitOf(p.ct,x))}</span>`).join('<br>')}</dd>${p.ind?`<dt>Indicaciones</dt><dd>${esc(p.ind)}</dd>`:''}</dl></div></div>
      <div class="pnl"><h3>Responsables</h3><div class="grid2 g10"><div class="fld"><label for="p-sup">Supervisor</label>${sel('p-sup','p:sup',SUPS,p.sup)}</div><div class="fld"><label for="p-rt">Responsable técnico</label>${sel('p-rt','p:rt',RTS,p.rt)}</div></div></div></div>
    <div class="stack">
      <div class="pnl"><h3>${ic('clock')}Llegada a la instalación</h3><div class="fld"><label for="f-e-llegada">Hora de llegada</label>${tin('e:llegada',e.llegada,false,'Hora de llegada a la instalación')}</div></div>
      <div class="pnl"><h3>${ic('sign')}Permiso de trabajo de la operadora</h3>${p.ptw?`
        <div class="grid2 g10"><div class="fld"><label for="pt-n">Nº de permiso</label><input class="inp" id="pt-n" data-bind="e:permiso.num" data-rr value="${esc(w.num)}" placeholder="PT-…"></div><div class="fld"><label for="pt-f">Firmó</label><input class="inp" id="pt-f" data-bind="e:permiso.firmo" data-rr value="${esc(w.firmo)}" placeholder="${esc(OPSUP[p.op])}"></div></div>
        <div class="fld" style="margin-top:10px"><label for="f-e-permiso-hora">Hora de firma</label>${tin('e:permiso.hora',w.hora,false,'Hora de firma')}</div>
        <div class="csrc">${w.num&&w.firmo&&w.hora?`<span class="hab h-ok">${ic('check')}Firmado a las ${esc(w.hora)}</span><span class="sp"></span><button class="btn sm2" data-a="o-ptundo">${ic('back')}Deshacer firma</button>`:`<span class="hab h-venc">${ic('x')}Falta la firma</span><span class="sp"></span><button class="btn sm2" data-a="o-ptnow">${ic('sign')}Firmado ahora</button>`}</div>
        ${w.num&&w.firmo&&w.hora?'':`<p class="sm" style="margin:8px 0 0">No empieces hasta que firme el supervisor de ${esc(OPS[p.op])}.</p>`}`
        :`<p class="sm" style="margin:0">Este trabajo no requiere permiso de la operadora.</p>`}</div>
    </div>
    <div class="stack">
      <div class="pnl"><h3>${ic('sun')}Condiciones climáticas</h3>
        <div class="clima">
          <div class="fld"><label for="c-t" title="Temperatura">Temp. °C</label><input class="inp" type="number" inputmode="decimal" id="c-t" data-bind="e:clima.t" data-rr value="${esc(cl.t)}"></div>
          <div class="fld"><label for="c-v" title="Viento km/h">Viento km/h</label><input class="inp" type="number" inputmode="numeric" id="c-v" data-bind="e:clima.v" data-rr value="${esc(cl.v)}"></div>
          <div class="fld"><label for="c-r" title="Ráfagas km/h">Ráfagas km/h</label><input class="inp${Number(cl.r)>=60?' bad':''}" type="number" inputmode="numeric" id="c-r" data-bind="e:clima.r" data-rr value="${esc(cl.r)}"></div>
          <div class="fld"><label for="c-d">Dirección</label><select class="inp" id="c-d" data-bind="e:clima.dir" data-rr>${DIRS.map(d=>`<option${cl.dir===d?' selected':''}>${d}</option>`).join('')}</select></div>
          <div class="fld span2"><label for="c-c">Condición</label><select class="inp" id="c-c" data-bind="e:clima.cond" data-rr>${CONDS.map(d=>`<option${cl.cond===d?' selected':''}>${d}</option>`).join('')}</select></div>
        </div>
        <div class="csrc">${e.clima&&e.clima.src==='app'?`${ic('cloud')}<span>${esc(e.clima.fuente||'App de clima')} · ${esc(e.clima.at||'')}</span>`:e.clima?'<span>Cargado a mano</span>':'<span>Sin cargar</span>'}<span class="sp"></span><button class="btn sm2" data-a="o-clima"${UI.clima?' disabled':''}>${ic('wind')}${UI.clima?'Consultando…':'Tomar clima actual'}</button></div>
        ${Number(cl.r)>=60?`<div class="windhint">${ic('wind')}<div>Ráfagas sobre 60 km/h: suspender izajes y trabajos en altura y registrar la parada por viento.</div></div>`:''}
      </div>
      <div class="pnl"><h3>Antes de empezar</h3><div class="togs">${tg('charla','Charla de seguridad de 5 minutos','Con todo el personal presente')}${tg('epp','EPP verificado','Casco, anteojos, guantes, calzado y ropa ignífuga')}</div></div>
    </div></div>`;
}
/* Paso 2: personal y equipos juntos. En personal solo se marca quién está; los horarios se calculan en el cierre. */
function stPersEq(p,e){
  const usedP=new Set(e.personal.map(x=>x.n)),usedE=new Set(e.equipos.map(q=>q.c)),ceq=CT(p.ct).eqs||[];
  const prow=e.personal.map((x,i)=>{const h=hab(x.n,p.op,p.fecha);
    return `<div class="prow${x.pres?'':' off'}"><button class="sw" role="switch" aria-checked="${x.pres}" aria-label="Presente: ${esc(x.n)}" data-a="o-pres" data-i="${i}"><span></span></button><span class="nm"><b>${esc(x.n)}</b><small>${x.pres?esc(x.rol):'Ausente'}${x.add?' · reemplazo':''}</small></span>${habChip(h)}${x.add?`<button class="ibtn xs del" data-a="o-delp" data-i="${i}" aria-label="Quitar ${esc(x.n)}">${ic('trash')}</button>`:'<span class="w28"></span>'}</div>`}).join('');
  const cand=ALLP.filter(n=>!usedP.has(n)).map(n=>{const h=hab(n,p.op,p.fecha);return {v:n,t:n,s:(ROLEP[n]||'Operario')+' · '+homeOf(n),b:habChip(h),bad:habBad(h)}});
  const erow=e.equipos.map((q,i)=>{const pk=lastKm(q.c,p);const d=q.km!==''&&pk!==null?Number(q.km)-pk:null;
    return `<tr><td><b class="mono">${esc(q.c)}</b> ${esc(EQ[q.c])}<div class="trow">${habChip(hab(q.c,p.op,p.fecha))}</div></td><td class="w130"><input class="inp${d!=null&&d<0?' soft':''}" type="number" inputmode="numeric" id="f-eq${i}" data-bind="e:equipos.${i}.km" data-rr value="${esc(q.km)}" placeholder="${pk!==null?num(pk):''}" aria-label="Km actual ${esc(q.c)}"><div class="sm">Último: ${pk!==null?num(pk):'—'}</div></td><td class="num w90 ${d!=null&&d<0?'warn':''}">${d==null?'—':num(d)+' km'}</td><td><input class="inp" id="f-eqo${i}" data-bind="e:equipos.${i}.obs" value="${esc(q.obs)}" placeholder="Fallas, combustible…" aria-label="Observación ${esc(q.c)}"></td><td class="w44"><button class="ibtn del" data-a="o-dele" data-i="${i}" aria-label="Quitar ${esc(q.c)}">${ic('trash')}</button></td></tr>`}).join('');
  const it=c=>({v:c,t:c+' · '+EQ[c],th:`<span class="mono">${esc(c)}</span> ${esc(EQ[c])}`,s:eqHome(c),b:habChip(hab(c,p.op,p.fecha))});
  const free=Object.keys(EQ).filter(c=>!usedE.has(c)),s=sums(p);
  return `<div class="cols fill" style="grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr)">
    <div class="pnl col"><h3>${ic('users')}Personal<span class="sp"></span><span class="sm">${s.pers} presentes de ${e.personal.length}</span></h3>
      <div class="body plist" data-keep="t">${prow||'<div class="empty">Sumá al menos una persona.</div>'}</div>
      <div class="pfoot"><div class="cbxw">${cbx('o-p','Sumar reemplazo: escribí el nombre',[['Habilitados',cand.filter(x=>!x.bad)],['Sin habilitación para '+OPS[p.op],cand.filter(x=>x.bad)]],'o-addp')}</div></div></div>
    <div class="pnl col"><h3>${ic('truck')}Equipos y vehículos<span class="sp"></span><span class="sm">${num(s.km)} km desde el último registro</span></h3>
      <div class="body" data-keep="t2"><table class="tbl sticky"><thead><tr><th>Equipo y habilitación</th><th>Km / horómetro</th><th class="num">Recorrido</th><th>Observación</th><th></th></tr></thead><tbody>${erow||'<tr><td colspan="5"><div class="empty">Agregá al menos un equipo.</div></td></tr>'}</tbody></table></div>
      <div class="pfoot"><div class="cbxw">${cbx('o-e','Agregar equipo: escribí el interno o el tipo',[['Equipos del contrato',free.filter(c=>ceq.includes(c)).map(it)],['Otros equipos',free.filter(c=>!ceq.includes(c)).map(it)]],'o-adde')}</div></div></div>
  </div>
  <p class="sm foot">Marcá quién está presente; si alguien no está habilitado para ${esc(OPS[p.op])}, marcalo ausente y sumá un reemplazo. Los horarios del personal se calculan solos con la llegada y los tramos del día, y se revisan en el cierre. De cada equipo cargá solo el km actual.</p>`;
}
function tbar(p){
  const e=p.ejec,W=SHW;
  const segs=e.reg.map(t=>{const o=dur(SH0,t.de),w=dur(t.de,t.a);if(o>=W||!w)return '';const ww=Math.min(w,W-o);
    return `<div class="tseg c-${t.c}" style="left:${o/W*100}%;width:${ww/W*100}%" title="${TCAT[t.c]} ${t.de}–${t.a}${t.d?' · '+esc(t.d):''}${regQ(t)?' · '+regQ(t):''}"></div>`}).join('');
  const ticks=[0,2,4,6,8,10,12,14].map(h=>`<span style="left:${h/14*100}%">${addM(SH0,h*60)}</span>`).join('');
  const s=sums(p);
  return `<div class="tbar" role="img" aria-label="Línea de tiempo del día">${segs}</div><div class="tticks">${ticks}</div>
  <div class="tlegend">${TORD.map(c=>`<span class="c-${c}"><i></i>${TCAT[c]} <b>${s.byc[c]?fmtH(s.byc[c]):'—'}</b></span>`).join('')}</div>`;
}
function stReg(p,e){
  const ecats=e.equipos.map(q=>EQ[q.c]),cat=CT(p.ct).tareas.filter(t=>!t[2]||ecats.includes(t[2]));
  const order=e.reg.map((r,i)=>[r,i]).sort((a,b)=>(mins(a[0].de)??9999)-(mins(b[0].de)??9999));
  const rows=order.map(([r,i])=>{const op=r.c==='op',vi=r.c==='vi',es=r.c==='es';
    const dCell=es?`<select class="inp${!r.d?' soft':''}" id="f-rd${i}" data-bind="e:reg.${i}.d" data-rr aria-label="Motivo de la espera"><option value="">Motivo de la espera…</option>${ESP.map(m=>`<option${r.d===m?' selected':''}>${m}</option>`).join('')}</select>`
      :`<input class="inp${op&&!r.d?' soft':''}" id="f-rd${i}" list="${op?'dl-cat':''}" data-bind="e:reg.${i}.d" data-rr value="${esc(r.d)}" placeholder="${op?'Elegí del catálogo o escribí la tarea':'Detalle (opcional)'}" aria-label="${op?'Tarea':'Detalle'}">${op&&r.d&&!inCat(p.ct,r.d)?'<div class="sm warn">Fuera del catálogo del contrato</div>':''}`;
    const qCell=op||vi?`<input class="inp${!(Number(r.q)>0)?' soft':''}" type="number" step="any" inputmode="decimal" id="f-rq${i}" data-bind="e:reg.${i}.q" data-rr value="${esc(r.q)}" aria-label="${vi?'Velocidad del viento':'Cantidad'}" placeholder="${vi?'Ráfaga':''}">`:'';
    const uCell=op?`<select class="inp" id="f-ru${i}" data-bind="e:reg.${i}.u" data-rr aria-label="Unidad"><option value=""></option>${UNITS.map(u=>`<option${r.u===u?' selected':''}>${u}</option>`).join('')}</select>`:vi?'<span class="unit">km/h</span>':'';
    return `<tr class="cat c-${r.c}"><td class="w160"><select class="inp" id="f-rc${i}" data-bind="e:reg.${i}.c" data-rr aria-label="Categoría">${TORD.map(k=>`<option value="${k}"${r.c===k?' selected':''}>${TCAT[k]}</option>`).join('')}</select></td>
    <td class="w132">${tin(`e:reg.${i}.de`,r.de,false,'Desde')}</td><td class="w132">${tin(`e:reg.${i}.a`,r.a,false,'Hasta')}</td>
    <td>${dCell}</td><td class="w86">${qCell}</td><td class="w90">${uCell}</td>
    <td class="num w64">${fmtH(dur(r.de,r.a))}</td><td class="w44"><button class="ibtn del" data-a="o-delr" data-i="${i}" aria-label="Quitar tramo">${ic('trash')}</button></td></tr>`}).join('');
  const pr=prod(p),pend=p.prev.filter(d=>!e.reg.some(x=>x.c==='op'&&x.d===d));
  return `<datalist id="dl-cat">${cat.map(([d])=>`<option value="${esc(d)}"></option>`).join('')}</datalist>
  <div class="pnl daysum"><div class="dsh"><h3>Resumen del día</h3><span class="sm">${fmtH(sums(p).jor)} registradas · de 06:00 a 20:00</span><span class="sp"></span><span class="sm prod">${pr.length?'Producción: '+pr.map(x=>`<b>${esc(x.d)}</b> ${x.q?num(x.q)+' '+esc(x.u):'—'}`).join(' · '):'Todavía no hay tareas operativas'}</span></div>${tbar(p)}</div>
  <div class="pnl col fill regp">
  <div class="body" data-keep="t"><table class="tbl sticky regtbl"><thead><tr><th>Categoría</th><th>Desde</th><th>Hasta</th><th>Tarea / motivo / detalle</th><th>Cantidad</th><th>Unidad</th><th class="num">Dur.</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="8"><div class="empty">Agregá el primer tramo del día: normalmente el traslado desde base.</div></td></tr>'}</tbody></table></div>
  <div class="pfoot regadd">${TORD.map(k=>`<button class="chip add sm3" data-a="o-addr" data-c="${k}"><span class="cdot c-${k}"></span>${k==='op'?'Tarea operativa':TCAT[k]}</button>`).join('')}${pend.map(d=>`<button class="chip add sm3" data-a="o-addr" data-c="op" data-d="${esc(d)}">${ic('plus')}${esc(d)} <span class="n">prevista</span></button>`).join('')}<span class="sp"></span><span class="sm" title="Registrala con la velocidad de las ráfagas en km/h cuando superan 60 km/h y se suspenden izajes o trabajos en altura. La operadora la reconoce como tiempo no imputable a la cuadrilla.">${ic('wind')} Parada por viento: con ráfagas de más de 60 km/h</span></div></div>`;
}
function stCierre(p,e){
  const c=checks(p),s=sums(p),t=trab(p.pl),lastDay=p.dia>=t.dias-1;
  const list=c.length?c.map(([l,m,sec])=>`<div class="chk ${l}">${ic(l==='err'?'err':'alert')}<span>${esc(m)}</span>${sec!=='Cierre'?`<button class="go" data-a="o-step" data-i="${STEP_OF[sec]}">Ir a ${STEPS[STEP_OF[sec]]}</button>`:''}</div>`).join(''):`<div class="chk ok">${ic('okc')}<span>Todo completo. El parte está listo para enviar.</span></div>`;
  const ne=c.filter(x=>x[0]==='err').length,nw=c.length-ne;
  const ai=autoIni(e),af=autoFin(e);
  const hrows=e.personal.map((x,i)=>{if(!x.pres)return '';const man=pManual(x),d=pDur(e,x);
    return `<div class="hrow${man?' man':''}"><span class="nm"><b>${esc(x.n)}</b><small>${man?'Ajustado a mano':'Automático'}</small></span><span class="hl">Inicio</span>${tin(`e:personal.${i}.ini`,pIni(e,x),false,'Inicio de '+x.n)}<span class="hl">Fin</span>${tin(`e:personal.${i}.fin`,pFin(e,x),false,'Fin de '+x.n)}<b class="hh${d>720?' warn':''}">${d?fmtH(d):'—'}</b>${man?`<button class="ibtn xs" data-a="o-pauto" data-i="${i}" title="Volver al horario automático" aria-label="Volver al horario automático de ${esc(x.n)}">${ic('refresh')}</button>`:'<span class="w28"></span>'}</div>`}).join('');
  const horario=`<div class="pnl hsum"><div class="hhead"><h3>${ic('clock')}Horario del personal</h3><span class="sm">${ai&&af?`De la llegada (${ai}) al último tramo en la locación (${af}). Si alguien llegó o se fue en otro horario, ajustalo.`:'Se calcula solo con la llegada y los tramos del día.'}</span><span class="sp"></span><span class="hstat"><b>${s.pers}</b> personas · <b>${fmtH(s.hh)}</b> hombre · <b>${fmtH(s.jor)}</b> registradas · <b>${num(s.km)}</b> km</span></div><div class="hgrid">${hrows||'<div class="sm">No hay personal presente.</div>'}</div></div>`;
  const fotos=e.fotos.map((f,i)=>{const src=fotoSrc(f);return `<div class="thumb${src?'':' ph'}">${src?`<img src="${src}" alt="${esc(f.cap)}">`:''}<span class="cap">${esc(f.cap)}</span><button class="x" data-a="o-delf" data-i="${i}" aria-label="Quitar foto">${ic('x')}</button></div>`}).join('');
  const tt=trabTotals(t,p);
  const fin=`<div class="pnl"><h3>${ic('flag')}Al terminar el día<span class="sp"></span><span class="sm">${p.pl} · día ${p.dia+1} de ${t.dias}</span></h3>
    <div class="finseg"><button class="finopt" data-a="o-fin" data-v="sigue" aria-pressed="${p.fin==='sigue'}"${lastDay?' disabled':''}>Continúa mañana<small>${lastDay?'Es el último día':'Quedan '+(t.dias-p.dia-1)+' día(s)'}</small></button>
    <button class="finopt" data-a="o-fin" data-v="fin" aria-pressed="${p.fin==='fin'}">Trabajo terminado<small>${lastDay?'Cierre total':'Cierra antes'}</small></button>
    <button class="finopt" data-a="o-fin" data-v="ext" aria-pressed="${p.fin==='ext'}">Más días<small>Lo aprueba planificación</small></button></div>
    ${p.fin==='fin'?`<div class="lab" style="margin-top:12px">Cierre total · ${tt.dias} día(s) · ${fmtH(tt.hh)} hombre</div><div class="sm">${tt.prod.map(x=>`<b>${esc(x.d)}</b> ${num(x.q)} ${esc(x.u)}`).join(' · ')||'Sin producción cargada'}</div>
      ${!lastDay?`<div class="infobox w" style="margin-top:8px">${ic('alert')}<div>Se cierra ${t.dias-p.dia-1} día(s) antes de lo planificado. ${esc(recOf(p.rec).n)} queda libre desde el ${fDay(addDays(p.fecha,1))}.</div></div>`:''}
      <div class="fld" style="margin-top:8px"><label for="f-cobs">Observación final del trabajo</label><textarea class="inp" id="f-cobs" data-bind="p:cierreObs" rows="2" placeholder="Cómo queda la locación, pendientes, conformidad del supervisor…">${esc(p.cierreObs)}</textarea></div>`:''}
    ${p.fin==='ext'?`<div class="extrow"><div class="fld"><span class="lab">Días extra</span><div class="stepper"><button data-a="o-extd" data-d="-1"${(p.ext.dias||1)<=1?' disabled':''} aria-label="Un día menos">−</button><b>${p.ext.dias} día${p.ext.dias>1?'s':''}</b><button data-a="o-extd" data-d="1" aria-label="Un día más">+</button></div></div><div class="fld"><label for="f-extm">Motivo</label><input class="inp${!p.ext.motivo.trim()?' bad':''}" id="f-extm" data-bind="p:ext.motivo" data-rr value="${esc(p.ext.motivo)}" placeholder="Qué falta y por qué"></div></div>`:''}
  </div>`;
  return `${horario}
  <div class="g3 fill">
    <div class="pnl col"><h3>Controles antes de enviar<span class="sp"></span>${ne?`<span class="flag err">${ne} pendiente${ne>1?'s':''}</span>`:`<span class="flag ok">${ic('check')}Se puede enviar</span>`}${nw?`<span class="flag warn">${nw} alerta${nw>1?'s':''}</span>`:''}</h3><div class="body" data-keep="c">${list}</div></div>
    <div class="stack scrolly" data-keep="c2">${fin}
      <div class="pnl"><h3>Observaciones del día</h3><textarea class="inp" id="f-obs" data-bind="e:obs" rows="3" placeholder="Demoras, incidentes, pedidos de la operadora…">${esc(e.obs)}</textarea></div>
    </div>
    <div class="stack scrolly" data-keep="c3">
      <div class="pnl"><h3>${ic('cam')}Fotos<span class="sp"></span><span class="sm">${e.fotos.length?e.fotos.length+' en el parte':'Opcional'}</span></h3><div class="thumbs t4" data-keep="f">${fotos}<label class="upl">${ic('cam')}Sacar foto<input type="file" accept="image/*" capture="environment" class="f-foto"></label><label class="upl">${ic('plus')}Desde la galería<input type="file" accept="image/*" multiple class="f-foto"></label></div></div>
      <div class="pnl"><h3>${ic('sign')}Firma del jefe de cuadrilla<span class="sp"></span><span class="sm">${esc(jefeP(p))}</span></h3><div class="sigwrap"><canvas class="sig mid" data-sig="op" width="760" height="260" aria-label="Firmá con el dedo"></canvas>${e.firma?`<button class="ibtn del" data-a="o-sigclear" aria-label="Borrar firma">${ic('trash')}</button>`:'<span class="hint">Firmá con el dedo dentro del recuadro</span>'}</div></div>
    </div>
  </div>`;
}
