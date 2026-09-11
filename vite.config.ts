import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, Plugin} from 'vite';

function supabaseProxyPlugin(): Plugin {
  const handler = async (req: any, res: any, next: any) => {
    if (!req.url?.startsWith('/api/supabase/proxy')) {
      return next();
    }

    try {
      const parsedUrl = new URL(req.url, 'http://localhost:3000');
      const targetUrl = parsedUrl.searchParams.get('url');
      if (!targetUrl) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing target url parameter' }));
        return;
      }

      const parsedTarget = new URL(targetUrl);
      if (!parsedTarget.protocol.startsWith('http')) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid protocol' }));
        return;
      }

      // Collect request body for non-GET/HEAD methods
      const chunks: any[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

      const forwardHeaders: Record<string, string> = {};
      const skipHeaders = new Set(['host', 'connection', 'origin', 'referer', 'content-length', 'cookie']);
      for (const [k, v] of Object.entries(req.headers)) {
        if (!skipHeaders.has(k.toLowerCase()) && typeof v === 'string') {
          forwardHeaders[k] = v;
        }
      }

      const proxyRes = await fetch(targetUrl, {
        method: req.method || 'GET',
        headers: forwardHeaders,
        body: (req.method !== 'GET' && req.method !== 'HEAD') ? body : undefined,
      });

      res.statusCode = proxyRes.status;
      if (proxyRes.statusText) {
        res.statusMessage = proxyRes.statusText;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD');
      res.setHeader('Access-Control-Allow-Headers', '*');

      const contentType = proxyRes.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const text = await proxyRes.text();
        res.statusCode = proxyRes.status >= 400 ? proxyRes.status : 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          code: 'PGRST_HTML_RESPONSE',
          error: 'HTML response received',
          message: 'Máy chủ Supabase phản hồi bằng trang HTML thay vì JSON (Dự án có thể không tồn tại hoặc bị tạm dừng trên Supabase).',
          details: text.slice(0, 300),
        }));
        return;
      }

      proxyRes.headers.forEach((val, key) => {
        const lk = key.toLowerCase();
        if (lk !== 'content-encoding' && lk !== 'transfer-encoding' && lk !== 'connection') {
          res.setHeader(key, val);
        }
      });

      const arrayBuffer = await proxyRes.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } catch (err: any) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ 
        code: 'PGRST_PROXY_FAILED',
        error: 'Proxy fetch failed', 
        message: `Không thể kết nối đến máy chủ Supabase: ${err?.message || 'Lỗi mạng hoặc không tìm thấy tên miền'}.`,
        details: err?.message || String(err) 
      }));
    }
  };

  return {
    name: 'supabase-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), supabaseProxyPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
