import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./fixture/index.html', import.meta.url));
const port = Number(process.env.PORT || 4173);
const server = createServer((request, response) => {
  const pathname = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`).pathname;
  if (pathname === '/healthz') {
    response.writeHead(204).end();
    return;
  }
  if (pathname === '/' || pathname === '/index.html') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html);
    return;
  }
  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
});

server.listen(port, '127.0.0.1', () => console.log(`Browser fixture listening on http://127.0.0.1:${port}`));
