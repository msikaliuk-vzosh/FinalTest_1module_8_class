"use strict";
const CACHE="informatics-grade9-shell-1";const ROOT=new URL("./",self.location.href);
const URLS=["./", "create/", "process/", "create/lesson.js", "process/lesson.js", "assets/engine.js", "assets/list-model.js", "assets/list-view.js", "assets/practice.js", "assets/style.css"].map(p=>new URL(p,ROOT).href);
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(URLS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||!URLS.includes(e.request.url))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request)));});
