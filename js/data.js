/* ---------- catálogos activos y datos de ejemplo ---------- */
/* Catálogos activos: se arman desde S.cat con applyCat() (datos de ejemplo o importados) */
let OPS={},OPSUP={},SUPS=[],RTS=[],RECURSOS=[],CREW={},POOL=[],ALLP=[],EQ={},VEH={},KM0={},ROLEP={};

/* Datos de ejemplo (ficticios). Los datos reales se importan desde Configuración → Datos maestros. */
const D_OPS={AUP:'Austral Petróleo',GEN:'Golfo Energía',CDO:'Cañadón Oil'};
const D_OPSUP={AUP:'Gustavo Rivas',GEN:'Carolina Díaz',CDO:'Fabián Torres'};
const APROB='Laura Méndez';
const CONTRATOS0={
  /* Estructura real de un contrato: la clave es el ID de VDS; num es el número de contrato del cliente.
     Tareas: [nombre, unidad, categoría de equipo, origen, códigos de facturación, cantidad por defecto] */
  'CT-AUP-017':{op:'AUP',num:'4600001017',n:'Servicios de cuadrilla en locaciones',servs:['Servicios de cuadrilla en locaciones'],vig:'2027-06-30',resp:'Natalia Vera',cc:'4110',ccn:'Mantenimiento de locaciones · Zona Norte',yacs:['El Trébol','Escalante'],recs:['C-01','C-03'],
    imps:[['AUP-4110-OPEX-01','Mantenimiento de locaciones El Trébol'],['AUP-4110-OPEX-02','Mantenimiento de locaciones Escalante'],['AUP-4110-CAPEX-07','Obras de superficie · proyecto batería ET-B3']],
    tareas:[['Limpieza de locación','m²','','',['AUP17-01'],400],['Montaje de línea de conducción','m','','',['AUP17-02'],50],['Zanjeo manual','m','','',['AUP17-03'],40],['Desmalezado','m²','','',['AUP17-04'],800],['Armado de cerco perimetral','m','','',['AUP17-05'],60],['Movimiento de suelo','m³','','',['AUP17-06'],20]]},
  'CT-AUP-021':{op:'AUP',num:'4600001021',n:'Transporte y logística de materiales',servs:['Logística de materiales','Transporte de agua'],vig:'2027-06-30',resp:'Natalia Vera',cc:'4205',ccn:'Logística El Trébol',yacs:['El Trébol','Escalante'],recs:['CM-22'],
    imps:[['AUP-4205-OPEX-01','Logística de materiales y fluidos']],
    tareas:[['Traslado de cañería','t','','',['AUP21-01'],14],['Traslado de equipo','viaje','','',['AUP21-02'],1],['Transporte de agua','m³','','',['AUP21-03','AUP21-04'],30]]},
  'CT-GEN-008':{op:'GEN',num:'GE-2025-008',n:'Izaje y montaje',servs:['Izaje y montaje'],vig:'2026-12-31',resp:'Pablo Ortiz',cc:'7302',ccn:'Montajes Diadema',yacs:['Diadema'],recs:['HG-14'],
    imps:[['GEN-7302-PM-11','Pulling y montajes programados'],['GEN-7302-PM-12','Montajes de emergencia']],
    tareas:[['Izaje de bombeador','maniobra','','',['GEN08-01'],2],['Carga y descarga de materiales','maniobra','','',['GEN08-02'],2],['Montaje de tanque','maniobra','','',['GEN08-03'],1]]},
  'CT-GEN-011':{op:'GEN',num:'GE-2025-011',n:'Obras civiles menores',servs:['Obras civiles Diadema','Obras civiles Manantiales Behr'],vig:'2026-12-31',resp:'Pablo Ortiz',cc:'7310',ccn:'Obras civiles Diadema / Manantiales Behr',yacs:['Diadema','Manantiales Behr'],recs:['C-03','C-05'],
    imps:[['GEN-7310-OC-03','Obras civiles Diadema'],['GEN-7310-OC-04','Obras civiles Manantiales Behr']],
    tareas:[['Zanjeo manual','m','','',['GEN11-01'],40],['Desmalezado','m²','','',['GEN11-02'],800],['Movimiento de suelo','m³','','',['GEN11-03'],20],['Limpieza de locación','m²','','',['GEN11-04'],400]]},
  'CT-CDO-003':{op:'CDO',num:'',n:'Servicios integrales de yacimiento',servs:['Operación de yacimiento','Remediación ambiental'],vig:'',resp:'',cc:'5120',ccn:'Operaciones Cañadón Perdido',yacs:['Cañadón Perdido'],recs:['C-05','HG-14','CM-22'],
    imps:[['CDO-5120-OPS-01','Operación de yacimiento'],['CDO-5120-HSE-02','Remediación ambiental']],
    tareas:[['Zanjeo manual','m','','',['CDO03-01'],40],['Transporte de agua','m³','','',['CDO03-02'],30],['Retiro de residuos','m³','','',['CDO03-03'],10],['Izaje de bombeador','maniobra','','',['CDO03-04'],2]]}
};
/* Ubicaciones de ejemplo con coordenadas INVENTADAS para probar el mapa: no son pozos ni instalaciones reales */
const D_UBIC=(()=>{const L=[],add=(op,y,pv,c,items)=>items.forEach(([n,t,e,dy,dx])=>L.push({id:'D-'+String(L.length+1).padStart(3,'0'),n,t,op,a:y,y,pv,e:t==='Pozo'?e||'Activo':'',lat:+(c[0]+dy).toFixed(5),lon:+(c[1]+dx).toFixed(5)}));
  add('AUP','El Trébol','Chubut',[-45.812,-67.598],[['ET-1098','Pozo','Activo',.004,-.011],['ET-1102','Pozo','Activo',.012,-.006],['ET-1130','Pozo','Inactivo',-.009,.014],['ET-1141','Pozo','Abandonado',-.016,-.003],['Batería ET-B3','Batería','',.002,.006],['Batería ET-B1','Batería','',-.012,-.017],['Playa de materiales','Playa de materiales','',.019,.011]]);
  add('AUP','Escalante','Chubut',[-45.748,-67.702],[['Locación ES-212','Pozo','Activo',.006,.004],['ES-215','Pozo','Activo',-.005,.012],['ES-220','Pozo','Inactivo',.011,-.009],['Batería ES-B2','Batería','',-.002,-.004]]);
  add('GEN','Diadema','Chubut',[-45.793,-67.672],[['DI-311','Pozo','Activo',.003,.002],['DI-408','Pozo','Activo',-.008,.009],['DI-415','Pozo','Activo',.014,-.007],['DI-420','Pozo','Abandonado',-.013,-.012],['Planta Diadema','Planta de gas','',.006,.017]]);
  add('GEN','Manantiales Behr','Chubut',[-45.582,-67.618],[['Planta MB-PIAS','Planta de tratamiento de crudo','',0,0],['MB-1201','Pozo','Activo',.009,-.008],['MB-1207','Pozo','Inactivo',-.007,.01]]);
  add('CDO','Cañadón Perdido','Chubut',[-45.703,-67.876],[['CP-77','Pozo','Activo',.005,-.006],['CP-80','Pozo','Activo',-.004,.008],['CP-90','Pozo','Inactivo',.012,.003],['Batería CP-B3','Batería','',-.01,-.011]]);
  return L})();
const D_RECURSOS=[
  {id:'C-01',n:'Cuadrilla 01',k:'Cuadrilla'},
  {id:'C-03',n:'Cuadrilla 03',k:'Cuadrilla'},
  {id:'C-05',n:'Cuadrilla 05',k:'Cuadrilla'},
  {id:'HG-14',n:'Hidrogrúa HG-14',k:'Hidrogrúa'},
  {id:'CM-22',n:'Camión CM-22',k:'Camión batea'}
];
const D_CREW={'C-01':['Hugo Ruiz','Matías Lell','Nicolás Tapia','Franco Cid'],'C-03':['Diego Arce','Cristian Paz','Lucas Villegas','Ramón Ojeda'],'C-05':['Sergio Molina','Iván Quiroga','Ezequiel Bustos'],'HG-14':['Raúl Funes','Omar Liempe'],'CM-22':['Pablo Gómez']};
const D_POOL=['Jorge Almonacid','Brian Cárcamo','Walter Nahuelquir'];
const D_EQ={'PU-31':'Pick-up Hilux','PU-44':'Pick-up Amarok','PU-52':'Pick-up Ranger','MB-08':'Minibús 19 asientos','RT-03':'Retroexcavadora','GE-11':'Grupo electrógeno','HG-14':'Hidrogrúa 28 t','CM-22':'Camión batea','CA-05':'Camión cisterna 30 m³'};
const D_VEH={'C-01':['PU-44'],'C-03':['PU-31','MB-08'],'C-05':['PU-52'],'HG-14':['HG-14'],'CM-22':['CM-22']};
const D_KM0={'PU-31':84000,'PU-44':45400,'PU-52':30210,'MB-08':120200,'HG-14':51150,'CM-22':210400,'CA-05':98300,'RT-03':6400,'GE-11':2100};
let CTS=CONTRATOS0;

const recOf=id=>RECURSOS.find(r=>r.id===id)||{n:id,k:''};
const jefeOf=id=>(CREW[id]&&CREW[id][0])||'—';
const roleK=(k,i)=>{if(i===0)return k==='Cuadrilla'?'Jefe de cuadrilla':k==='Hidrogrúa'?'Operador de grúa':'Chofer';return k==='Hidrogrúa'?'Rigger':'Operario'};
const locOf=x=>x?(x.yac?x.yac+' · '+x.pozo:(x.pozo||'')):'';
const homeOf=n=>{const r=Object.keys(CREW).find(k=>CREW[k].includes(n));return r?recOf(r).n:'Base · disponible'};
const eqHome=c=>{const r=Object.keys(VEH).find(k=>VEH[k].includes(c));return r?recOf(r).n:'Base · disponible'};

function demoCat(){
  const per=[];Object.entries(D_CREW).forEach(([r,a])=>a.forEach((n,i)=>per.push({n,leg:'',rol:roleK(D_RECURSOS.find(x=>x.id===r).k,i)})));D_POOL.forEach(n=>per.push({n,leg:'',rol:'Operario'}));
  return {src:'demo',file:'',at:'',by:'',ubicN:0,clientes:Object.fromEntries(Object.keys(D_OPS).map(k=>[k,{n:D_OPS[k],sup:D_OPSUP[k]}])),
    cuadrillas:D_RECURSOS.map(r=>({id:r.id,n:r.n,k:r.k,pers:D_CREW[r.id].slice(),eqs:D_VEH[r.id].slice()})),personal:per,equipos:Object.assign({},D_EQ),km0:Object.assign({},D_KM0),
    sups:['Pablo Ortiz','Natalia Vera'],rts:['Martín Sosa','Andrea Lucero'],habLoaded:true,novedades:D_NOV.map(([c,t])=>({c,t})),cliUser:{n:'Gustavo Rivas',id:'grivas',op:'AUP'},opUser:{n:'Diego Arce',id:'darce',rec:'C-03'},warns:[]};
}
function applyCat(c){
  OPS={};OPSUP={};Object.entries(c.clientes).forEach(([k,v])=>{OPS[k]=v.n;OPSUP[k]=v.sup||('Supervisor '+k)});
  RECURSOS=c.cuadrillas.map(x=>({id:x.id,n:x.n,k:x.k||'Cuadrilla'}));CREW={};VEH={};c.cuadrillas.forEach(x=>{CREW[x.id]=x.pers;VEH[x.id]=x.eqs});
  EQ=c.equipos;KM0=c.km0||{};ALLP=c.personal.map(p=>p.n);POOL=ALLP.filter(n=>!c.cuadrillas.some(x=>x.pers.includes(n)));
  ROLEP={};c.personal.forEach(p=>ROLEP[p.n]=p.rol||'Operario');
  SUPS=c.sups&&c.sups.length?c.sups:['Supervisor VDS'];RTS=c.rts&&c.rts.length?c.rts:['Responsable técnico VDS'];
  const cu=USERS.cliente;cu.n=c.cliUser.n;cu.id=c.cliUser.id;cu.ini=iniOf(cu.n);cu.op=c.cliUser.op;cu.cargo='Supervisor de contrato · '+(OPS[cu.op]||'');
  const ou=USERS.operador;ou.n=c.opUser.n;ou.id=c.opUser.id;ou.ini=iniOf(ou.n);ou.rec=c.opUser.rec;ou.cargo='Jefe · '+recOf(ou.rec).n;
}

/* ---------- planificación y partes de ejemplo, relativos a la fecha de hoy ---------- */
function seedHab(){const R=dRel,H={},DV={AUP:R(177),GEN:R(102),CDO:R(76)};
  ALLP.forEach(n=>Object.keys(OPS).forEach(op=>H[n+'|'+op]={vence:DV[op]}));
  Object.keys(EQ).forEach(c=>Object.keys(OPS).forEach(op=>H[c+'|'+op]={vence:op==='CDO'?R(56):R(146)}));
  [['Cristian Paz','GEN',R(-7)],['Ramón Ojeda','CDO',null],['Brian Cárcamo','AUP',null],['Ezequiel Bustos','AUP',R(3)],['Walter Nahuelquir','GEN',R(4)],['MB-08','AUP',R(-2)],['CA-05','AUP',null],['CA-05','GEN',null],['RT-03','AUP',null]]
    .forEach(([s,op,v])=>{if(v)H[s+'|'+op].vence=v;else delete H[s+'|'+op]});
  return H}
const P0=()=>stamp(dRel(-10),'16:10');
function seedTrabajos(){
  const T=[],R=dRel;
  const add=o=>{const t=Object.assign({prio:'media',ptw:false,orden:0,hora:'',ind:'',sup:'Pablo Ortiz',rt:'Martín Sosa',cierre:null,ext:null,hist:[{t:P0(),who:'Laura Méndez',a:'Planificado',c:''}]},o);
    t.imp=t.imp||CONTRATOS0[t.ct].imps[0][0];t.pers=t.pers||CREW[t.rec].slice();t.eqs=t.eqs||VEH[t.rec].slice();
    const u=D_UBIC.find(x=>x.n===t.pozo&&x.y===t.yac);if(u){t.uid=u.id;t.lat=u.lat;t.lon=u.lon}T.push(t)};
  add({id:'PL-090',ct:'CT-AUP-017',imp:'AUP-4110-OPEX-01',rec:'C-03',yac:'El Trébol',pozo:'ET-1098',inicio:R(-6),dias:4,ptw:true,prev:['Montaje de línea de conducción']});
  add({id:'PL-106',ct:'CT-AUP-021',rec:'CM-22',yac:'El Trébol',pozo:'Playa de materiales',inicio:R(-6),dias:3,prev:['Traslado de cañería','Transporte de agua']});
  add({id:'PL-093',ct:'CT-AUP-017',imp:'AUP-4110-OPEX-02',rec:'C-01',yac:'Escalante',pozo:'Locación ES-212',inicio:R(-4),dias:6,prio:'alta',ptw:true,prev:['Desmalezado','Armado de cerco perimetral'],ind:'Cercar la locación completa antes del montaje del equipo de workover.'});
  add({id:'PL-094',ct:'CT-CDO-003',rec:'C-05',yac:'Cañadón Perdido',pozo:'CP-77',inicio:R(-3),dias:3,prev:['Zanjeo manual'],sup:'Natalia Vera'});
  add({id:'PL-096',ct:'CT-GEN-008',rec:'HG-14',yac:'Diadema',pozo:'DI-311',inicio:R(-3),dias:1,ptw:true,prev:['Izaje de bombeador']});
  add({id:'PL-091',ct:'CT-GEN-011',rec:'C-03',yac:'Diadema',pozo:'DI-408',inicio:R(-2),dias:1,ptw:true,prev:['Zanjeo manual','Desmalezado']});
  add({id:'PL-092',ct:'CT-AUP-017',imp:'AUP-4110-CAPEX-07',rec:'C-03',yac:'El Trébol',pozo:'Batería ET-B3',inicio:TODAY,dias:5,prio:'alta',ptw:true,orden:1,hora:'07:30',prev:['Limpieza de locación','Montaje de línea de conducción','Movimiento de suelo'],ind:'Ingresar por picada 14. El supervisor de AUP firma el permiso en la batería a las 07:30.'});
  add({id:'PL-107',ct:'CT-AUP-017',imp:'AUP-4110-OPEX-01',rec:'C-03',yac:'El Trébol',pozo:'ET-1102',inicio:TODAY,dias:1,orden:2,hora:'15:00',prev:['Desmalezado'],ind:'Desmalezar el acceso a la locación al terminar en la batería.'});
  add({id:'PL-097',ct:'CT-GEN-008',imp:'GEN-7302-PM-12',rec:'HG-14',yac:'Diadema',pozo:'DI-415',inicio:TODAY,dias:2,ptw:true,prev:['Izaje de bombeador']});
  add({id:'PL-095',ct:'CT-CDO-003',imp:'CDO-5120-HSE-02',rec:'C-05',yac:'Cañadón Perdido',pozo:'Batería CP-B3',inicio:TODAY,dias:2,prio:'urg',ptw:true,prev:['Retiro de residuos'],ind:'Derrame menor en batería 3: retirar suelo afectado a repositorio.',sup:'Natalia Vera',eqs:['PU-52','CA-05']});
  add({id:'PL-098',ct:'CT-AUP-021',rec:'CM-22',yac:'El Trébol',pozo:'Playa de materiales',inicio:R(1),dias:3,prev:['Traslado de cañería','Transporte de agua']});
  add({id:'PL-099',ct:'CT-CDO-003',rec:'HG-14',yac:'Cañadón Perdido',pozo:'CP-77',inicio:R(3),dias:2,ptw:true,prev:['Izaje de bombeador']});
  add({id:'PL-100',ct:'CT-GEN-011',imp:'GEN-7310-OC-04',rec:'C-05',yac:'Manantiales Behr',pozo:'Planta MB-PIAS',inicio:R(3),dias:4,prio:'baja',prev:['Limpieza de locación','Movimiento de suelo']});
  add({id:'PL-101',ct:'CT-AUP-017',imp:'AUP-4110-OPEX-02',rec:'C-01',yac:'Escalante',pozo:'ES-215',inicio:R(3),dias:4,prev:['Desmalezado']});
  add({id:'PL-102',ct:'CT-GEN-011',imp:'GEN-7310-OC-03',rec:'C-03',yac:'Diadema',pozo:'DI-408',inicio:R(7),dias:3,ptw:true,prev:['Zanjeo manual'],ind:'Terminar zanjeo del tramo 2 (aprox. 60 m).'});
  add({id:'PL-103',ct:'CT-AUP-021',rec:'CM-22',yac:'Escalante',pozo:'ES-215',inicio:R(8),dias:2,prev:['Traslado de equipo']});
  add({id:'PL-105',ct:'CT-CDO-003',rec:'C-05',yac:'Cañadón Perdido',pozo:'CP-90',inicio:R(9),dias:5,prev:['Zanjeo manual','Transporte de agua']});
  add({id:'PL-104',ct:'CT-AUP-017',rec:'C-03',yac:'El Trébol',pozo:'ET-1130',inicio:R(14),dias:4,prio:'baja',prev:['Limpieza de locación','Desmalezado']});
  return T;
}
const unit0=(ct,d)=>((CTS[ct].tareas.find(x=>x[0]===d))||[0,''])[1];
function snap(t,fecha){const cc=(S&&S.contratos&&S.contratos[t.ct])||CTS[t.ct]||{};return {pl:t.id,dia:diffD(t.inicio,fecha),fecha,ct:t.ct,imp:t.imp,op:cc.op,cc:t.cc||cc.cc,ccn:t.ccn||cc.ccn,yac:t.yac||'',pozo:t.pozo,uid:t.uid||'',lat:t.lat??'',lon:t.lon??'',rec:t.rec,prio:t.prio,ptw:t.ptw,orden:t.orden||0,hora:t.hora||'',prev:t.prev.slice(),ind:t.ind,sup:t.sup,rt:t.rt,pers:t.pers.slice(),eqs:t.eqs.slice()}}
function genEjec(t,fecha){
  const i=diffD(t.inicio,fecha),g=diffD(dRel(-7),fecha),op=CTS[t.ct].op;
  const Q={'m²':[350,60],'m':[45,9],'m³':[18,5],'t':[14,2],'viaje':[3,1],'maniobra':[2,0],'h':[8,0],'km':[60,10],'unidad':[4,1],'día':[1,0],'mes':[1,0],'punto':[20,4]};
  const qOf=d=>{const u=unit0(t.ct,d),q=Q[u]||[5,1];return [q[0]+(i%3)*q[1],u]};
  const reg=[{c:'tr',de:'06:45',a:'07:40',d:'Base → '+t.pozo,q:'',u:'',det:''}];
  const n=t.prev.length,h=Math.ceil(n/2),am=t.prev.slice(0,h),pm=n>1?t.prev.slice(h):t.prev;
  const fill=(list,from,to)=>{const blk=Math.floor(dur(from,to)/list.length/5)*5;list.forEach((d,k)=>{const[q,u]=qOf(d);reg.push({c:'op',de:addM(from,k*blk),a:k===list.length-1?to:addM(from,(k+1)*blk),d,q:String(n===1?Math.max(1,Math.round(q/2)):q),u,det:''})})};
  fill(am,'07:40','12:30');reg.push({c:'rf',de:'12:30',a:'13:00',d:'',q:'',u:'',det:''});fill(pm,'13:00','17:40');
  reg.push({c:'tr',de:'17:40',a:'18:30',d:'Regreso a base',q:'',u:'',det:''});
  return {check:{charla:true,epp:true},llegada:'07:40',
    permiso:t.ptw?{num:'PT-'+op+'-'+(4400+Math.abs(g)*3),firmo:OPSUP[op],hora:'07:30'}:null,
    clima:{t:String(8+Math.abs(g*3)%9),v:String(22+Math.abs(g*7)%20),r:String(38+Math.abs(g*11)%20),dir:['O','SO','NO','O'][Math.abs(g)%4],cond:['Despejado','Nublado parcial','Ventoso','Despejado'][Math.abs(g)%4],src:'app',at:'07:3'+(Math.abs(g)%10)},
    personal:t.pers.map(nm=>({n:nm,rol:ROLEP[nm]||'Operario',pres:true,ini:'',fin:''})),
    equipos:t.eqs.map((c,k)=>({c,km:String((KM0[c]??20000+k*5000)+(g+7)*70+62+k*8),obs:''})),
    reg,obs:'',fotos:[],firma:'seed'};
}
/* Montos y novedades de ejemplo (ficticios) para probar NLS. No pisan lo que ya esté cargado */
const D_NOVV=()=>{const v={};D_NOV.forEach(([c,t],i)=>{v[c]=(t==='liq'?4000:12000)+((i*7)%9)*1500});return v};
function seedNov(P,cat){
  const h=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7),pref=(k,l)=>{const a=cat.filter(x=>x.t===k).map(x=>x.c),b=l.filter(c=>a.includes(c));return b.length?b:a};
  const L=pref('liq',['VIANDA ADIC.','TRASLADO','ADIC.PERNOCT','DOBLE TURNO','DISP_DIA','CORRIDO']),A=pref('aus',['ENF - AUS','VAC - AUS','CURSO','FERIADO - AUS']);let n=0;
  P.filter(p=>p.ejec&&['env','obs','apr','cert'].includes(p.estado)).forEach(p=>{p.nov=p.nov||{};p.ejec.personal.forEach(x=>{if(p.nov[x.n])return;const k=h(p.id+x.n),m=k%100,l=[];if(m<60&&L.length)l.push(L[k%L.length]);if(m<20&&L.length>1)l.push(L[(k+1)%L.length]);if(m>=88&&A.length)l.push(A[k%A.length]);if(l.length){p.nov[x.n]=l;n+=l.length}})});
  return n;
}
function mkParte(t,fecha,estado,patch){
  const p=Object.assign(snap(t,fecha),{estado,ejec:estado==='plan'?null:genEjec(t,fecha),dec:null,cert:null,fin:null,ext:null,nov:{},hist:[{t:(t.hist[0]||{}).t||P0(),who:(t.hist[0]||{}).who||APROB,a:'Planificado',c:''}]});
  p.fin=p.dia>=t.dias-1?'fin':'sigue';
  const nx=addDays(fecha,1),op=CTS[t.ct].op,g=Math.abs(diffD(dRel(-7),fecha));
  if(estado!=='plan')p.hist.push({t:stamp(fecha,'06:3'+(g%9)),who:jefeP(p),a:'Parte iniciado',c:''});
  if(['env','obs','apr','cert'].includes(estado))p.hist.push({t:stamp(fecha,'19:1'+(g%9)),who:jefeP(p),a:'Enviado para aprobación',c:''});
  if(['apr','cert'].includes(estado)){p.dec={d:'ok',who:APROB,t:stamp(nx,'09:20'),com:''};p.hist.push({t:p.dec.t,who:APROB,a:'Aprobado',c:''})}
  if(estado==='cert'){p.cert={d:'ok',who:OPSUP[op]+' · '+OPS[op],t:stamp(addDays(nx,1),'15:40'),com:'',firma:'seed'};p.hist.push({t:p.cert.t,who:OPSUP[op]+' · '+OPS[op],a:'Certificado y firmado',c:''})}
  if(patch)patch(p);
  if(p.fin==='fin'&&['env','obs','apr','cert'].includes(p.estado)&&!t.cierre){t.cierre={fecha,parte:null,who:jefeP(p),t:stamp(fecha,'19:15'),obs:p.ejec?p.ejec.obs:'',anticipado:false};t.hist.push({t:t.cierre.t,who:jefeP(p),a:'Trabajo cerrado por el jefe de cuadrilla',c:t.cierre.obs})}
  return p;
}
function seed(){
  const T=seedTrabajos(),P=[],R=dRel;
  const O={
    ['PL-090|'+R(-3)]:['apr',p=>{p.ejec.obs='Línea de 4 pulgadas montada y probada. Locación entregada limpia.'}],
    ['PL-093|'+R(-2)]:'apr',['PL-094|'+R(-2)]:'apr',
    ['PL-093|'+R(-1)]:['env',p=>{const e=p.ejec;e.llegada='07:20';e.personal[0].fin='18:40';
      e.reg=[{c:'tr',de:'06:30',a:'07:20',d:'Base → Escalante',q:'',u:'',det:''},{c:'op',de:'07:20',a:'10:00',d:'Desmalezado',q:'1200',u:'m²',det:'Sector sur y accesos'},{c:'es',de:'10:00',a:'11:30',d:'Permiso de trabajo',q:'',u:'',det:'Supervisor AUP llegó 11:25'},{c:'op',de:'11:30',a:'13:00',d:'Armado de cerco perimetral',q:'30',u:'m',det:'Lado norte'},{c:'rf',de:'13:00',a:'13:30',d:'',q:'',u:'',det:''},{c:'op',de:'13:30',a:'18:20',d:'Armado de cerco perimetral',q:'55',u:'m',det:'Lado este'},{c:'tr',de:'18:20',a:'19:10',d:'Regreso a base',q:'',u:'',det:''}];
      e.permiso.hora='11:25';
      e.obs='Demora de 1 h 30 en el ingreso: el supervisor de AUP llegó a firmar el permiso a las 11:25.';
      e.fotos=[{cap:'Cerco lado norte'},{cap:'Locación desmalezada'}];e.clima={t:'13',v:'30',r:'48',dir:'O',cond:'Nublado parcial',src:'app',at:'07:24'};
      p.fin='ext';p.ext={dias:1,motivo:'La operadora pidió ampliar el cerco al sector de tanques (40 m más).'}}],
    ['PL-094|'+R(-1)]:['env',p=>{const e=p.ejec;e.llegada='07:45';
      e.reg=[{c:'tr',de:'06:45',a:'07:45',d:'Base → CP-77',q:'',u:'',det:''},{c:'op',de:'07:45',a:'12:00',d:'Zanjeo manual',q:'38',u:'m',det:'Tramo batería 2 a satélite 5'},{c:'vi',de:'12:00',a:'13:30',d:'',q:'72',u:'km/h',det:'Personal resguardado en el vehículo'},{c:'op',de:'13:30',a:'17:15',d:'Zanjeo manual',q:'26',u:'m',det:'Tramo satélite 5'},{c:'tr',de:'17:15',a:'18:00',d:'Regreso a base',q:'',u:'',det:''}];
      e.obs='Ráfagas de 72 km/h entre 12:00 y 13:30. Se suspendió el trabajo y se resguardó al personal en el vehículo.';e.fotos=[{cap:'Zanja tramo 1'}];
      e.clima={t:'11',v:'44',r:'72',dir:'SO',cond:'Ventoso',src:'app',at:'07:41'};e.obs+=' Zanja terminada (64 m en total del día). Falta tapado, queda para otra orden.'}],
    ['PL-091|'+R(-2)]:['obs',p=>{const e=p.ejec;e.llegada='07:50';
      e.reg=[{c:'tr',de:'06:45',a:'07:50',d:'Base → DI-408',q:'',u:'',det:''},{c:'op',de:'07:50',a:'12:30',d:'Zanjeo manual',q:'',u:'m',det:''},{c:'es',de:'12:30',a:'13:15',d:'Responsable Operadora',q:'',u:'',det:'Habilitación del tramo 2'},{c:'rf',de:'13:15',a:'13:45',d:'',q:'',u:'',det:''},{c:'op',de:'13:45',a:'16:00',d:'Desmalezado',q:'800',u:'m²',det:''},{c:'op',de:'16:00',a:'18:20',d:'Movimiento de suelo',q:'24',u:'m³',det:'Relleno de zanja tramo 1'},{c:'tr',de:'18:20',a:'19:00',d:'Regreso a base',q:'',u:'',det:''}];
      e.obs='Se esperó al supervisor de la operadora para habilitar el tramo 2 del zanjeo.';
      const c='Falta la cantidad de zanjeo del tramo de la mañana y el detalle de la espera de la operadora.';
      p.dec={d:'obs',who:APROB,t:stamp(TODAY,'08:15'),com:c};p.hist.push({t:p.dec.t,who:APROB,a:'Devuelto con observaciones',c})}],
    ['PL-092|'+TODAY]:['curso',p=>{const e=p.ejec;e.check.epp=false;e.llegada='07:35';e.clima=null;e.firma=null;e.permiso={num:'',firmo:'',hora:''};
      e.equipos.forEach(q=>q.km='');
      e.reg=[{c:'tr',de:'06:45',a:'07:35',d:'Base → Batería ET-B3',q:'',u:'',det:''},{c:'op',de:'07:35',a:'10:10',d:'Limpieza de locación',q:'450',u:'m²',det:''},{c:'vi',de:'10:10',a:'11:00',d:'',q:'65',u:'km/h',det:''}]}],
    ['PL-093|'+TODAY]:['curso',p=>{const e=p.ejec;e.firma=null;e.clima=null;e.llegada='07:15';e.equipos.forEach(q=>q.km='');e.reg=[{c:'tr',de:'06:30',a:'07:15',d:'Base → Escalante',q:'',u:'',det:''}];p.fin='sigue'}],
    ['PL-097|'+TODAY]:['curso',p=>{const e=p.ejec;e.firma=null;e.clima=null;e.llegada='08:00';e.equipos.forEach(q=>q.km='');e.reg=[{c:'tr',de:'06:45',a:'08:00',d:'Base → DI-415',q:'',u:'',det:''}]}]
  };
  T.forEach(t=>{for(let i=0;i<t.dias;i++){const f=addDays(t.inicio,i);const o=O[t.id+'|'+f];
    if(f<TODAY||o){const est=Array.isArray(o)?o[0]:(o||'cert');P.push(mkParte(t,f,est,Array.isArray(o)?o[1]:null))}}});
  P.sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.rec.localeCompare(b.rec));
  P.forEach((p,i)=>p.id='PD-'+String(380+i).padStart(4,'0'));
  T.forEach(t=>{if(t.cierre){const last=P.filter(p=>p.pl===t.id).pop();if(last)t.cierre.parte=last.id}});
  const t93=T.find(t=>t.id==='PL-093'),p93=P.find(p=>p.pl==='PL-093'&&p.fecha===R(-1));
  t93.ext={dias:1,motivo:p93.ext.motivo,who:'Hugo Ruiz',t:stamp(R(-1),'19:20'),parte:p93.id};t93.hist.push({t:t93.ext.t,who:'Hugo Ruiz',a:'Pidió 1 día más',c:p93.ext.motivo});
  return {T,P};
}

/* ---------- planificación de ejemplo sobre datos importados ---------- */
function exampleSeed(){
  const T=[],P=[];let n=200,pi=0;const pool=ALLP.slice();
  const pk=(a,i)=>a&&a.length?a[i%a.length]:'';
  RECURSOS.forEach((r,ri)=>{
    // el contrato más específico de la cuadrilla: uno sin cuadrillas propias las habilita a todas y no debe ganar
    const ct=Object.keys(CTS).filter(k=>CTS[k].recs.includes(r.id)).sort((a,b)=>CTS[a].recs.length-CTS[b].recs.length||natCmp(a,b))[0];if(!ct)return;const c=CTS[ct];
    let pers=(CREW[r.id]||[]).slice();if(!pers.length)for(let k=0;k<2&&pool.length;k++){pers.push(pool[pi%pool.length]);pi++}
    if(!pers.length)return;
    const eqs=((VEH[r.id]||[]).length?VEH[r.id]:c.eqs).slice(0,4);
    const ccl=c.ccs||[[c.cc,c.ccn]],ccM=ccl[ccMatch(c,r.id)];
    // con ubicaciones importadas, la planificación de ejemplo usa lugares reales del cliente (primero instalaciones)
    const UL=UB.list.filter(u=>u.op===c.op),UL2=UL.filter(u=>u.t!=='Pozo'),UP=UL2.length?UL2:UL,pickU=k=>UP.length?UP[(ri*3+k)%UP.length]:null;
    const mk=(off,dias,k,orden,hora)=>{const cx=ccM||pk(ccl,k+ri),u=pickU(k);const t={id:'PL-'+(n++),ct,imp:pk(c.imps,k+ri)[0]||'',cc:cx[0],ccn:cx[1],rec:r.id,yac:u?(u.y||u.a):'',pozo:u?u.n:(pk(c.ubic,ri+k)||'Ubicación a definir'),uid:u?u.id:'',lat:u?u.lat:'',lon:u?u.lon:'',inicio:addDays(TODAY,off),dias,prio:k===1&&ri%3===0?'alta':'media',ptw:ri%2===0,orden:orden||0,hora:hora||'',ind:'',sup:SUPS[0],rt:RTS[0],pers:pers.slice(),eqs:eqs.slice(),prev:c.tareas.slice(k%2,k%2+2).map(x=>x[0]),cierre:null,ext:null,hist:[{t:P0(),who:'Laura Méndez',a:'Planificado',c:''}]};
      if(!t.prev.length&&c.tareas.length)t.prev=[c.tareas[0][0]];if(!t.prev.length)return null;T.push(t);return t};
    const op=r.id===USERS.operador.rec;
    const a=mk(-6,3,0),b=mk(-1,4,1,op?1:0,op?'07:30':'');mk(3,3,2);
    if(op&&(UP.length>1||c.ubic.length>1))mk(0,1,3,2,'15:00');   // segundo trabajo del día para la cuadrilla del operador
    if(a)['cert','cert','apr'].forEach((e,i)=>P.push(mkParte(a,addDays(a.inicio,i),e)));
    if(b){P.push(mkParte(b,b.inicio,'env'));
      if(op)P.push(mkParte(b,TODAY,'curso',p=>{const e=p.ejec;e.firma=null;e.clima=null;e.equipos.forEach(q=>q.km='');e.reg=e.reg.slice(0,2);if(e.permiso)e.permiso={num:'',firmo:'',hora:''}}))}
  });
  P.sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.rec.localeCompare(b.rec));
  P.forEach((p,i)=>p.id='PD-'+String(500+i).padStart(4,'0'));
  T.forEach(t=>{if(t.cierre){const last=P.filter(p=>p.pl===t.id).pop();if(last)t.cierre.parte=last.id}});
  return {T,P};
}

const NAMEROL=n=>{if(n==='Sistema')return 'Sistema';const u=Object.values(ALLU()).find(x=>x.n===n);if(u)return ROLE_N[u.rol];if(Object.values(OPSUP).some(x=>n.startsWith(x)))return 'Cliente';if(Object.values(CREW).some(a=>a[0]===n))return 'Operador';return 'Usuario'};
function seedLog(T,P){
  const L=[],R=dRel;const add=(ts,who,accion,obj,det,mot,tipo)=>L.push({ts,who,rol:NAMEROL(who),accion,obj,det:det||'',mot:mot||'',tipo});
  P.forEach(p=>p.hist.forEach(h=>{if(h.a!=='Planificado')add(parseStamp(h.t),h.who,h.a,p.id,'',h.a.startsWith('Devuelto')?h.c:'','parte')}));
  T.forEach(t=>t.hist.forEach(h=>add(parseStamp(h.t),h.who,h.a==='Planificado'?'Trabajo planificado':h.a,t.id,h.c,'','trabajo')));
  add(R(-4)+'T10:00','Sofía Herrera','Permisos de administración otorgados','Laura Méndez','','Cubre la administración del sistema durante licencias y fines de semana','config');
  add(R(-2)+'T11:05','Sofía Herrera','Tarea agregada al catálogo','CT-AUP-017','Movimiento de suelo (m³)','','config');
  const first={};L.forEach(x=>{if(x.who==='Sistema')return;const k=x.who+'|'+x.ts.slice(0,10);if(!first[k]||x.ts<first[k].ts)first[k]=x});
  Object.values(first).forEach(x=>{const m=Math.max(0,mins(x.ts.slice(11,16))-7);L.push({ts:x.ts.slice(0,11)+addM('00:00',m),who:x.who,rol:x.rol,accion:'Ingreso',obj:'',det:x.rol==='Operador'?'Tablet de la cuadrilla':'Web · usuario y clave',mot:'',tipo:'ingreso'})});
  L.push({ts:R(-1)+'T22:41',who:'cmolina',rol:'',accion:'Ingreso fallido',obj:'',det:'Usuario o clave incorrectos',mot:'',tipo:'ingreso'});
  return L.filter(x=>x.ts.slice(0,16)<=nowT()||x.ts.slice(0,10)<TODAY);
}
