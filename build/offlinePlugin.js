import { createHash } from 'node:crypto';

// Precache the production frontend, including lazy mission chunks. API responses
// are never cached or replayed: offline hardware must remain unavailable.
export function offlinePlugin() {
  return {
    name:'heatsense-offline-shell',
    apply:'build',
    generateBundle(_,bundle) {
      const files=['/','/index.html','/favicon.svg',...Object.keys(bundle).filter(name=>/\.(js|css|svg|woff2?)$/.test(name)).map(name=>`/${name}`)];
      const version=createHash('sha256').update(files.join('|')).digest('hex').slice(0,12);
      const source=`const CACHE='heatsense-shell-${version}';
const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=(await caches.keys()).filter(key=>key.startsWith('heatsense-shell-'));const previous=keys.filter(key=>key!==CACHE).slice(-1);await Promise.all(keys.filter(key=>key!==CACHE&&!previous.includes(key)).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/')||url.pathname.startsWith('/device-api'))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(async()=>{const cache=await caches.open(CACHE);return await cache.match('/index.html');}));return;}
if(FILES.includes(url.pathname)){event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));}});`;
      this.emitFile({type:'asset',fileName:'sw.js',source});
    },
  };
}
