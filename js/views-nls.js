/* ---------- NLS: novedades de liquidación de sueldos (interno: planner y administración) ---------- */
/* Una fila por novedad cargada a una persona en un parte, con los filtros aplicados. Cantidad = veces que se cargó */
function nlRows(){
  const cat=novCat(),ti=c=>(cat.find(x=>x.c===c)||{}).t||'liq',cf=S.ncod,out=[];
  S.partes.forEach(p=>{
    if((S.nfrom&&p.fecha<S.nfrom)||(S.nto&&p.fecha>S.nto)||(S.nop!=='all'&&p.op!==S.nop)||(S.nct!=='all'&&p.ct!==S.nct)||(S.nrec!=='all'&&p.rec!==S.nrec)||(S.nest!=='all'&&p.estado!==S.nest))return;
    Object.entries(p.nov||{}).forEach(([n,cs])=>cs.forEach(c=>{const t=ti(c);if(cf==='liq'||cf==='aus'?t!==cf:cf!=='all'&&c!==cf)return;out.push({p,n,c,t,v:novV(c)})}));
  });
  return out;
}
const nlSum=(rows,key)=>{const m={};rows.forEach(r=>{const k=key(r),o=m[k]=m[k]||{k,q:0,v:0,liq:0,aus:0,qliq:0,qaus:0,ps:new Set(),ns:new Set(),t:r.t,c:r.c,p:r.p};o.q++;o.v+=r.v;o[r.t]+=r.v;o['q'+r.t]++;o.ps.add(r.p.id);o.ns.add(r.n)});return Object.values(m).sort((a,b)=>b.v-a.v||b.q-a.q||natCmp(a.k,b.k))};
const nlPct=(v,t)=>t?Math.round(v/t*100):0;
const nlLeg=n=>(S.cat.personal.find(x=>x.n===n)||{}).leg||'';

function nlBar(){
  const hasF=S.nfrom||S.nto||S.nop!=='all'||S.nct!=='all'||S.nrec!=='all'||S.ncod!=='all'||S.nest!=='all',cat=novCat();
  const opt=(v,l)=>`<option value="${esc(v)}"${S.ncod===v?' selected':''}>${esc(l)}</option>`;
  const gr=k=>`<optgroup label="${NOVT[k]}">${opt(k,'Todas las de '+NOVT[k].toLowerCase())}${cat.filter(x=>x.t===k).map(x=>opt(x.c,x.c)).join('')}</optgroup>`;
  return `<div class="bar nfil"><label class="dlab" for="n-from">Desde</label><input class="inp dt" type="date" id="n-from" data-bind="s:nfrom" data-rr value="${esc(S.nfrom)}"${S.nto?` max="${S.nto}"`:''}><label class="dlab" for="n-to">Hasta</label><input class="inp dt" type="date" id="n-to" data-bind="s:nto" data-rr value="${esc(S.nto)}"${S.nfrom?` min="${S.nfrom}"`:''}>
    ${selF('n-op','s:nop',opOpts(),S.nop,' aria-label="Cliente"')}${ctSel('n-ct','s:nct',S.nop,S.nct,'Todos los contratos','','Contrato')}${selF('n-rec','s:nrec',[['all','Todas las cuadrillas'],...RECURSOS.map(r=>[r.id,r.n])],S.nrec,' aria-label="Cuadrilla"')}
    <select class="inp" id="n-cod" data-bind="s:ncod" data-rr aria-label="Novedad">${opt('all','Todas las novedades')}${gr('liq')}${gr('aus')}</select>${selF('n-est','s:nest',[['all','Todos los estados'],...Object.entries(EST).filter(([k])=>k!=='plan')],S.nest,' aria-label="Estado del parte"')}${hasF?'<button class="btn sm2 ghost" data-a="nl-clr">Limpiar</button>':''}</div>`;
}
function nlTiles(list){return `<div class="ntiles" style="--n:${list.length}">${list.map(([l,b,s,hl])=>`<div class="dtile${hl?' nhl':''}"><span>${esc(l)}</span><b>${esc(b)}</b><small>${esc(s)}</small></div>`).join('')}</div>`}

/* Columnas apiladas por período: siguen al rango de fechas. Un solo eje, en $ */
function nlCols(rows){
  const f=rows.map(r=>r.p.fecha).sort(),a=S.nfrom||f[0],b=S.nto||f[f.length-1];
  if(!a||!b||a>b)return {lbl:'período',legend:'',html:'<div class="empty">El rango de fechas no es válido.</div>'};
  const span=diffD(a,b)+1,gr=span<=31?'d':span<=186?'w':'m',key=d=>gr==='d'?d:gr==='w'?mondayOf(d):d.slice(0,7);
  const bk=[];for(let d=a,i=0;d<=b&&i<3700;d=addDays(d,1),i++){const k=key(d);if(bk[bk.length-1]!==k)bk.push(k)}
  const g={};bk.forEach(k=>g[k]={liq:0,aus:0});rows.forEach(r=>{const k=key(r.p.fecha);if(g[k])g[k][r.t]+=r.v});
  const tot=k=>g[k].liq+g[k].aus,mx=Math.max(1,...bk.map(tot)),p=10**Math.floor(Math.log10(mx/4||1)),step=[1,2,2.5,5,10].map(m=>m*p).find(s=>s*4>=mx),top=step*4;
  const peak=bk.reduce((x,k)=>tot(k)>tot(x)?k:x,bk[0]),every=Math.ceil(bk.length/(gr==='d'?14:10));
  const dm=d=>{const x=d8(d);return x.getDate()+'/'+(x.getMonth()+1)},lab=k=>gr==='m'?MES[Number(k.slice(5,7))-1]+' '+k.slice(2,4):dm(k),long=k=>gr==='m'?MES[Number(k.slice(5,7))-1]+' '+k.slice(0,4):gr==='w'?'Semana del '+fDay(k):fDay(k);
  const bars=bk.map(k=>{const x=g[k],t=tot(k),tip=[long(k),`Liquidación: ${money(x.liq)}`,`Ausencia: ${money(x.aus)}`,`Total: ${money(t)}`].join('\n');
    return `<div class="b" tabindex="0" data-ttl="${esc(tip)}"><div class="stk" style="height:${t/top*100}%">${t&&k===peak?`<em>${esc(moneyC(t))}</em>`:''}${x.aus?`<i class="aus" style="flex:${x.aus} 0 0"></i>`:''}${x.liq?`<i class="liq" style="flex:${x.liq} 0 0"></i>`:''}</div></div>`}).join('');
  const has=k=>rows.some(r=>r.t===k);
  return {lbl:gr==='d'?'día':gr==='w'?'semana':'mes',
    legend:`<span class="nkey">${has('liq')?'<span><i class="liq"></i>Liquidación</span>':''}${has('aus')?'<span><i class="aus"></i>Ausencia</span>':''}</span>`,
    html:`<div class="barsw ncols"><span class="ytit">Monto en $</span><div class="bars">${[1,.75,.5,.25,0].map(k=>`<div class="gl2" style="bottom:${k*100}%${k?'':';border:0'}"><span>${esc(moneyC(top*k))}</span></div>`).join('')}${bars}</div><div class="xlab">${bk.map((k,i)=>`<span>${i%every===0?esc(lab(k)):''}</span>`).join('')}</div><div class="xtit">${gr==='d'?'Días':gr==='w'?'Semanas, desde el lunes':'Meses'} · del ${fDay(a)} al ${fDay(b)}</div></div>`};
}
/* Torta por cliente (o por contrato si hay un solo cliente). El color sigue a la entidad, no a su puesto */
function nlPie(rows){
  const tot=rows.reduce((a,r)=>a+r.v,0),ops=[...new Set(rows.map(r=>r.p.op))],byCt=ops.length<2,cat=byCt?ctKeys(ops[0]):Object.keys(OPS),name=k=>byCt?k:(OPS[k]||k);
  const g=nlSum(rows,r=>byCt?r.p.ct:r.p.op),main=g.filter(o=>{const i=cat.indexOf(o.k);return i>=0&&i<6}).map(o=>({n:name(o.k),v:o.v,c:`var(--n${cat.indexOf(o.k)+1})`})),rest=g.filter(o=>!main.some(x=>x.n===name(o.k))).reduce((a,o)=>a+o.v,0);
  const parts=main.concat(rest?[{n:'Otros',v:rest,c:'var(--faint)'}]:[]).filter(x=>x.v>0);
  const title=byCt?'Por contrato':'Por cliente';
  if(parts.length<2)return {title,html:`<div class="empty">${tot?`Todo el monto corresponde a ${esc(parts[0].n)}.`:'Sin montos en este período.'}</div>`};
  let acc=0;const gap=parts.length>1?.8:0;
  const arcs=parts.map(x=>{const l=x.v/tot*100,c=`<circle cx="21" cy="21" r="15.915" fill="none" stroke="${x.c}" stroke-width="6.4" stroke-dasharray="${Math.max(.2,l-gap)} ${100-Math.max(.2,l-gap)}" stroke-dashoffset="${25-acc}" data-ttl="${esc(`${x.n}\n${money(x.v)} · ${nlPct(x.v,tot)}%`)}"></circle>`;acc+=l;return c}).join('');
  return {title,html:`<div class="npie"><svg viewBox="0 0 42 42" role="img" aria-label="${title}: ${esc(parts.map(x=>`${x.n} ${nlPct(x.v,tot)}%`).join(', '))}">${arcs}<text x="21" y="20.2" text-anchor="middle" class="t1">Total</text><text x="21" y="24.6" text-anchor="middle" class="t2">${esc(moneyC(tot))}</text></svg>
    <div class="nlegl">${parts.map(x=>`<div><i style="background:${x.c}"></i><span class="nm">${esc(x.n)}<small><b>${esc(moneyC(x.v))}</b> · ${nlPct(x.v,tot)}%</small></span></div>`).join('')}</div></div>`};
}
const nlBarIn=(v,mx)=>`<div class="nbar"><i style="width:${mx?v/mx*100:0}%"></i></div>`;
function nlByCode(rows,tot){const g=nlSum(rows,r=>r.c),mx=g.length?g[0].v:0;
  return `<table class="tbl sticky nrank"><thead><tr><th>Novedad</th><th class="num">Cant.</th><th class="num">Valor</th><th class="num">Monto</th><th class="num">%</th></tr></thead><tbody>${g.map(o=>`<tr><td><b class="mono">${esc(o.k)}</b> <span class="sm">${NOVT[o.t]}</span>${nlBarIn(o.v,mx)}</td><td class="num">${num(o.q)}</td><td class="num nw">${novHasV(o.c)?money(novV(o.c)):'<span class="warn">Sin valor</span>'}</td><td class="num nw"><b>${money(o.v)}</b></td><td class="num">${nlPct(o.v,tot)}%</td></tr>`).join('')}</tbody></table>`}
function nlGen(rows){
  const tot=rows.reduce((a,r)=>a+r.v,0),liq=nlSum(rows.filter(r=>r.t==='liq'),()=>1)[0]||{v:0,q:0},aus=nlSum(rows.filter(r=>r.t==='aus'),()=>1)[0]||{v:0,q:0};
  const ems=nlSum(rows,r=>r.n),ps=new Set(rows.map(r=>r.p.id)).size,cod=new Set(rows.map(r=>r.c)).size,c=nlCols(rows),pie=nlPie(rows);
  const recs=nlSum(rows,r=>r.p.rec),mr=recs.length?recs[0].v:0;
  return nlTiles([['Monto total a pagar',money(tot),`${num(rows.length)} novedades cargadas`,1],['Liquidación',money(liq.v),`${nlPct(liq.v,tot)}% · ${num(liq.q)} novedades`],['Ausencia',money(aus.v),`${nlPct(aus.v,tot)}% · ${num(aus.q)} novedades`],['Tipos de novedad',num(cod),`de ${novCat().length} del catálogo`],['Empleados',num(ems.length),`Promedio ${money(tot/(ems.length||1))} por empleado`],['Partes',num(ps),`Promedio ${money(tot/(ps||1))} por parte`]])+
  `<div class="ngrid fill">
    <div class="pnl col na"><h3>${ic('chart')}Monto por ${c.lbl}<span class="sp"></span>${c.legend}</h3>${c.html}</div>
    <div class="pnl col nb"><h3>${pie.title}</h3>${pie.html}</div>
    <div class="pnl col nc"><h3>${ic('users')}Empleados<span class="sp"></span><span class="sm">Tocá uno para ver el detalle</span></h3><div class="body" data-keep="ne"><table class="tbl sticky nrank"><thead><tr><th>Empleado</th><th class="num">Partes</th><th class="num">Cant.</th><th class="num">Monto</th></tr></thead><tbody>${ems.map(o=>`<tr class="click" data-a="nl-emp" data-n="${esc(o.k)}"><td><b>${esc(o.k)}</b><div class="sm">${esc(homeOf(o.k))}</div>${nlBarIn(o.v,ems[0].v)}</td><td class="num">${o.ps.size}</td><td class="num">${o.q}</td><td class="num nw"><b>${money(o.v)}</b></td></tr>`).join('')}</tbody></table></div></div>
    <div class="pnl col nd"><h3>${ic('wallet')}Por novedad</h3><div class="body" data-keep="nn">${nlByCode(rows,tot)}</div></div>
    <div class="pnl col ne"><h3>${ic('truck')}Por cuadrilla</h3><div class="body" data-keep="nr"><table class="tbl sticky nrank"><thead><tr><th>Cuadrilla</th><th class="num">Cant.</th><th class="num">Monto</th><th class="num">%</th></tr></thead><tbody>${recs.map(o=>`<tr><td><b>${esc(recOf(o.k).n)}</b><div class="sm">${o.ns.size} empleado${o.ns.size>1?'s':''}</div>${nlBarIn(o.v,mr)}</td><td class="num">${o.q}</td><td class="num nw"><b>${money(o.v)}</b></td><td class="num">${nlPct(o.v,tot)}%</td></tr>`).join('')}</tbody></table></div></div>
  </div>`;
}
function nlEmp(rows){
  const q=norm(S.nq),g=nlSum(rows,r=>r.n),list=g.filter(o=>!q||norm(o.k+' '+homeOf(o.k)+' '+nlLeg(o.k)).includes(q)),totAll=rows.reduce((a,r)=>a+r.v,0);
  if(!g.some(o=>o.k===S.nemp))S.nemp=(list[0]||g[0]).k;
  const me=g.find(o=>o.k===S.nemp),mine=rows.filter(r=>r.n===S.nemp),c=nlCols(mine),leg=nlLeg(S.nemp);
  const ps=nlSum(mine,r=>r.p.id).sort((a,b)=>b.p.fecha.localeCompare(a.p.fecha)||natCmp(b.k,a.k));
  const tr=ps.map(o=>{const p=o.p,cs=mine.filter(r=>r.p===p);return `<tr class="click" data-a="sum" data-id="${p.id}"><td class="nw">${fDay(p.fecha)}</td><td class="nw"><span class="mono">${p.id}</span><div class="sm mono">${p.pl}</div></td><td class="nell"><div title="${esc(OPS[p.op]||p.op)}">${esc(OPS[p.op]||p.op)}</div><div class="sm mono">${esc(p.ct)}</div></td><td class="nell"><div title="${esc(locOf(p))}">${esc(locOf(p))}</div></td><td><div class="ntags">${cs.map(r=>`<span class="tag" data-ttl="${esc(`${NOVT[r.t]}: ${novHasV(r.c)?money(r.v):'sin valor'}`)}">${esc(r.c)}</span>`).join('')}</div></td><td class="num">${o.q}</td><td class="num nw"><b>${money(o.v)}</b></td><td>${pill(p.estado)}</td></tr>`}).join('');
  return `<div class="nemp fill"><div class="pnl col nelist"><div class="srch">${ic('search')}<input class="inp" type="search" id="n-q" data-bind="s:nq" data-rr value="${esc(S.nq)}" placeholder="Nombre, cuadrilla o legajo" aria-label="Buscar empleado"></div>
      <div class="body" data-keep="nl">${list.map(o=>`<button class="nerow" data-a="nl-sel" data-n="${esc(o.k)}"${o.k===S.nemp?' aria-current="true"':''}><span class="nm"><b>${esc(o.k)}</b><small>${esc(homeOf(o.k))} · ${o.q} novedad${o.q>1?'es':''}</small></span><b class="m">${money(o.v)}</b></button>`).join('')||'<div class="empty">Ningún empleado coincide con la búsqueda.</div>'}</div></div>
    <div class="nedet"><div class="nehead"><h2>${esc(S.nemp)}</h2><span class="sm">${esc(ROLEP[S.nemp]||'Operario')} · ${esc(homeOf(S.nemp))}${leg?' · legajo '+esc(leg):''}</span></div>
      ${nlTiles([['Monto a pagar',money(me.v),`${nlPct(me.v,totAll)}% del total filtrado`,1],['Novedades',num(me.q),`${me.qliq} de liquidación · ${me.qaus} de ausencia`],['Partes con novedades',num(me.ps.size),`Promedio ${money(me.v/(me.ps.size||1))} por parte`],['Tipos de novedad',num(new Set(mine.map(r=>r.c)).size),`${ps.length?'Último parte: '+fDay(ps[0].p.fecha):''}`]])}
      <div class="cols nech"><div class="pnl col"><h3>Monto por ${c.lbl}<span class="sp"></span>${c.legend}</h3>${c.html}</div><div class="pnl col"><h3>Tipos de novedad y cantidades</h3><div class="body" data-keep="nt">${nlByCode(mine,me.v)}</div></div></div>
      <div class="pnl col fill"><h3>${ic('list')}Partes asociados<span class="sp"></span><span class="sm">${ps.length} partes · tocá uno para abrirlo</span></h3><div class="body" data-keep="np"><table class="tbl sticky nrank"><thead><tr><th>Fecha</th><th>Parte</th><th>Cliente · contrato</th><th>Ubicación</th><th>Novedades</th><th class="num">Cant.</th><th class="num">Monto</th><th>Estado</th></tr></thead><tbody>${tr}</tbody></table></div></div></div></div>`;
}
function vNls(){
  const T=S.ntab==='emp'?'emp':'gen',rows=nlRows(),hay=S.partes.some(p=>novCount(p)),sinV=new Set(rows.filter(r=>!novHasV(r.c)).map(r=>r.c)).size;
  const flags=(S.novvEx?`<span class="flag warn" data-ttl="Son montos inventados para probar. Cargá los reales en Valores por novedad.">${ic('alert')}Montos de ejemplo</span>`:'')+(sinV?`<span class="flag warn" data-ttl="Se cuentan pero no suman plata hasta que les cargues un valor.">${ic('alert')}${sinV} novedad${sinV>1?'es':''} sin valor</span>`:'');
  const empty=hay?'<div class="empty">No hay novedades con estos filtros.</div>':`<div class="empty">Todavía no hay novedades cargadas. Se cargan al aprobar un parte, en su pestaña Novedades.${EVAL?'<div style="margin-top:12px"><button class="btn sm2" data-a="nl-demo">Generar novedades de ejemplo para probar</button></div>':''}</div>`;
  return `<div class="tabrow nhead">${tabsH('ntab',T,[['gen','General','chart'],['emp','Por empleado','users']])}<span class="nflags">${flags}</span><span class="sp"></span><button class="btn sm2" data-a="nl-val">${ic('wallet')}Valores por novedad</button><button class="btn sm2" data-a="xls-nls"${rows.length?'':' disabled'}>${ic('xls')}Exportar a Excel</button></div>
  ${nlBar()}${!rows.length?`<div class="pnl fill nvac">${empty}</div>`:T==='gen'?nlGen(rows):nlEmp(rows)}`;
}
