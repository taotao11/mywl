// 文件名: _worker.js (必须放在项目根目录)
// 此脚本专为 Cloudflare Pages 设计

export default {
  async fetch(request, env) {
    const UA = request.headers.get('user-agent') || '';
    const isBot = UA.includes('bot') || UA.includes('spider');
    const url = new URL(request.url);

    // 配置参数 (修改这里)
    const UUID = 'd342d11f-d8b3-4d54-8c1c-example12345'; // 替换为你的UUID
    const PROXY_PATH = '/proxy'; // 代理路径
    const FAKE_PAGE = `<!DOCTYPE html><html><body>
      <h1>Welcome to Cloudflare Pages</h1>
      <p>This is a normal website page</p>
    </body></html>`;

    // 处理代理请求
    if (url.pathname.includes(PROXY_PATH)) {
      const vlessConfig = {
        v: "2",
        ps: "CF-Pages-VLESS",
        add: url.hostname,
        port: "443",
        id: UUID,
        aid: "0",
        scy: "none",
        net: "ws",
        type: "none",
        host: url.hostname,
        path: PROXY_PATH,
        tls: "tls",
        sni: url.hostname,
        alpn: ""
      };

      // 返回配置信息
      if (url.pathname.endsWith('/info')) {
        return new Response(JSON.stringify(vlessConfig, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
          }
        });
      }

      // 处理WebSocket升级
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader === 'websocket') {
        return await handleWebSocket(request);
      }

      // 普通HTTP请求
      return new Response('VLESS Proxy Active', { status: 200 });
    }

    // 伪装页面
    if (isBot || url.pathname === '/') {
      return new Response(FAKE_PAGE, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // 404处理
    return new Response('Not found', { status: 404 });
  }
};

// WebSocket处理函数
async function handleWebSocket(request) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  server.addEventListener('message', event => {
    // 这里添加实际代理逻辑
    // 简化的示例：回显消息
    server.send(event.data);
  });

  return new Response(null, {
    status: 101,
    webSocket: client
  });
}
