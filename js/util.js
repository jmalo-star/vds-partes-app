/* ---------- utilidades: texto, horas y fechas ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
const natCmp=(a,b)=>String(a).localeCompare(String(b),'es',{numeric:true,sensitivity:'base'});
const iniOf=n=>String(n).split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'?';
const userOf=n=>{const w=norm(n).replace(/[^a-z\s]/g,'').split(/\s+/).filter(Boolean);return w.length>1?w[0][0]+w[w.length-1]:(w[0]||'usuario')};

const mins=h=>{if(!h||!/^\d{1,2}:\d{2}$/.test(h))return null;const[a,b]=h.split(':').map(Number);return a*60+b};
const dur=(a,b)=>{const x=mins(a),y=mins(b);if(x==null||y==null)return 0;let d=y-x;if(d<0)d+=1440;return d};
const addM=(h,m)=>{const t=((mins(h)+m)%1440+1440)%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
const fmtH=m=>{const h=Math.floor(m/60),mm=Math.round(m%60);return h+' h'+(mm?' '+String(mm).padStart(2,'0'):'')};
const hDec=m=>(m/60).toLocaleString('es-AR',{maximumFractionDigits:1});
const num=n=>Number(n).toLocaleString('es-AR');

const DIAS=['dom','lun','mar','mié','jue','vie','sáb'];
const DIASL=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESL=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESI={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
const d8=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const addDays=(s,n)=>{const d=d8(s);d.setDate(d.getDate()+n);return iso(d)};
const diffD=(a,b)=>Math.round((d8(b)-d8(a))/864e5);

/* Fecha de hoy real. Se actualiza en cada render por si la app queda abierta de un día para otro. */
let TODAY=iso(new Date());
const dRel=n=>addDays(TODAY,n);          // fecha relativa a hoy (datos de ejemplo)
const fDay=s=>{const d=d8(s);return DIAS[d.getDay()]+' '+d.getDate()+' '+MES[d.getMonth()]};
const fDayM=s=>{const d=d8(s);return DIASL[d.getDay()]+' '+d.getDate()+' de '+MESL[d.getMonth()]};
const fDayL=s=>fDayM(s)+' de '+s.slice(0,4);
const fS=s=>{const[y,m,d]=s.split('-');return d+'/'+m+'/'+y.slice(2)};
const hm=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const hm5=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(Math.floor(d.getMinutes()/5)*5).padStart(2,'0')};
const tsNow=()=>{const d=new Date();return iso(d)+'T'+hm()+':'+String(d.getSeconds()).padStart(2,'0')+'.'+String(d.getMilliseconds()).padStart(3,'0')};
/* Marcas de tiempo del historial: se guardan como 'AAAA-MM-DDTHH:MM' y se muestran con when() */
const nowT=()=>tsNow().slice(0,16);
const stamp=(f,h)=>f+'T'+h;
const when=t=>{const m=String(t||'').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);if(!m)return String(t||'');const f=m[1];
  return (f===TODAY?'hoy':f===addDays(TODAY,-1)?'ayer':d8(f).getDate()+' '+MES[d8(f).getMonth()]+(f.slice(0,4)!==TODAY.slice(0,4)?' '+f.slice(0,4):''))+' '+m[2]};
function parseStamp(s){s=String(s||'');if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s))return s.slice(0,16);
  const m=s.match(/^hoy (\d{2}:\d{2})$/);if(m)return TODAY+'T'+m[1];
  const k=s.match(/^(\d{1,2}) (\w{3}) (\d{2}:\d{2})$/);if(k&&MESI[k[2]]!=null)return iso(new Date(Number(TODAY.slice(0,4)),MESI[k[2]],Number(k[1])))+'T'+k[3];
  return TODAY+'T00:00'}
const mondayOf=s=>{const d=d8(s);const w=(d.getDay()+6)%7;return addDays(s,-w)};
