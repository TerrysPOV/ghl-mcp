// api/index.js

const fs = require("fs");
const path = require("path");

const MCP_PROTOCOL_VERSION = "2024-11-05";

const SERVER_INFO = {
  name: "ghl-mcp-server",
  version: "1.0.0"
};

// Dynamic tool loading
const toolsDirectory = path.join(__dirname, "..", "src", "tools");
const loadedTools = [];

fs.readdirSync(toolsDirectory).forEach(file => {
  if (file.endsWith(".js")) {
    const toolModule = require(path.join(toolsDirectory, file));
    if (toolModule && toolModule.tool && toolModule.handler) {
      loadedTools.push(toolModule);
    }
  }
});

function log(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [MCP] ${message}${data ? ': ' + JSON.stringify(data) : ''}`);
}

function createJsonRpcResponse(id, result = null, error = null) {
  const response = { jsonrpc: "2.0", id };
  if (error) response.error = error;
  else response.result = result;
  return response;
}

function createJsonRpcNotification(method, params = {}) {
  return { jsonrpc: "2.0", method, params };
}

function handleInitialize(request) {
  log("Handling initialize request", request.params);
  return createJsonRpcResponse(request.id, {
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: SERVER_INFO
  });
}

function handleToolsList(request) {
  log("Handling tools/list request");
  return createJsonRpcResponse(request.id, {
    tools: loadedTools.map(t => t.tool)
  });
}

function handleToolsCall(request) {
  const { name, arguments: args } = request.params;
  log("Handling tools/call", { name, args });

  const toolEntry = loadedTools.find(t => t.tool.name === name);
  if (!toolEntry) {
    return createJsonRpcResponse(request.id, null, {
      code: -32601,
      message: `Tool not found: ${name}`
    });
  }

  try {
    const content = toolEntry.handler(args);
    return createJsonRpcResponse(request.id, { content });
  } catch (err) {
    log("Tool handler error", err.message);
    return createJsonRpcResponse(request.id, null, {
      code: -32000,
      message: `Error running tool ${name}`,
      data: err.message
    });
  }
}

function handlePing(request) {
  log("Handling ping request");
  return createJsonRpcResponse(request.id, {});
}

function processJsonRpcMessage(message) {
  try {
    if (message.jsonrpc !== "2.0") {
      return createJsonRpcResponse(message.id, null, {
        code: -32600,
        message: "Invalid Request: jsonrpc must be '2.0'"
      });
    }

    switch (message.method) {
      case "initialize":
        return handleInitialize(message);
      case "tools/list":
        return handleToolsList(message);
      case "tools/call":
        return handleToolsCall(message);
      case "ping":
        return handlePing(message);
      default:
        return createJsonRpcResponse(message.id, null, {
          code: -32601,
          message: `Method not found: ${message.method}`
        });
    }
  } catch (error) {
    log("Error processing message", error.message);
    return createJsonRpcResponse(message.id, null, {
      code: -32603,
      message: "Internal error",
      data: error.message
    });
  }
}

function sendSSE(res, data) {
  try {
    const message = typeof data === "string" ? data : JSON.stringify(data);
    res.write(`data: ${message}\n\n`);
    log("Sent SSE message");
  } catch (error) {
    log("Error sending SSE", error.message);
  }
}

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = async (req, res) => {
  const timestamp = new Date().toISOString();
  log(`${req.method} ${req.url}`);
  log(`User-Agent: ${req.headers["user-agent"]}`);
  setCORSHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/health" || req.url === "/") {
    const response = {
      status: "healthy",
      server: SERVER_INFO.name,
      version: SERVER_INFO.version,
      protocol: MCP_PROTOCOL_VERSION,
      timestamp,
      tools: loadedTools.map(t => t.tool.name),
      endpoint: "/sse"
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
    return;
  }

  if (req.url?.includes("favicon")) {
    res.writeHead(404);
    res.end();
    return;
  }

  if (req.url === "/sse") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });

    if (req.method === "GET") {
      sendSSE(res, createJsonRpcNotification("notification/initialized", {}));
      sendSSE(res, createJsonRpcNotification("notification/tools/list_changed", {
        tools: loadedTools.map(t => t.tool)
      }));

      const pingInterval = setInterval(() => {
        sendSSE(res, createJsonRpcNotification("notification/ping"));
      }, 15000);

      req.on("close", () => clearInterval(pingInterval));
      req.on("error", () => clearInterval(pingInterval));

      setTimeout(() => {
        res.end();
        clearInterval(pingInterval);
      }, 50000);
      return;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk.toString());
      req.on("end", () => {
        try {
          const message = JSON.parse(body);
          const response = processJsonRpcMessage(message);
          sendSSE(res, response);
          setTimeout(() => res.end(), 100);
        } catch (err) {
          sendSSE(res, createJsonRpcResponse(null, null, {
            code: -32700,
            message: "Parse error"
          }));
          res.end();
        }
      });
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
};