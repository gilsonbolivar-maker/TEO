/*
 * Service worker: guarda o programa no aparelho para abrir sem internet.
 * Ao mudar qualquer arquivo do app, suba o número da versão abaixo.
 */

const VERSAO = 'teo-v17';

const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/estilo.css',
  './assets/js/dados.js',
  './assets/js/armazenamento.js',
  './assets/js/estatisticas.js',
  './assets/js/app.js',
  './assets/img/icone-192.png',
  './assets/img/icone-512.png',
  './assets/img/apple-touch-icon.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(c => c !== VERSAO).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evento => {
  const req = evento.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  /* Ao abrir o app: tenta a rede primeiro para pegar a versão nova; sem rede, usa o que está guardado. */
  if (req.mode === 'navigate') {
    evento.respondWith(
      fetch(req)
        .then(resposta => {
          const copia = resposta.clone();
          caches.open(VERSAO).then(cache => cache.put('./index.html', copia));
          return resposta;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  /* Demais arquivos: responde do cache na hora e atualiza em segundo plano. */
  evento.respondWith(
    caches.match(req).then(guardado => {
      const daRede = fetch(req)
        .then(resposta => {
          if (resposta && resposta.status === 200) {
            const copia = resposta.clone();
            caches.open(VERSAO).then(cache => cache.put(req, copia));
          }
          return resposta;
        })
        .catch(() => guardado);
      return guardado || daRede;
    })
  );
});
