/* VDS · Partes de campo — service worker
   Guarda la app en la tablet para que abra y funcione sin señal.
   Archivos propios: red primero (siempre la última versión) y caché si no hay señal.
   Librerías y fuentes de CDN: caché primero (las URL tienen versión fija).
   Subí VERSION en cada publicación para limpiar la caché vieja. */
const VERSION='vds-partes-0.7.0';
const SHELL=['./','index.html','css/app.css','manifest.webmanifest',
  'js/config.js','js/util.js','js/data.js','js/import.js','js/state.js','js/ui.js','js/views-plan.js','js/views-parte.js','js/views-review.js','js/views-admin.js','js/modals.js','js/export.js','js/actions.js','js/main.js',
  'assets/img/login-noche.webp','assets/img/login-dia.webp','assets/img/campo.webp',
  'assets/icons/favicon.svg','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/maskable-512.png','assets/icons/apple-touch-icon.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];

self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(VERSION);await c.addAll(SHELL);
  for(const u of CDN){try{await c.add(new Request(u,{mode:'cors'}))}catch(_){}}
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==VERSION)await caches.delete(k);
  await self.clients.claim();
})())});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===self.location.origin){
    e.respondWith((async()=>{
      const c=await caches.open(VERSION);
      const net=fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res});
      const late=new Promise(res=>setTimeout(()=>res(null),4000));
      try{const res=await Promise.race([net,late]);if(res)return res}catch(_){}
      const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('index.html'):null);
      if(hit)return hit;
      try{return await net}catch(_){return Response.error()}
    })());
    return;
  }
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$|^cdnjs\.cloudflare\.com$/.test(u.hostname)){
    e.respondWith((async()=>{
      const c=await caches.open(VERSION);const hit=await c.match(r);if(hit)return hit;
      try{const res=await fetch(r);if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}catch(_){return Response.error()}
    })());
  }
});
