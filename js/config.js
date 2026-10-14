/* ============================================================
   VDS · Partes de campo — configuración, constantes e íconos
   Los scripts se cargan en orden (ver index.html) y comparten
   el ámbito global: config → util → data → import → state → ui
   → vistas → modals → export → actions → main.
   ============================================================ */
const APP_VERSION='0.7.1';
const KEY='vds-partes-proto-7';          // estado guardado en el dispositivo (localStorage)
const THEME_KEY='vds-theme';             // preferencia de modo diurno / nocturno
const EVAL=true;                         // versión de evaluación: usuarios de prueba y datos locales
const PW='vds2026';                      // clave de los usuarios de prueba (solo en evaluación)
const DH=800,MINW=1180;                  // alto de diseño y ancho mínimo: cada pantalla entra sin scroll
const SH0='06:00',SHW=840;               // línea de tiempo del parte: de 06:00 a 20:00
const BASE_GEO={lat:-45.8641,lon:-67.4966,n:'Comodoro Rivadavia'};   // clima si la tablet no da ubicación

/* Usuarios de prueba. En producción salen del directorio de la empresa (ver README). */
const USERS={
  admin:{id:'sherrera',n:'Sofía Herrera',ini:'SH',rol:'admin',cargo:'Administración del sistema'},
  planner:{id:'lmendez',n:'Laura Méndez',ini:'LM',rol:'planner',cargo:'Planificación · Base Comodoro'},
  planner2:{id:'jdiaz',n:'Jorge Díaz',ini:'JD',rol:'planner',cargo:'Planificación · Base Comodoro'},
  operador:{id:'darce',n:'Diego Arce',ini:'DA',rol:'operador',cargo:'Jefe · Cuadrilla 03',rec:'C-03'},
  cliente:{id:'grivas',n:'Gustavo Rivas',ini:'GR',rol:'cliente',cargo:'Supervisor de contrato · Austral Petróleo',op:'AUP'}
};
const ROLE_N={admin:'Administrador',planner:'Planner',operador:'Operador',cliente:'Cliente'};
const ROLE_D={admin:'Ve y cambia todo, y ve el registro de actividad',planner:'Planifica los trabajos y aprueba los partes',operador:'Completa el parte diario y cierra el trabajo',cliente:'Dashboard, exportación a Excel y certificación con firma'};
const HOME={admin:'p-plan',planner:'p-plan',operador:'o-day',cliente:'c-dash'};

const UNITS=['m³','m²','m','t','km','viaje','maniobra','h','día','unidad'];
const TCAT={op:'Operativo',tr:'Traslado',es:'Espera operadora',vi:'Parada por viento',sb:'Standby',rf:'Refrigerio'};
const TORD=['op','tr','es','vi','sb','rf'];
const ESP=['Permiso de trabajo','Responsable Operadora','Espera de un Tercero','Almacén'];
const EST={plan:'Planificado',curso:'En curso',env:'Para aprobar',obs:'Observado',apr:'Para certificar',cert:'Certificado'};
const PRIO={urg:'Urgente',alta:'Alta',media:'Media',baja:'Baja'};
const PRIO_C={urg:'var(--st-err)',alta:'var(--pr-alta)',media:'var(--st-plan)',baja:'var(--faint)'};
const DIRS=['N','NE','E','SE','S','SO','O','NO'];
const CONDS=['Despejado','Nublado parcial','Nublado','Ventoso','Lluvia','Nieve'];
const STEPS=['Inicio','Personal y equipos','Tareas y tiempos','Cierre'];
const STEP_OF={Inicio:0,Personal:1,Equipos:1,Tareas:2,Cierre:3};
const STEP_SEC=[['Inicio'],['Personal','Equipos'],['Tareas'],['Cierre']];
const ORDS=[[0,'Sin orden'],[1,'1º'],[2,'2º'],[3,'3º'],[4,'4º'],[5,'5º']];

/* Librerías que se cargan solo cuando hacen falta (PDF y Excel) */
const LIBS={
  pdf:['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'],
  xlsx:['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js']
};

const P_IC={
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  gantt:'<path d="M4 5v14M4 7h8M7 12h10M10 17h9"/>',
  rows:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  day:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11h6M9 15h4"/>',
  shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  badge:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17c.8-1.8 2.3-2.7 4-2.7s3.2.9 4 2.7"/>',
  stamp:'<path d="M9 4h6l-1 7h-4z"/><path d="M5 15h14v3H5zM7 21h10"/>',
  chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  out:'<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  wifi:'<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M9 16a4.5 4.5 0 0 1 6 0M12 19.5h.01"/>',
  nowifi:'<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M9 16a4.5 4.5 0 0 1 6 0M12 19.5h.01M3 3l18 18"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  alert:'<path d="M12 3.5l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  err:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  okc:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  wind:'<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  right:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  left:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chl:'<path d="M15 6l-6 6 6 6"/>',
  chr:'<path d="M9 6l6 6-6 6"/>',
  down:'<path d="M6 9l6 6 6-6"/>',
  dbl:'<path d="M17 6l-6 6 6 6M11 6l-6 6 6 6"/>',
  dbr:'<path d="M7 6l6 6-6 6M13 6l6 6-6 6"/>',
  pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.2 3.2 0 0 1 0 6.3M21 20c0-2.6-1.6-4.8-4-5.6"/>',
  truck:'<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  send:'<path d="M4 12l16-8-6 16-3-6.5z"/><path d="M11 13.5L20 4"/>',
  cloud:'<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/><path d="M9.5 13.5l2 2 3.5-4"/>',
  back:'<path d="M9 14l-5-5 5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  pdf:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6M9 9h2"/>',
  doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  sign:'<path d="M3 17c3-1 4-6 6-6s1 5 3 5 2-3 4-3 2 2 5 2"/><path d="M3 21h18"/>',
  filter:'<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  log:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  xls:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 11l5 6M14 11l-5 6"/>',
  wallet:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14.5h2"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4"/>'
};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P_IC[n]}</svg>`;
