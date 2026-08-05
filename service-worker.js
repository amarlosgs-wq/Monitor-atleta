// Monitor Atleta — Service Worker
// Estratégia: NETWORK-FIRST para tudo. Isso significa que o app SEMPRE tenta
// buscar a versão mais nova no servidor primeiro; só usa o cache guardado se
// estiver sem internet. Isso evita o problema clássico de "atualizei o site
// mas continua aparecendo a versão velha" — o cache aqui é rede de segurança
// pra modo offline, não a fonte principal.

const CACHE_VERSION = 'monitor-atleta-v2'; // ⚠️ troque esse número toda vez que
                                            // fizer uma mudança grande — isso
                                            // força todo mundo a pegar a versão nova
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  // não espera as abas antigas fecharem — assume a versão nova imediatamente
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_VERSION) // apaga QUALQUER cache de versão antiga
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim()) // assume controle das abas já abertas na hora
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // sucesso online: guarda uma cópia fresca no cache e devolve a resposta da rede
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        // sem internet: tenta achar no cache; se não tiver, deixa falhar mesmo
        caches.match(event.request).then((cached) => cached || Promise.reject('offline e sem cache'))
      )
  );
});
