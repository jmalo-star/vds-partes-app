/* ---------- exportación: PDF del parte y Excel (las librerías se cargan al usarlas) ---------- */
const LOADED={};
function loadLib(k){
  if(k==='pdf'&&window.jspdf&&window.jspdf.jsPDF&&window.jspdf.jsPDF.API.autoTable)return Promise.resolve();
  if(k==='xlsx'&&window.XLSX)return Promise.resolve();
  if(LOADED[k])return LOADED[k];
  LOADED[k]=LIBS[k].reduce((pr,src)=>pr.then(()=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('sin conexión para cargar el generador'));document.head.appendChild(s)})),Promise.resolve()).catch(e=>{LOADED[k]=null;throw e});
  return LOADED[k];
}
const whenX=t=>{const m=String(t||'').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);return m?fS(m[1])+' '+m[2]:String(t||'')};
const SEEDSIG=[[20,60],[40,20,60,20,62,52],[74,84,90,80,104,40],[112,18,128,24,122,58],[118,78,150,30,170,44],[190,58,210,70,228,36],[236,22,250,30,280,40]];
function pdfSig(doc,f,x,y,w,h){if(!f)return;if(f==='seed'){doc.setDrawColor(20,32,42);doc.setLineWidth(.5);const sx=w/300,sy=h/90;let px=x+SEEDSIG[0][0]*sx,py=y+SEEDSIG[0][1]*sy;SEEDSIG.slice(1).forEach(q=>{const nx=x+q[4]*sx,ny=y+q[5]*sy;doc.line(px,py,nx,ny);px=nx;py=ny});doc.setLineWidth(.2);return}try{doc.addImage(f,'PNG',x,y,w,h)}catch(er){}}
const PDF_INK=[20,32,42],PDF_ACC=[182,90,11],PDF_BAND=[19,33,44],PDF_ORG=[240,138,36];
function buildPdf(p){
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=14,e=p.ejec,t=trab(p.pl),c=CT(p.ct),s=sums(p);
  const cl=x=>String(x??'').replace(/[–—]/g,'-').replace(/→/g,'->');
  let y=0;
  doc.setFillColor(...PDF_BAND);doc.rect(0,0,W,24,'F');doc.setFillColor(...PDF_ORG);doc.rect(0,24,W,1.6,'F');
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('VIENTOS DEL SUR',M,11);
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.text('Parte diario de servicio - resumen',M,18);
  doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(p.id,W-M,11,{align:'right'});
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.text(cl(`${fDayL(p.fecha)} · ${EST[p.estado]}`),W-M,18,{align:'right'});
  y=33;
  const sec=tt=>{if(y>262){doc.addPage();y=18}doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...PDF_ACC);doc.text(cl(tt).toUpperCase(),M,y);doc.setDrawColor(220,225,231);doc.line(M,y+1.6,W-M,y+1.6);doc.setTextColor(...PDF_INK);y+=4};
  const base={margin:{left:M,right:M},styles:{font:'helvetica',fontSize:8.6,cellPadding:1.8,textColor:PDF_INK,lineColor:[220,225,231],lineWidth:.2},headStyles:{fillColor:PDF_BAND,textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[247,249,251]},theme:'grid'};
  const tbl=(head,body,o)=>{doc.autoTable(Object.assign({},base,{startY:y,head:head?[head.map(cl)]:undefined,body:body.map(r=>r.map(cl))},o||{}));y=doc.lastAutoTable.finalY+7};
  const kv=rows=>tbl(null,rows,{theme:'plain',styles:Object.assign({},base.styles,{lineWidth:0}),columnStyles:{0:{fontStyle:'bold',textColor:[92,105,118],cellWidth:38},2:{fontStyle:'bold',textColor:[92,105,118],cellWidth:38}}});
  sec('Datos del servicio');
  kv([['Contrato',`${p.ct} · ${c.n}`,'Centro de costo',`${p.cc} · ${p.ccn||c.ccn}`],['Imputación',impL(p.ct,p.imp),'Cliente',OPS[p.op]],['Ubicación',locOf(p),'Recurso',`${recOf(p.rec).n} · ${jefeP(p)}`],['Trabajo',`${p.pl} · día ${p.dia+1} de ${t?t.dias:'-'}`,'Prioridad',PRIO[p.prio]],['Supervisor responsable',p.sup||'-','Responsable técnico',p.rt||'-'],['Llegada a instalación',e.llegada||'-','Al cierre del día',finTxt(p)]]);
  sec('Clima, permiso y seguridad');
  const w=e.clima,pm=e.permiso;
  kv([['Temperatura',w&&w.t!==''?w.t+' °C':'-','Viento / ráfagas',w?`${w.v||'-'} / ${w.r||'-'} km/h ${w.dir}`:'-'],['Condición',w?w.cond:'-','Fuente',w?(w.src==='app'?(w.fuente||'App de clima')+' '+(w.at||''):'Carga manual'):'-'],['Permiso operadora',p.ptw?(pm&&pm.num?pm.num:'Falta'):'No requiere','Firmó',p.ptw&&pm&&pm.firmo?`${pm.firmo} · ${pm.hora}`:'-'],['Charla de seguridad',e.check.charla?'Sí':'No','EPP verificado',e.check.epp?'Sí':'No']]);
  sec(`Personal · ${s.pers} presentes · ${fmtH(s.hh)} hombre`);
  tbl(['Persona','Rol','Ingreso base','Llegada zona','Salida','Horas','Habilitación'],e.personal.map(x=>[x.n,x.rol,x.pres?x.base||'-':'Ausente',x.pres?x.zona||'-':'',x.pres?x.out||'-':'',x.pres&&x.base&&x.out?fmtH(dur(x.base,x.out)):'-',habTxt(hab(x.n,p.op,p.fecha))]));
  sec(`Equipos · ${num(s.km)} km`);
  tbl(['Equipo','Km actual','Recorrido','Observación','Habilitación'],e.equipos.map(q=>{const pk=lastKm(q.c,p);return [`${q.c} ${EQ[q.c]}`,q.km===''?'-':num(q.km),q.km!==''&&pk!==null?num(q.km-pk)+' km':'-',q.obs||'-',habTxt(hab(q.c,p.op,p.fecha))]}));
  sec('Producción del día');
  const pr=prod(p);tbl(['Tarea','Cantidad','Unidad','Origen'],pr.length?pr.map(x=>[x.d,x.q?num(x.q):'-',x.u,p.prev.includes(x.d)?'Prevista':inCat(p.ct,x.d)?'Adicional':'Fuera de catálogo']):[['Sin tareas','','','']]);
  sec(`Tareas y tiempos · ${fmtH(s.jor)}`);
  tbl(['Desde','Hasta','Categoría','Tarea / motivo / detalle','Cantidad'],e.reg.slice().sort((a,b)=>mins(a.de)-mins(b.de)).map(x=>[x.de,x.a,TCAT[x.c],(x.d||'-')+(x.det?' · '+x.det:''),regQ(x)]));
  if(p.fin==='fin'&&t){const tt=trabTotals(t,p);sec(`Cierre del trabajo ${p.pl} · ${tt.dias} día(s) · ${fmtH(tt.hh)} hombre`);tbl(['Tarea','Total del trabajo'],tt.prod.map(x=>[x.d,num(x.q)+' '+x.u]));if(p.cierreObs){doc.setFontSize(9);const l2=doc.splitTextToSize(cl('Observación final: '+p.cierreObs),W-2*M);doc.text(l2,M,y);y+=l2.length*4.2+6}}
  if(p.fin==='ext'&&p.ext){sec('Pedido de extensión');doc.setFontSize(9);const l3=doc.splitTextToSize(cl(`${p.ext.dias} día(s) más. ${p.ext.motivo}`),W-2*M);doc.text(l3,M,y+2);y+=l3.length*4.2+8}
  sec('Observaciones');
  doc.setFont('helvetica','normal');doc.setFontSize(9);const lines=doc.splitTextToSize(cl(e.obs||'Sin observaciones.'),W-2*M);doc.text(lines,M,y+2);y+=lines.length*4.2+8;
  const ck=checks(p);
  if(ck.length){sec('Controles automáticos');tbl(['Nivel','Detalle'],ck.map(x=>[x[0]==='err'?'Bloqueante':'Alerta',x[1]]),{columnStyles:{0:{cellWidth:28}}})}
  if(y>230){doc.addPage();y=18}
  sec('Firmas y aprobaciones');
  const bw=(W-2*M-8)/3,by=y+2;
  [[jefeP(p),'Jefe de cuadrilla','',e.firma],[p.dec&&p.dec.d==='ok'?p.dec.who:'Pendiente','Aprobación VDS',p.dec&&p.dec.d==='ok'?whenX(p.dec.t):'',null],[p.cert?p.cert.who:'Pendiente','Certificación '+OPS[p.op],p.cert?whenX(p.cert.t):'',p.cert?p.cert.firma:null]].forEach((b,i)=>{
    const x=M+i*(bw+4);doc.setDrawColor(200,207,216);doc.roundedRect(x,by,bw,32,2,2);
    pdfSig(doc,b[3],x+4,by+2,bw*.8,14);
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...PDF_INK);doc.text(cl(b[0]),x+3,by+23,{maxWidth:bw-6});
    doc.setFont('helvetica','normal');doc.setFontSize(7.6);doc.setTextColor(92,105,118);doc.text(cl(b[1]+(b[2]?' · '+b[2]:'')),x+3,by+28.5,{maxWidth:bw-6});});
  y=by+40;doc.setTextColor(...PDF_INK);
  sec('Historial');
  tbl(['Fecha','Persona','Acción','Comentario'],p.hist.map(x=>[whenX(x.t),x.who,x.a,x.c||'']),{columnStyles:{0:{cellWidth:26},1:{cellWidth:42},2:{cellWidth:44}}});
  const ph=e.fotos.filter(f=>f.src);
  if(ph.length){doc.addPage();y=18;sec('Registro fotográfico');y+=2;ph.forEach((f,i)=>{const col=i%2,row=Math.floor(i/2)%3;if(i&&i%6===0){doc.addPage();y=20}const x=M+col*93,yy=y+row*76;try{doc.addImage(f.src,'JPEG',x,yy,88,64)}catch(er){}doc.setFontSize(8);doc.setTextColor(92,105,118);doc.text(cl(f.cap),x,yy+69)})}
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(7.5);doc.setTextColor(137,148,160);doc.text(cl(`VDS Partes de campo · ${p.id} · generado el ${fDay(TODAY)} ${TODAY.slice(0,4)} ${hm()}`),M,290);doc.text(`Página ${i} de ${n}`,W-M,290,{align:'right'})}
  return doc.output('blob');
}
async function downloadPdf(id){
  const p=byId(id);if(!p||!p.ejec){toast('Este parte todavía no tiene datos para exportar');render();return}
  try{await loadLib('pdf')}catch(e){toast('No se pudo cargar el generador de PDF: '+e.message);render();return}
  let blob;try{blob=buildPdf(p)}catch(e){toast('No se pudo armar el PDF');render();return}
  await saveBlob(blob,`${p.id}_${p.fecha}_${fname(p.pozo)}.pdf`,`PDF de ${p.id} descargado`);
}
async function saveBlob(blob,filename,okMsg){
  const inClaude=!!(window.claude&&window.claude.use);
  if(!inClaude){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast(okMsg);render();return}
  let dl=null;try{dl=await window.claude.use('downloads')}catch(e){dl=null}
  if(!dl){toast('La descarga no está disponible en esta vista');render();return}
  try{await dl.save({filename,data:blob});toast(okMsg)}
  catch(e){if(e&&e.code==='declined')return;toast('No se pudo descargar el archivo')}
  render();
}

/* ---------- Excel ---------- */
const h2=m=>Math.round(m/60*100)/100;
const xd=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)};
const fname=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9-]+/g,'-');
function xlsxBlob(sheets){const wb=XLSX.utils.book_new();sheets.forEach(([name,rows,widths])=>{const ws=XLSX.utils.aoa_to_sheet(rows,{dateNF:'dd/mm/yyyy'});if(widths)ws['!cols']=widths.map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,ws,name)});
  return new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
async function exportDash(){
  try{await loadLib('xlsx')}catch(e){toast('No se pudo cargar el generador de Excel: '+e.message);render();return}
  const {op,ctF,impF,ps}=dashSel();if(!ps.length)return;
  const first=ps[0].fecha,last=ps[ps.length-1].fecha;
  let hh=0,km=0;const byc={},pr={},byImp={};
  const rP=[],rPr=[],rT=[],rPe=[],rE=[];
  ps.forEach(p=>{const s=sums(p),e=p.ejec;hh+=s.hh;km+=s.km;Object.entries(s.byc).forEach(([k,v])=>byc[k]=(byc[k]||0)+v);
    byImp[p.imp]=byImp[p.imp]||{ct:p.ct,n:0,hh:0};byImp[p.imp].n++;byImp[p.imp].hh+=s.hh;
    rP.push([p.id,xd(p.fecha),EST[p.estado],p.ct,p.imp,impN(p.ct,p.imp),`${p.cc} · ${p.ccn||CT(p.ct).ccn}`,locOf(p),p.pl,p.dia+1,recOf(p.rec).n,s.pers,h2(s.hh),h2(s.byc.op||0),h2(s.byc.tr||0),h2(s.byc.es||0),h2(s.byc.vi||0),h2(s.byc.sb||0),h2(s.byc.rf||0),s.km,p.dec&&p.dec.d==='ok'?p.dec.who:'',p.dec&&p.dec.d==='ok'?whenX(p.dec.t):'',p.cert?p.cert.who:'',p.cert?whenX(p.cert.t):'']);
    prod(p).forEach(x=>{rPr.push([p.id,xd(p.fecha),p.ct,p.imp,locOf(p),x.d,x.q,x.u,p.prev.includes(x.d)?'Prevista':inCat(p.ct,x.d)?'Adicional':'Fuera de catálogo']);const k=x.d+'|'+x.u;pr[k]=pr[k]||{d:x.d,u:x.u,q:0};pr[k].q+=x.q});
    e.reg.slice().sort((a,b)=>(mins(a.de)??0)-(mins(b.de)??0)).forEach(x=>rT.push([p.id,xd(p.fecha),p.imp,TCAT[x.c],x.de,x.a,h2(dur(x.de,x.a)),x.d||'',(x.c==='op'||x.c==='vi')&&Number(x.q)>0?Number(x.q):'',x.c==='vi'?'km/h':x.c==='op'?x.u:'',x.det||'']));
    e.personal.forEach(x=>rPe.push([p.id,xd(p.fecha),p.imp,x.n,x.rol,x.pres?'Sí':'No',x.pres?x.base:'',x.pres?x.zona:'',x.pres?x.out:'',x.pres&&x.base&&x.out?h2(dur(x.base,x.out)):'']));
    e.equipos.forEach(q=>{const pk=lastKm(q.c,p);rE.push([p.id,xd(p.fecha),p.imp,q.c,EQ[q.c],q.km===''?'':Number(q.km),q.km!==''&&pk!==null?Number(q.km)-pk:'',q.obs||''])})});
  const impCt=impF==='all'?null:(ps.find(p=>p.imp===impF)||{}).ct||ctF;
  const res=[['Vientos del Sur · Partes de campo'],[],['Cliente',OPS[op]],['Contrato',ctF==='all'?'Todos':`${ctF} · ${CT(ctF).n}`],['Imputación',impF==='all'?'Todas':impL(impCt,impF)],['Desde',xd(S.dfrom||first)],['Hasta',xd(S.dto||last)],['Partes incluidos','Aprobados por VDS y certificados'],['Generado',`${fS(TODAY)} ${hm()} por ${meN()}`],[],
    ['Indicador','Valor','Unidad'],['Partes',ps.length,''],['Horas hombre',h2(hh),'h'],...TORD.map(k=>[TCAT[k],h2(byc[k]||0),'h']),['Km recorridos',km,'km'],[],
    ['Producción','Cantidad','Unidad'],...Object.values(pr).map(x=>[x.d,x.q,x.u]),[],
    ['Imputación','Descripción','Partes','Horas hombre'],...Object.keys(byImp).sort(natCmp).map(k=>{const v=byImp[k];return [k,impN(v.ct,k),v.n,h2(v.hh)]})];
  const sheets=[['Resumen',res,[28,44,12,14]],
    ['Partes',[['Nº parte','Fecha','Estado','Contrato','Imputación','Descripción imputación','Centro de costo','Ubicación','Trabajo','Día','Recurso','Personas','Horas hombre','Horas operativas','Traslado (h)','Espera operadora (h)','Parada por viento (h)','Standby (h)','Refrigerio (h)','Km','Aprobado por','Aprobación','Certificado por','Certificación'],...rP],[10,11,14,14,22,30,26,30,8,5,16,9,11,11,10,12,12,10,10,8,16,14,26,14]],
    ['Producción',[['Nº parte','Fecha','Contrato','Imputación','Ubicación','Tarea','Cantidad','Unidad','Origen'],...rPr],[10,11,14,22,22,30,10,9,16]],
    ['Tiempos',[['Nº parte','Fecha','Imputación','Categoría','Desde','Hasta','Horas','Tarea / motivo','Cantidad','Unidad','Detalle'],...rT],[10,11,22,18,7,7,7,30,9,8,30]],
    ['Personal',[['Nº parte','Fecha','Imputación','Persona','Rol','Presente','Ingreso base','Llegada zona','Salida','Horas'],...rPe],[10,11,22,22,20,9,11,11,8,7]],
    ['Equipos',[['Nº parte','Fecha','Imputación','Equipo','Descripción','Km actual','Recorrido km','Observación'],...rE],[10,11,22,10,24,11,12,30]]];
  logA('Exportación a Excel del dashboard',ctF==='all'?OPS[op]:ctF,`${ps.length} partes · ${fS(S.dfrom||first)} a ${fS(S.dto||last)}${impF!=='all'?' · '+impF:''}`,'','export');
  saveBlob(xlsxBlob(sheets),`VDS_${fname(op)}_${fname(ctF==='all'?'todos':ctF)}_${fname(impF==='all'?'todas':impF)}_${S.dfrom||first}_${S.dto||last}.xlsx`,`Excel descargado · ${ps.length} partes`);
}
async function exportLog(){
  try{await loadLib('xlsx')}catch(e){toast('No se pudo cargar el generador de Excel: '+e.message);render();return}
  const rows=logRows();if(!rows.length)return;
  const data=[['Fecha','Hora','Usuario','Rol','Tipo','Acción','Sobre','Detalle','Motivo'],...rows.map(x=>[xd(x.ts.slice(0,10)),x.ts.slice(11,16),x.who,x.rol,LTYPE[x.tipo]||x.tipo,x.accion,x.obj,x.det,x.mot])];
  logA('Exportación del registro de actividad','',`${rows.length} filas`,'','export');
  saveBlob(xlsxBlob([['Registro',data,[11,7,20,18,14,34,16,40,50]]]),`VDS_registro_actividad_${TODAY}.xlsx`,`Registro exportado · ${rows.length} filas`);
}
