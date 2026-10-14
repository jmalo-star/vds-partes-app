/* ---------- estado, almacenamiento y reglas del negocio ---------- */
let S=null;
const UI={modal:null,drawer:null,toast:null,login:{u:'',p:'',err:'',show:false,demo:false},vcom:'',verr:'',csig:null,sig:'',admEst:'',newT:{},newI:{},newU:{},tp:{},whyTxt:'',whyFn:null,whyBack:null,editSnap:null,ptPrev:null,imp:null,pop:null,clima:false};
const NET={online:navigator.onLine!==false};

function baseState(){return {user:null,route:'login',back:null,sel:null,step:0,vf:'env',vsel:null,vop:'all',cf:'apr',csel:null,pf:'all',lop:'all',lct:'all',lrec:'all',lq:'',hf:'p',hq:'',hbad:false,pv:'gantt',fop:'all',fct:'all',
  gs:addDays(mondayOf(TODAY),-7),ws:mondayOf(TODAY),ms:TODAY.slice(0,7),dop:Object.keys(OPS)[0],dct:'all',dimp:'all',dfrom:'',dto:'',dtab:'res',itab:'res',ctab:'datos',cct:null,ccu:null,gt:'all',gu:'all',gq:'',rmin:false,simOff:false}}
function fresh(){const cat=demoCat();applyCat(cat);CTS=JSON.parse(JSON.stringify(CONTRATOS0));const s=seed();
  Object.entries(CTS).forEach(([k,c])=>{c.ubic=[...new Set(s.T.filter(t=>t.ct===k).map(locOf))].sort();c.eqs=[...new Set(c.recs.flatMap(r=>VEH[r]||[]))]});
  return Object.assign(baseState(),{v:7,cat,trabajos:s.T,partes:s.P,contratos:CTS,hab:seedHab(),adm:{planner:true,planner2:false},log:seedLog(s.T,s.P)})}
/* Almacenamiento local del dispositivo. Cuando haya backend, load/save pasan a sincronizar con la API. */
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.v===7&&x.cat&&Array.isArray(x.partes)&&Array.isArray(x.trabajos)&&Array.isArray(x.log)){applyCat(x.cat);CTS=x.contratos;migrate(x);return Object.assign(baseState(),x)}}catch(e){}return null}
/* v0.7.1: el personal ya no carga ingreso a base ni horarios: se calculan desde la llegada y los tramos */
function migrate(x){x.partes.forEach(p=>{if(p.ejec)p.ejec.personal.forEach(q=>{if('base' in q){delete q.base;delete q.zona;delete q.out;q.ini=q.ini||'';q.fin=q.fin||''}})});x.trabajos.forEach(t=>{if(t.orden==null)t.orden=0;if(t.hora==null)t.hora=''})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));UI.saveErr=false}catch(e){if(!UI.saveErr){UI.saveErr=true;toast('No queda espacio en el dispositivo para guardar los cambios. Sincronizá o liberá espacio antes de seguir.');setTimeout(render,0)}}}

/* ---------- fotos: se guardan aparte (IndexedDB) para no llenar el almacenamiento del estado ---------- */
const MEDIA={db:null,url:{},pend:{}};
function mediaDB(){if(!MEDIA.db)MEDIA.db=new Promise((res,rej)=>{const r=indexedDB.open('vds-media',1);r.onupgradeneeded=()=>r.result.createObjectStore('fotos');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return MEDIA.db}
const mediaTx=(mode,fn)=>mediaDB().then(db=>new Promise((res,rej)=>{const tx=db.transaction('fotos',mode),st=tx.objectStore('fotos');let out;const q=fn(st);if(q)q.onsuccess=()=>{out=q.result};tx.oncomplete=()=>res(out);tx.onerror=()=>rej(tx.error)}));
const mediaPut=(id,blob)=>mediaTx('readwrite',st=>st.put(blob,id));
const mediaGet=id=>mediaTx('readonly',st=>st.get(id));
const mediaDel=id=>mediaTx('readwrite',st=>st.delete(id)).catch(()=>{});
/* src de una foto para mostrar: las nuevas están en IndexedDB (f.id); las viejas traen f.src */
function fotoSrc(f){if(f.src)return f.src;if(!f.id)return '';if(MEDIA.url[f.id])return MEDIA.url[f.id];
  if(!MEDIA.pend[f.id])MEDIA.pend[f.id]=mediaGet(f.id).then(b=>{if(b){MEDIA.url[f.id]=URL.createObjectURL(b);render()}}).catch(()=>{});return ''}
async function fotoData(f){if(f.src)return f.src;if(!f.id)return null;const b=await mediaGet(f.id).catch(()=>null);if(!b)return null;return new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>res(null);r.readAsDataURL(b)})}
function regenExamples(){const keep={cat:S.cat,contratos:S.contratos,hab:S.hab,adm:S.adm,log:S.log,user:S.user,route:S.route};applyCat(keep.cat);CTS=keep.contratos;const s=exampleSeed();S=Object.assign(baseState(),{v:7},keep,{trabajos:s.T,partes:s.P})}

/* ---------- accesos ---------- */
const CT=id=>S.contratos[id];
const impN=(ct,code)=>{const x=((CT(ct)||{}).imps||[]).find(i=>i[0]===code);return x?x[1]:''};
const impL=(ct,code)=>[code||'—',impN(ct,code)].filter(Boolean).join(' · ');
const byId=id=>S.partes.find(p=>p.id===id);
const trab=id=>S.trabajos.find(t=>t.id===id);
const cur=()=>byId(S.sel);
const unitOf=(ct,d)=>((CT(ct).tareas.find(x=>x[0]===d))||[0,''])[1];
const inCat=(ct,d)=>CT(ct).tareas.some(x=>x[0]===d);
const parteOf=(pl,f)=>S.partes.find(p=>p.pl===pl&&p.fecha===f);
const tDays=t=>Array.from({length:t.dias},(_,i)=>addDays(t.inicio,i));
const tEnd=t=>addDays(t.inicio,t.dias-1);
const covers=(t,f)=>f>=t.inicio&&f<=tEnd(t);
const dayState=(t,f)=>{const p=parteOf(t.id,f);return p?p.estado:'plan'};
function tState(t){const s=tDays(t).map(f=>dayState(t,f));
  if(s.includes('obs'))return 'obs';if(s.includes('curso'))return 'curso';if(s.includes('env'))return 'env';
  if(s.every(x=>x==='cert'))return 'cert';if(!s.includes('plan')&&s.includes('apr'))return 'apr';
  if(s.some(x=>x!=='plan'))return 'curso';return 'plan'}
const minDias=t=>{let m=1;tDays(t).forEach((f,i)=>{if(parteOf(t.id,f))m=i+1});return m};
const started=t=>tDays(t).some(f=>parteOf(t.id,f));
const overl=(a,b)=>a.inicio<=tEnd(b)&&b.inicio<=tEnd(a);
/* Trabajos de la misma cuadrilla en las mismas fechas: se permiten (varios trabajos en el día) y se ordenan */
const clashes=t=>S.trabajos.filter(o=>o!==t&&o.rec===t.rec&&overl(o,t));
const ordKey=t=>[t.orden||9,t.hora||'99:99',t.inicio,t.id].join('|');
const byOrd=(a,b)=>((a.orden||9)-(b.orden||9))||(a.hora||'99:99').localeCompare(b.hora||'99:99')||a.inicio.localeCompare(b.inicio)||a.id.localeCompare(b.id);
const ordTxt=t=>[t.orden?ORDS[t.orden][1]+' del día':'',t.hora?'inicio '+t.hora:''].filter(Boolean).join(' · ');
const fT=()=>S.trabajos.filter(t=>(S.fop==='all'||CT(t.ct).op===S.fop)&&(S.fct==='all'||t.ct===S.fct));
const busy=(rec,f,L)=>(L||S.trabajos).some(t=>t.rec===rec&&covers(t,f));
const occRec=(rec,days,L)=>Math.round(days.filter(f=>busy(rec,f,L)).length/days.length*100);
const occDay=(f,L)=>Math.round(RECURSOS.filter(r=>busy(r.id,f,L)).length/Math.max(1,RECURSOS.length)*100);
const occAll=(days,L)=>Math.round(RECURSOS.reduce((s,r)=>s+days.filter(f=>busy(r.id,f,L)).length,0)/Math.max(1,RECURSOS.length*days.length)*100);
const occC=p=>p>=90?'var(--accent)':p>=50?'var(--st-ok)':p>0?'var(--st-curso)':'var(--faint)';
const nextPD=()=>'PD-'+String(Math.max(0,...S.partes.map(p=>Number(p.id.slice(3))))+1).padStart(4,'0');
/* Contratos ordenados por cliente y número (los números puramente numéricos no quedan primero) */
const ctKeys=op=>Object.keys(S.contratos).filter(k=>!op||op==='all'||CT(k).op===op).sort((a,b)=>natCmp(OPS[CT(a).op]||CT(a).op,OPS[CT(b).op]||CT(b).op)||natCmp(a,b));
/* Centro de costo que corresponde a la cuadrilla según su nombre (Cuadrilla Mantenimiento → 30 - MANTENIMIENTO) */
const ccMatch=(c,rid)=>{const l=c.ccs||[];if(l.length<2)return -1;const r=RECURSOS.find(x=>x.id===rid),w=r?norm(r.n).split(/[^a-z]+/).filter(x=>x.length>4):[];return l.findIndex(x=>w.some(y=>norm(x[1]).includes(y)))};
const ccFor=(ct,rid)=>String(Math.max(0,ccMatch(CT(ct),rid)));

/* ---------- roles y registro ---------- */
const role=()=>S.user&&USERS[S.user]?USERS[S.user].rol:null;
const admOf=k=>!!USERS[k]&&(USERS[k].rol==='admin'||(USERS[k].rol==='planner'&&!!(S.adm||{})[k]));
const isAdm=()=>!!S.user&&admOf(S.user);
const canPlan=()=>role()==='planner'||role()==='admin';
const rolLbl=k=>USERS[k]?ROLE_N[USERS[k].rol]+(USERS[k].rol==='planner'&&admOf(k)?' · admin':''):'';
const meN=()=>S&&USERS[S.user]?USERS[S.user].n:'';
const jefeP=p=>(p.pers&&p.pers[0])||jefeOf(p.rec);
function logA(accion,obj,det,mot,tipo){S.log.push({ts:tsNow(),who:meN()||'—',rol:rolLbl(S.user),accion,obj:obj||'',det:det||'',mot:mot||'',tipo:tipo||'parte'})}
const offline=()=>!NET.online||!!S.simOff;

/* ---------- habilitaciones ---------- */
function hab(s,op,f){const h=S.hab[s+'|'+op];if(!h)return S.cat&&S.cat.habLoaded===false?{st:'nd'}:{st:'sin'};if(h.vence<f)return{st:'venc',vence:h.vence};if(diffD(f,h.vence)<=7)return{st:'pronto',vence:h.vence};return{st:'ok',vence:h.vence}}
const habBad=h=>h.st==='venc'||h.st==='sin';
const habSpan=(s,op,a,b)=>{const x=hab(s,op,a);if(habBad(x))return x;return hab(s,op,b)};
const habTxt=(h,long)=>h.st==='ok'?(long?'Hasta '+fS(h.vence):'Habilitado'):h.st==='pronto'?'Vence '+fS(h.vence):h.st==='venc'?'Vencida '+fS(h.vence):h.st==='nd'?'Sin dato':'Sin habilitación';
const busyRes=(kind,name,days,exceptId)=>S.trabajos.filter(o=>o.id!==exceptId&&(kind==='p'?o.pers:o.eqs).includes(name)&&days.some(d=>covers(o,d))).map(o=>o.id);
const regQ=x=>x.c==='op'&&Number(x.q)>0?num(x.q)+' '+(x.u||''):x.c==='vi'&&Number(x.q)>0?num(x.q)+' km/h':'';

/* ---------- horario del personal: se toma solo de la llegada y de los tramos del día, y se puede ajustar ---------- */
const autoIni=e=>{if(e.llegada)return e.llegada;const r=e.reg.filter(x=>x.c!=='tr'&&mins(x.de)!=null).sort((a,b)=>mins(a.de)-mins(b.de));return r[0]?r[0].de:''};
const autoFin=e=>{const r=e.reg.filter(x=>x.c!=='tr'&&mins(x.a)!=null);return r.length?r.reduce((m,x)=>mins(x.a)>mins(m)?x.a:m,r[0].a):''};
const pIni=(e,x)=>x.ini||x.zona||autoIni(e);
const pFin=(e,x)=>x.fin||x.out||autoFin(e);
const pDur=(e,x)=>{const a=pIni(e,x),b=pFin(e,x);return a&&b?dur(a,b):0};
const pManual=x=>!!(x.ini||x.fin||x.zona||x.out);

/* ---------- reglas del parte ---------- */
function lastKm(c,p){let k=null;S.partes.forEach(o=>{if(o===p||!o.ejec)return;if(p&&(o.fecha>p.fecha||(o.fecha===p.fecha&&o.id>p.id)))return;o.ejec.equipos.forEach(q=>{if(q.c===c&&q.km!==''){const v=Number(q.km);if(k===null||v>k)k=v}})});return k===null?(KM0[c]??null):k}
function prod(p){const r={};(p.ejec?p.ejec.reg:[]).filter(x=>x.c==='op'&&x.d).forEach(x=>{const k=x.d+'|'+x.u;r[k]=r[k]||{d:x.d,u:x.u,q:0};r[k].q+=Number(x.q)||0});return Object.values(r)}
function checks(p){
  const e=p.ejec,out=[];if(!e)return out;
  if(!e.clima||e.clima.t===''||e.clima.r==='')out.push(['err','Faltan las condiciones climáticas','Inicio']);
  if(!(e.check.charla&&e.check.epp))out.push(['err','Checklist de seguridad incompleto','Inicio']);
  if(!e.llegada)out.push(['err','Falta la hora de llegada a la instalación','Inicio']);
  if(p.ptw){const w=e.permiso||{};if(!w.num||!w.firmo||!w.hora)out.push(['err','Falta el permiso de trabajo firmado por la operadora','Inicio'])}
  const pres=e.personal.filter(x=>x.pres);
  if(!pres.length)out.push(['err','No hay personal presente','Personal']);
  pres.forEach(x=>{const h=hab(x.n,p.op,p.fecha);
    if(habBad(h))out.push(['err',`${x.n}: ${h.st==='venc'?'habilitación vencida el '+fS(h.vence):'sin habilitación'} para ${OPS[p.op]}`,'Personal']);
    const d=pDur(e,x);
    if(e.reg.length&&!d)out.push(['warn',`${x.n}: sin horario (falta la llegada o el último tramo del día)`,'Cierre']);
    else if(d>720)out.push(['warn',`${x.n}: jornada de ${fmtH(d)}, supera 12 h`,'Cierre']);
  });
  e.equipos.forEach(q=>{const h=hab(q.c,p.op,p.fecha),pk=lastKm(q.c,p);
    if(habBad(h))out.push(['err',`${q.c} ${EQ[q.c]}: ${h.st==='venc'?'habilitación vencida el '+fS(h.vence):'sin habilitación'} para ${OPS[p.op]}`,'Equipos']);
    if(q.km==='')out.push(['warn',`${q.c}: sin km actual`,'Equipos']);
    else if(pk!==null&&Number(q.km)<pk)out.push(['warn',`${q.c}: el km actual es menor al último registrado (${num(pk)})`,'Equipos']);
  });
  if(!e.reg.length)out.push(['err','No hay tareas ni tiempos registrados','Tareas']);
  const ops=e.reg.filter(x=>x.c==='op');
  if(e.reg.length&&!ops.length)out.push(['warn','No se hizo ninguna tarea operativa en el día','Tareas']);
  ops.forEach(x=>{if(!x.d)out.push(['warn',`Tramo operativo ${x.de}–${x.a} sin tarea`,'Tareas']);else if(!(Number(x.q)>0))out.push(['warn',`${x.d}: sin cantidad`,'Tareas']);else if(!inCat(p.ct,x.d))out.push(['warn',`Tarea fuera del catálogo del contrato: ${x.d}`,'Tareas'])});
  e.reg.filter(x=>x.c==='es'&&!x.d).forEach(x=>out.push(['warn',`Espera ${x.de}–${x.a} sin motivo`,'Tareas']));
  e.reg.filter(x=>x.c==='vi'&&!(Number(x.q)>0)).forEach(x=>out.push(['warn',`Parada por viento ${x.de}–${x.a} sin velocidad registrada`,'Tareas']));
  ops.filter(x=>x.d&&Number(x.q)>0&&!x.u).forEach(x=>out.push(['warn',`${x.d}: falta la unidad de la cantidad`,'Tareas']));
  if([...pres.map(x=>x.n),...e.equipos.map(q=>q.c)].some(s=>hab(s,p.op,p.fecha).st==='nd'))out.push(['warn','No hay datos de habilitación cargados para validar el ingreso de personal y equipos','Personal']);
  const srt=e.reg.slice().sort((a,b)=>mins(a.de)-mins(b.de));
  for(let i=1;i<srt.length;i++){if(mins(srt[i].de)<mins(srt[i-1].a))out.push(['warn',`Tramos superpuestos: ${srt[i-1].de}–${srt[i-1].a} y ${srt[i].de}–${srt[i].a}`,'Tareas'])}
  p.prev.filter(d=>!ops.some(x=>x.d===d)).forEach(d=>out.push(['warn',`Tarea prevista sin informar hoy: ${d}`,'Tareas']));
  if(e.clima&&Number(e.clima.r)>=60&&!e.reg.some(t=>t.c==='vi'))out.push(['warn',`Ráfagas de ${e.clima.r} km/h sin parada por viento registrada`,'Tareas']);
  const esp=e.reg.filter(t=>t.c==='es').reduce((s,t)=>s+dur(t.de,t.a),0);
  if(esp>60)out.push([e.obs.trim()?'warn':'err',`Espera de operadora de ${fmtH(esp)}${e.obs.trim()?' (justificada en observaciones)':': justificar en observaciones'}`,e.obs.trim()?'Tareas':'Cierre']);
  if(!p.sup||!p.rt)out.push(['err','Falta supervisor responsable o responsable técnico','Inicio']);
  const t=trab(p.pl);
  if(p.fin==='sigue'&&t&&p.dia>=t.dias-1)out.push(['err','Es el último día planificado: cerrá el trabajo o pedí más días','Cierre']);
  if(p.fin==='ext'&&(!p.ext||!p.ext.motivo.trim()))out.push(['err','Indicá el motivo para pedir más días','Cierre']);
  if(!e.firma)out.push(['err','Falta la firma del jefe de cuadrilla','Cierre']);
  return out;
}
const errs=p=>checks(p).filter(c=>c[0]==='err');
function sums(p){
  const e=p.ejec||{personal:[],equipos:[],reg:[]};
  const pr=e.personal.filter(x=>x.pres);
  const hh=p.ejec?pr.reduce((s,x)=>s+pDur(e,x),0):0;
  const km=e.equipos.reduce((s,q)=>{const pk=lastKm(q.c,p);return s+(q.km!==''&&pk!==null&&Number(q.km)>=pk?Number(q.km)-pk:0)},0);
  const jor=e.reg.reduce((s,t)=>s+dur(t.de,t.a),0);
  const byc={};e.reg.forEach(t=>byc[t.c]=(byc[t.c]||0)+dur(t.de,t.a));
  return {pers:pr.length,hh,km,jor,byc};
}
function stepOk(p,i){
  const e=p.ejec;if(!e)return false;
  const c=checks(p).filter(x=>x[0]==='err'),sec=STEP_SEC[i]||[];
  return !c.some(x=>sec.includes(x[2]))&&(i!==2||e.reg.length>0);
}
function newEjec(p){
  return {check:{charla:false,epp:false},llegada:'',permiso:p.ptw?{num:'',firmo:'',hora:''}:null,clima:null,
    personal:(p.pers||CREW[p.rec]).map(n=>({n,rol:ROLEP[n]||'Operario',pres:true,ini:'',fin:''})),
    equipos:(p.eqs||VEH[p.rec]).map(c=>({c,km:'',obs:''})),reg:[],obs:'',fotos:[],firma:null};
}
function trabTotals(t,extraP){
  const ps=S.partes.filter(p=>p.pl===t.id&&p.ejec);
  if(extraP&&!ps.includes(extraP))ps.push(extraP);
  const pr={};let hh=0;ps.forEach(p=>{hh+=sums(p).hh;prod(p).forEach(x=>{const k=x.d+'|'+x.u;pr[k]=pr[k]||{d:x.d,u:x.u,q:0};pr[k].q+=x.q})});
  return {dias:ps.length,hh,prod:Object.values(pr)};
}
