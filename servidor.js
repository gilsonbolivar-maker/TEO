/*
 * Servidor estático mínimo, sem dependências.
 * Existe para o caso de publicar como "Web Service" no Render.
 * Para publicar como "Static Site" ou no GitHub Pages, este arquivo é ignorado.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTA = process.env.PORT || 3000;
const RAIZ = __dirname;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

const servidor = http.createServer((req, res) => {
  const pedido = decodeURIComponent(req.url.split('?')[0]);
  const relativo = pedido === '/' ? 'index.html' : pedido.replace(/^\/+/, '');
  const alvo = path.join(RAIZ, relativo);

  /* Impede sair da pasta do projeto (../../etc/passwd e afins). */
  if (!alvo.startsWith(RAIZ + path.sep) && alvo !== path.join(RAIZ, 'index.html')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Acesso negado');
  }

  fs.readFile(alvo, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404</h1><p>Página não encontrada. <a href="/">Voltar ao programa</a></p>');
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(conteudo);
  });
});

servidor.listen(PORTA, '0.0.0.0', () => {
  console.log(`Programa Motivacional Teo Neto rodando na porta ${PORTA}`);
});
