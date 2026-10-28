"use strict";
const CACHE="informatics-pages-shell-1";
const FILES=["./","buttons/","fields/","buttons/lesson.js","fields/lesson.js","assets/engine.js","assets/practice.js","assets/style.css"];
const ROOT=new URL("./",self.location.href);
const URLS=FILES.map(path=>new URL(path,ROOT).href);
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(URLS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET"||!URLS.includes(event.request.url))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(c=>c.put(event.request,response.clone()));return response;}).catch(()=>caches.match(event.request)));
});
