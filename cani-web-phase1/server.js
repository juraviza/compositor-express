const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3187);
const HOST = process.env.HOST || '0.0.0.0';
const APP_USER = process.env.CANI_USER || 'canijo';
const APP_PASS = process.env.CANI_PASS || 'cani1234';
const API_TARGET = process.env.CANI_API_TARGET || 'http://127.0.0.1:3000';
const WEB_ROOT = __dirname;

function unauthorized(res) {
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="CANI-APP privada"',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('Acceso restringido');
}

function isAuthorized(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) return false;
  const raw = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const idx = raw.indexOf(':');
  if (idx === -1) return false;
  const user = raw.slice(0, idx);
  const pass = raw.slice(idx + 1);
  return user === APP_USER && pass === APP_PASS;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  })[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(data);
  });
}

function proxyApi(req, res) {
  const targetUrl = new URL(req.url, API_TARGET);
  const client = targetUrl.protocol === 'https:' ? require('https') : require('http');
  const headers = { ...req.headers };
  headers.host = targetUrl.host;
  delete headers.origin;
  delete headers.referer;
  delete headers.authorization;

  const proxyReq = client.request(targetUrl, {
    method: req.method,
    headers,
  }, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    delete headers['content-security-policy'];
    headers['access-control-allow-origin'] = '*';
    res.writeHead(proxyRes.statusCode || 502, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, message: 'Error conectando con backend CANI.', error: error.message }));
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (!isAuthorized(req)) return unauthorized(res);

  if ((req.method === 'OPTIONS') && req.url.startsWith('/api/')) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.url.startsWith('/api/')) {
    return proxyApi(req, res);
  }

  let filePath = path.join(WEB_ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (req.url === '/' || req.url === '') filePath = path.join(WEB_ROOT, 'index.html');
  if (!filePath.startsWith(WEB_ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Prohibido');
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    serveFile(res, filePath);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`CANI web privada escuchando en http://${HOST}:${PORT}`);
  console.log(`Usuario: ${APP_USER}`);
  console.log(`Proxy API -> ${API_TARGET}`);
});
