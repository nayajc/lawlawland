// 국가법령정보 Open API 고정 IP 프록시 (jcmain). 등록 IP = 이 서버의 공인 IP.
// env: LAW_API_OC (인증값), PROXY_TOKEN (Vercel과 공유하는 비밀값), PORT(기본 8080)
import http from 'node:http';

const OC = process.env.LAW_API_OC;
const TOKEN = process.env.PROXY_TOKEN;
const ALLOWED = new Set(['/DRF/lawSearch.do', '/DRF/lawService.do']);
if (!OC || !TOKEN) throw new Error('LAW_API_OC and PROXY_TOKEN are required');

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/health') return res.end('ok');
  if (req.headers['x-proxy-token'] !== TOKEN) { res.statusCode = 401; return res.end('unauthorized'); }
  if (!ALLOWED.has(url.pathname) || url.searchParams.get('target') !== 'prec') { res.statusCode = 403; return res.end('forbidden'); }
  url.searchParams.set('OC', OC);
  try {
    const up = await fetch(`https://www.law.go.kr${url.pathname}${url.search}`, { signal: AbortSignal.timeout(15000) });
    res.statusCode = up.status;
    res.setHeader('content-type', up.headers.get('content-type') ?? 'application/json');
    res.end(Buffer.from(await up.arrayBuffer()));
  } catch {
    res.statusCode = 502; res.end('upstream error');
  }
}).listen(process.env.PORT || 8080);
