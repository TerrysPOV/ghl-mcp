const http = require('http');
const handler = require('./api/index');

const PORT = process.env.PORT || 10000; // MCP convention prefers 10000

const server = http.createServer((req, res) => {
  try {
    handler(req, res);
  } catch (error) {
    console.error('[MCP] Unhandled error in request handler:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

server.listen(PORT, () => {
  console.log(`[MCP] Server listening on port ${PORT}`);
});