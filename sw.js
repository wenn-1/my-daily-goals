const CACHE='daily-goals-v3';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(f=>c.add(f)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.pathname.endsWith('/')||url.pathname.endsWith('index.html')){
  // 页面用网络优先，保证更新能及时生效；离线时回退到缓存
  e.respondWith(fetch(e.request).then(resp=>{
   const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  return;
 }
 // 静态资源用缓存优先，后台更新
 e.respondWith(caches.match(e.request).then(r=>{
  const fetchP=fetch(e.request).then(resp=>{
   if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
   return resp;
  }).catch(()=>r);
  return r||fetchP;
 }));
});
