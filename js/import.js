/* ---------- importación de datos maestros (JSON o plantilla Excel) ---------- */
const cliCode=name=>{const m=String(name).match(/\(([^)]+)\)/);return m?m[1].trim().toUpperCase():norm(name).toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'')||'CLIENTE'};
const cliName=name=>String(name).replace(/\s*\([^)]*\)\s*/,' ').trim()||String(name);
const splitL=v=>String(v??'').split(/[;\n]/).map(s=>s.trim()).filter(Boolean);
const asObj=(x,key)=>x&&typeof x==='object'?x:{[key]:x};
const isInv=x=>!!x&&typeof x==='object'&&/invent/i.test(String(x.origen||''));
const parseCC=s=>{s=String(s||'').trim();const ix=s.indexOf(' - ');return ix>0?[s.slice(0,ix).trim(),s.slice(ix+3).trim()]:[s,s]};
const IMP_RE=/^[A-Z0-9][A-Z0-9.\-]*$/;

/* Un contrato con dos números ("1000001 / 1000002") se separa en dos contratos con los mismos datos */
function splitDoubles(contratos,W){
  Object.keys(contratos).forEach(k=>{const parts=k.split('/').map(s=>s.trim()).filter(Boolean);if(parts.length<2)return;
    const c=contratos[k];delete contratos[k];const made=[];
    parts.forEach(n=>{if(contratos[n]){W.push(['warn',`Contrato ${n}: ya existía, no se duplicó al separar "${k}".`]);return}contratos[n]=JSON.parse(JSON.stringify(c));made.push(n)});
    W.push(['warn',`El contrato "${k}" tenía dos números: se separó en ${made.join(' y ')} con los mismos datos. Revisá qué imputaciones, tareas y equipos corresponden a cada uno.`])});
}
function finishCat(o){
  const {clientes,contratos,equipos,personal,cuadrillas,hab,habLoaded,W,file,sups,rts}=o;
  splitDoubles(contratos,W);
  Object.values(contratos).forEach(c=>{if(!c.ccs||!c.ccs.length)c.ccs=[[c.cc,c.ccn]];c.cc=c.ccs[0][0];c.ccn=c.ccs[0][1]});
  const inv=o.inv||{};const invTxt=[['tareas','tareas'],['equipos','equipos'],['personas','personas'],['ubicaciones','ubicaciones'],['imputaciones','imputaciones'],['cuadrillas','cuadrillas']].filter(([k])=>inv[k]).map(([k,l])=>`${inv[k]} ${l}`);
  if(invTxt.length)W.push(['info',`Datos inventados para probar (marcados con origen "inventado"): ${invTxt.join(', ')}. Se ven con la etiqueta "inventado" en Configuración.`]);
  const ccUse={};Object.entries(contratos).forEach(([k,c])=>c.ccs.forEach(([cc,cn])=>{const key=cc+' - '+cn;(ccUse[key]=ccUse[key]||[]).push(k)}));
  Object.entries(ccUse).forEach(([cc,ks])=>{const ops=new Set(ks.map(k=>contratos[k].op));if(ops.size>1)W.push(['info',`El centro de costo ${cc} se usa en contratos de distintos clientes: ${ks.sort(natCmp).join(', ')}.`])});
  Object.keys(contratos).sort(natCmp).forEach(k=>{const c=contratos[k];
    c.imps.forEach(([i])=>{if(!IMP_RE.test(i))W.push(['warn',`Contrato ${k}: "${i}" no parece un código de imputación.`])});
    if(!c.imps.length){c.imps=[['SIN-IMPUTACION','Completar']];W.push(['warn',`Contrato ${k}: no tiene imputaciones.`])}
    if(!c.ubic.length)W.push(['warn',`Contrato ${k}: no tiene ubicaciones cargadas.`]);
    if(!c.tareas.length)W.push(['warn',`Contrato ${k}: no tiene tareas cargadas.`]);
  });
  const tsu=Object.values(contratos).reduce((n,c)=>n+c.tareas.filter(t=>!t[1]).length,0);
  if(tsu)W.push(['warn',`${tsu} tareas sin unidad de medida (m³, viaje, h…). Completalas en Configuración o en la plantilla Excel.`]);
  if(!Object.values(contratos).some(c=>c.tareas.some(t=>t[2])))W.push(['info','Las tareas no indican qué tipo de equipo las hace. Se puede completar en la columna "Categoría de equipo" de la plantilla.']);
  const semis={};Object.keys(equipos).forEach(k=>{const m=k.match(/semi\s*(\d+)/i);if(m)(semis[m[1]]=semis[m[1]]||[]).push(k)});
  Object.entries(semis).forEach(([s,a])=>{if(a.length>1)W.push(['warn',`El semi ${s} figura con ${a.length} tractores distintos: ${a.join(' y ')}.`])});
  const sinLeg=personal.filter(p=>!p.leg);if(sinLeg.length)W.push(['warn',`${sinLeg.length} personas sin legajo: ${sinLeg.map(p=>p.n).join(', ')}.`]);
  personal.forEach(p=>{if(p.leg&&equipos[p.leg])W.push(['warn',`${p.n}: el legajo ${p.leg} coincide con el interno ${p.leg} (${equipos[p.leg]}). Revisá si es el legajo o el equipo que maneja.`])});
  const seen={};personal.forEach(p=>{const k=norm(p.n);if(seen[k])W.push(['warn',`Persona repetida: ${p.n}.`]);seen[k]=1});
  if(!cuadrillas.length){
    Object.keys(contratos).sort(natCmp).forEach(k=>{const c=contratos[k];const id='CU-'+String(cuadrillas.length+1).padStart(2,'0');const words=norm(c.ccn).split(/[^a-z]+/).filter(w=>w.length>4);
      const pers=personal.filter(p=>!cuadrillas.some(x=>x.pers.includes(p.n))&&words.some(w=>norm(p.rol).includes(w))).map(p=>p.n);
      cuadrillas.push({id,n:'Cuadrilla '+c.ccn,k:'Cuadrilla',pers,eqs:c.eqs.slice()});c.recs=[id]});
    W.push(['info',`No vienen cuadrillas: se crearon ${cuadrillas.length} provisorias, una por contrato, con sus equipos. Editalas en Configuración → Cuadrillas.`]);
  }
  const vac=cuadrillas.filter(x=>!x.pers.length);if(vac.length)W.push(['warn',`${vac.length} cuadrillas sin personal: ${vac.map(x=>x.n).join(', ')}. Asignalo en Configuración → Cuadrillas.`]);
  Object.entries(contratos).forEach(([k,c])=>{if(!c.recs.length){c.recs=cuadrillas.map(x=>x.id);W.push(['warn',`Contrato ${k}: no tiene cuadrillas asignadas; se habilitaron todas.`])}});
  if(!habLoaded)W.push(['info','No vienen habilitaciones: se muestran como "Sin dato" y no bloquean el parte hasta que se carguen.']);
  const nCt=op=>Object.values(contratos).filter(c=>c.op===op).length,ops=Object.keys(clientes).sort((a,b)=>nCt(b)-nCt(a)),opCrew=cuadrillas.find(x=>x.pers.length)||cuadrillas[0];
  const sp=sups.length?sups:personal.filter(p=>/supervisor/i.test(p.rol)).map(p=>p.n);
  return {cat:{src:'import',file,at:TODAY,by:meN(),clientes,cuadrillas,personal,equipos,eqInv:o.eqInv||[],km0:o.km0||{},sups:sp,rts:rts||[],habLoaded,
      cliUser:{n:'Cliente de prueba',id:'cliente',op:ops[0]},opUser:{n:opCrew&&opCrew.pers[0]||'Operador de prueba',id:opCrew&&opCrew.pers[0]?userOf(opCrew.pers[0]):'operador',rec:opCrew?opCrew.id:''},warns:W},
    contratos,hab};
}
function fromJson(j,file){
  const W=[],clientes={},contratos={},equipos={},personal=[],cuadrillas=[],hab={},km0={},eqInv=[],inv={tareas:0,equipos:0,personas:0,ubicaciones:0,imputaciones:0,cuadrillas:0};
  ((j.metadatos&&j.metadatos.notas)||[]).forEach(n=>W.push(['info',String(n)]));
  (j.clientes||[]).forEach(c=>{const k=String(c.codigo||cliCode(c.nombre||'')).trim();clientes[k]={n:String(c.nombre||k).trim(),sup:String(c.supervisor||'').trim()}});
  const findCli=v=>Object.keys(clientes).find(k=>norm(k)===norm(v)||norm(clientes[k].n)===norm(v));
  const cliOf=v=>{const s=String(v||'Cliente').trim(),f=findCli(s);if(f)return f;const k=cliCode(s);if(!clientes[k]){clientes[k]={n:cliName(s),sup:''};if(/\//.test(s))W.push(['warn',`Cliente "${s}": se tomó como cliente aparte. ¿Es otro cliente o una operación de ${s.split('/')[0].trim()}?`])}return k};
  (j.contratos||[]).forEach((c,ci)=>{
    const op=cliOf(c.cliente),num=String(c.numero_contrato||c.id||('CT-'+(ci+1))).trim();
    const ccl=(Array.isArray(c.centros_costo)?c.centros_costo:[c.centro_costo]).filter(Boolean).map(parseCC);if(!ccl.length)ccl.push(['','']);
    const eqs=[];
    (c.equipos||[]).forEach(e=>{const cat=String(e.categoria||'Equipo').trim(),raw=String(e.interno||'').trim();
      const parts=raw.includes(',')?raw.split(',').map(s=>s.trim()).filter(Boolean):[raw];
      if(parts.length>1)W.push(['info',`${cat}: se separaron ${parts.length} unidades que venían en un solo campo.`]);
      parts.forEach(code=>{if(!code)return;if(equipos[code]&&equipos[code]!==cat)W.push(['warn',`Interno ${code} figura como ${equipos[code]} y como ${cat}.`]);equipos[code]=cat;if(!eqs.includes(code))eqs.push(code);
        if(isInv(e)&&!eqInv.includes(code)){eqInv.push(code);inv.equipos++}if(Number(e.km)>0)km0[code]=Number(e.km)})});
    const ubic=[];(c.ubicaciones||[]).forEach(u=>{const o=asObj(u,'nombre'),s=String(o.nombre||'').trim();if(s&&!ubic.includes(s)){ubic.push(s);if(isInv(o))inv.ubicaciones++}});
    const tareas=(c.tareas||[]).map(t=>{const o=asObj(t,'nombre');if(isInv(o))inv.tareas++;return [String(o.nombre||'').trim(),String(o.unidad||'').trim(),String(o.equipo||o.categoria_equipo||'').trim(),isInv(o)?'inv':'']}).filter(t=>t[0]);
    const imps=(c.imputaciones||[]).map(x=>{const o=asObj(x,'codigo');if(isInv(o))inv.imputaciones++;return [String(o.codigo||'').trim(),String(o.descripcion||'').trim(),isInv(o)?'inv':'']}).filter(x=>x[0]);
    contratos[num]={op,n:String(c.descripcion||ccl[0][1]||num).trim(),cc:ccl[0][0],ccn:ccl[0][1],ccs:ccl,recs:[],imps,ubic,tareas,eqs};
  });
  (j.personal_nominado||j.personal||[]).forEach(p=>{const leg=String(p.legajo??'').trim(),o={n:String(p.nombre||'').trim(),leg:/^(n\/?a|-|)$/i.test(leg)?'':leg,rol:String(p.rol||'').trim()};if(isInv(p)){o.inv=true;inv.personas++}if(o.n)personal.push(o)});
  (j.cuadrillas||[]).forEach((x,i)=>{const id=String(x.codigo||('CU-'+String(i+1).padStart(2,'0'))).trim(),cu={id,n:String(x.nombre||id).trim(),k:String(x.tipo||'Cuadrilla').trim(),pers:[],eqs:[]};
    (x.personal||[]).forEach(n=>{n=String(n).trim();if(!personal.some(p=>p.n===n))W.push(['warn',`Cuadrilla ${id}: "${n}" no está en el personal.`]);else if(cuadrillas.some(y=>y.pers.includes(n)))W.push(['warn',`${n} figura en más de una cuadrilla; quedó en la primera.`]);else cu.pers.push(n)});
    (x.equipos||[]).forEach(e=>{e=String(e).trim();if(equipos[e])cu.eqs.push(e);else W.push(['warn',`Cuadrilla ${id}: el interno "${e}" no está cargado.`])});
    (x.contratos||[]).forEach(k=>{k=String(k).trim();if(contratos[k])contratos[k].recs.push(id);else W.push(['warn',`Cuadrilla ${id}: el contrato "${k}" no existe.`])});
    if(isInv(x)){cu.inv=true;inv.cuadrillas++}cuadrillas.push(cu)});
  let habLoaded=false;const hd=j.habilitaciones_por_defecto;
  if(hd&&hd.vence){habLoaded=true;
    cuadrillas.forEach(cu=>{const ops=[...new Set(Object.values(contratos).filter(c=>c.recs.includes(cu.id)).map(c=>c.op))];ops.forEach(op=>[...cu.pers,...cu.eqs].forEach(s=>{hab[s+'|'+op]={vence:hd.vence}}))});
    Object.values(contratos).forEach(c=>c.eqs.forEach(e=>{if(!hab[e+'|'+c.op])hab[e+'|'+c.op]={vence:hd.vence}}));
    if(isInv(hd))W.push(['info','Las habilitaciones son inventadas para probar los controles: reemplazalas por las reales cuando las tengas.'])}
  (j.habilitaciones||[]).forEach(h=>{habLoaded=true;const s=String(h.sujeto||'').trim(),op=findCli(h.cliente);if(!s||!op){W.push(['warn',`Habilitación sin persona/interno o con cliente desconocido: ${s||'?'} · ${h.cliente||'?'}.`]);return}
    if(h.vence)hab[s+'|'+op]={vence:String(h.vence).slice(0,10)};else delete hab[s+'|'+op]});
  const rs=j.responsables||{};
  return finishCat({clientes,contratos,equipos,personal,cuadrillas,hab,habLoaded,W,file,sups:(rs.supervisores||[]).map(String),rts:(rs.tecnicos||[]).map(String),km0,inv,eqInv});
}
function fromXlsx(wb,file){
  const W=[],sh=n=>{const k=wb.SheetNames.find(x=>norm(x)===norm(n));return k?XLSX.utils.sheet_to_json(wb.Sheets[k],{defval:''}):[]};
  const col=(r,...names)=>{for(const n of names){const k=Object.keys(r).find(x=>norm(x)===norm(n));if(k!=null&&String(r[k]).trim()!=='')return r[k]}return ''};
  const clientes={},contratos={},equipos={},personal=[],cuadrillas=[],hab={},km0={};
  sh('Clientes').forEach(r=>{const c=String(col(r,'Código')).trim();if(c)clientes[c]={n:String(col(r,'Nombre')||c).trim(),sup:String(col(r,'Supervisor que firma permisos')).trim()}});
  sh('Contratos').forEach(r=>{const num=String(col(r,'Nº contrato','N° contrato','Contrato')).trim();if(!num)return;const op=String(col(r,'Cliente')).trim();
    if(op&&!clientes[op]){clientes[op]={n:op,sup:''};W.push(['warn',`Contrato ${num}: el cliente "${op}" no está en la hoja Clientes; se agregó.`])}
    contratos[num]={op,n:String(col(r,'Descripción')||col(r,'Nombre del centro de costo')||num).trim(),cc:String(col(r,'Centro de costo')).trim(),ccn:String(col(r,'Nombre del centro de costo')).trim(),recs:[],imps:[],ubic:[],tareas:[],eqs:[]}});
  const ctOf=(r,where)=>{const k=String(col(r,'Nº contrato','N° contrato','Contrato')).trim();if(!contratos[k]){if(k)W.push(['warn',`${where}: el contrato "${k}" no existe en la hoja Contratos; se ignoró la fila.`]);return null}return contratos[k]};
  const inv={tareas:0,equipos:0,personas:0,imputaciones:0,cuadrillas:0},eqInv=[],invR=r=>/invent/i.test(String(col(r,'Origen')));
  sh('Centros de costo').forEach(r=>{const c=ctOf(r,'Centros de costo');const cd=String(col(r,'Código')).trim();if(!c||!cd)return;c.ccs=c.ccs||[];if(!c.ccs.some(x=>x[0]===cd&&x[1]===String(col(r,'Nombre')).trim()))c.ccs.push([cd,String(col(r,'Nombre')).trim()])});
  sh('Imputaciones').forEach(r=>{const c=ctOf(r,'Imputaciones');const cd=String(col(r,'Código')).trim();if(c&&cd){c.imps.push([cd,String(col(r,'Descripción')).trim(),invR(r)?'inv':'']);if(invR(r))inv.imputaciones++}});
  sh('Ubicaciones').forEach(r=>{const c=ctOf(r,'Ubicaciones');const u=String(col(r,'Ubicación')).trim();if(c&&u&&!c.ubic.includes(u))c.ubic.push(u)});
  sh('Tareas').forEach(r=>{const c=ctOf(r,'Tareas');const t=String(col(r,'Tarea')).trim();if(c&&t){c.tareas.push([t,String(col(r,'Unidad')).trim(),String(col(r,'Categoría de equipo')).trim(),invR(r)?'inv':'']);if(invR(r))inv.tareas++}});
  sh('Cuadrillas').forEach(r=>{const id=String(col(r,'Código')).trim();if(!id)return;const cu={id,n:String(col(r,'Nombre')||id).trim(),k:String(col(r,'Tipo')||'Cuadrilla').trim(),pers:[],eqs:[]};if(invR(r)){cu.inv=true;inv.cuadrillas++}cuadrillas.push(cu);splitL(col(r,'Contratos')).forEach(k=>{if(contratos[k])contratos[k].recs.push(id);else W.push(['warn',`Cuadrilla ${id}: el contrato "${k}" no existe.`])})});
  const cuOf=(v,who)=>{const k=String(v).trim();if(!k)return null;const c=cuadrillas.find(x=>x.id===k||norm(x.n)===norm(k));if(!c)W.push(['warn',`${who}: la cuadrilla "${k}" no existe en la hoja Cuadrillas.`]);return c};
  sh('Equipos').forEach(r=>{const code=String(col(r,'Interno')).trim();if(!code)return;if(equipos[code])W.push(['warn',`Interno repetido: ${code}.`]);equipos[code]=String(col(r,'Categoría')||'Equipo').trim();
    splitL(col(r,'Contratos')).forEach(k=>{if(contratos[k]){if(!contratos[k].eqs.includes(code))contratos[k].eqs.push(code)}else W.push(['warn',`Equipo ${code}: el contrato "${k}" no existe.`])});
    const cu=cuOf(col(r,'Cuadrilla'),'Equipo '+code);if(cu)cu.eqs.push(code);const km=Number(col(r,'Km u horómetro actual'));if(km>0)km0[code]=km;if(invR(r)){eqInv.push(code);inv.equipos++}});
  sh('Personal').forEach(r=>{const n=String(col(r,'Nombre')).trim();if(!n)return;const o={n,leg:String(col(r,'Legajo')).trim(),rol:String(col(r,'Rol')).trim()};if(invR(r)){o.inv=true;inv.personas++}personal.push(o);const cu=cuOf(col(r,'Cuadrilla'),n);if(cu)cu.pers.push(n)});
  const hs=sh('Habilitaciones');hs.forEach(r=>{const s=String(col(r,'Persona o interno')).trim(),op=String(col(r,'Cliente')).trim();let v=col(r,'Vence');if(!s||!op)return;
    if(v instanceof Date)v=iso(v);else{const m=String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);v=m?`${m[3].length===2?'20'+m[3]:m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:String(v).slice(0,10)}
    if(!equipos[s]&&!personal.some(p=>p.n===s))W.push(['warn',`Habilitación de "${s}": no es una persona ni un interno cargado.`]);if(/^\d{4}-\d{2}-\d{2}$/.test(v))hab[s+'|'+op]={vence:v}});
  const resp=sh('Responsables');const sups=resp.filter(r=>/super/i.test(col(r,'Tipo'))).map(r=>String(col(r,'Nombre')).trim()).filter(Boolean),rts=resp.filter(r=>/t[eé]cnico/i.test(col(r,'Tipo'))).map(r=>String(col(r,'Nombre')).trim()).filter(Boolean);
  if(!Object.keys(contratos).length)throw new Error('La plantilla no tiene contratos: revisá la hoja "Contratos".');
  return finishCat({clientes,contratos,equipos,personal,cuadrillas,hab,habLoaded:hs.length>0,W,file,sups,rts,km0,inv,eqInv});
}
function templateBlob(){
  const C=S.contratos,ks=ctKeys(),cat=S.cat,crewOfP=n=>(cat.cuadrillas.find(x=>x.pers.includes(n))||{}).id||'',crewOfE=c=>(cat.cuadrillas.find(x=>x.eqs.includes(c))||{}).id||'';
  const ctsOfE=c=>ks.filter(k=>(C[k].eqs||[]).includes(c)).join('; ');
  const og=x=>x?'Inventado':'Real';
  const hrows=Object.entries(S.hab).map(([k,v])=>{const[s,op]=k.split('|');return [s,op,xd(v.vence)]});
  return xlsxBlob([
    ['Clientes',[['Código','Nombre','Supervisor que firma permisos'],...Object.entries(cat.clientes).map(([k,v])=>[k,v.n,v.sup||''])],[12,34,30]],
    ['Contratos',[['Nº contrato','Cliente','Descripción','Centro de costo','Nombre del centro de costo'],...ks.map(k=>{const c=C[k];return [k,c.op,c.n,c.cc,c.ccn]})],[20,12,40,14,36]],
    ['Centros de costo',[['Nº contrato','Código','Nombre'],...ks.flatMap(k=>(C[k].ccs||[[C[k].cc,C[k].ccn]]).map(x=>[k,x[0],x[1]]))],[20,10,36]],
    ['Imputaciones',[['Nº contrato','Código','Descripción','Origen'],...ks.flatMap(k=>C[k].imps.map(i=>[k,i[0],i[1],og(i[2])]))],[20,24,40,11]],
    ['Ubicaciones',[['Nº contrato','Ubicación'],...ks.flatMap(k=>(C[k].ubic||[]).map(u=>[k,u]))],[20,40]],
    ['Tareas',[['Nº contrato','Tarea','Unidad','Categoría de equipo','Origen'],...ks.flatMap(k=>C[k].tareas.map(t=>[k,t[0],t[1]||'',t[2]||'',og(t[3])]))],[20,44,10,26,11]],
    ['Equipos',[['Interno','Categoría','Contratos','Cuadrilla','Km u horómetro actual','Origen'],...Object.entries(cat.equipos).map(([k,d])=>[k,d,ctsOfE(k),crewOfE(k),cat.km0&&cat.km0[k]?cat.km0[k]:'',og((cat.eqInv||[]).includes(k))])],[16,28,40,12,20,11]],
    ['Personal',[['Nombre','Legajo','Rol','Cuadrilla','Origen'],...cat.personal.map(p=>[p.n,p.leg||'',p.rol||'',crewOfP(p.n),og(p.inv)])],[32,10,28,12,11]],
    ['Cuadrillas',[['Código','Nombre','Tipo','Contratos','Origen'],...cat.cuadrillas.map(x=>[x.id,x.n,x.k||'Cuadrilla',ks.filter(k=>C[k].recs.includes(x.id)).join('; '),og(x.inv)])],[10,36,14,50,11]],
    ['Habilitaciones',[['Persona o interno','Cliente','Vence'],...hrows],[32,12,12]],
    ['Responsables',[['Tipo','Nombre'],...SUPS.map(n=>['Supervisor',n]),...RTS.map(n=>['Responsable técnico',n])],[22,32]],
    ['Instrucciones',[['Cómo completar la plantilla'],['Cada hoja es una tabla. Los códigos (Nº contrato, Código de cliente, Código de cuadrilla, Interno) vinculan las hojas entre sí.'],['Un contrato por fila y un solo número por contrato. Si dos números comparten datos, cargalos como dos contratos.'],['En las columnas "Contratos" se pueden poner varios valores separados por punto y coma (;).'],['Unidades sugeridas: m³, m², m, t, km, viaje, maniobra, h, día, unidad.'],['Centros de costo: un contrato puede tener varios; al planificar se elige cuál usar. El primero de la lista es el que se propone.'],['Imputaciones: código de cuenta del cliente (sin espacios) y una descripción.'],['Origen: "Real" o "Inventado". Lo inventado es para probar la app y hay que reemplazarlo por datos reales.'],['Categoría de equipo en Tareas: indica qué tipo de equipo hace la tarea (debe coincidir con la Categoría de la hoja Equipos). Vacío = cualquier equipo.'],['Vence en Habilitaciones: fecha en formato dd/mm/aaaa. Si la hoja queda vacía, las habilitaciones se muestran como "Sin dato".'],['Después de completarla: Configuración → Datos maestros → Importar archivo.']],[110]]
  ]);
}
function catCounts(cat,C,hab){const v=Object.values(C);return [['Clientes',Object.keys(cat.clientes).length],['Contratos',v.length],['Imputaciones',v.reduce((n,c)=>n+c.imps.length,0)],['Ubicaciones',v.reduce((n,c)=>n+(c.ubic||[]).length,0)],['Tareas',v.reduce((n,c)=>n+c.tareas.length,0)],['Cuadrillas',cat.cuadrillas.length],['Personas',cat.personal.length],['Equipos',Object.keys(cat.equipos).length],['Habilitaciones',cat.habLoaded?Object.keys(hab).length:'Sin datos'],['Tareas sin unidad',v.reduce((n,c)=>n+c.tareas.filter(t=>!t[1]).length,0)]]}
