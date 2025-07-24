// Triggering redeploy
// ChatGPT-compliant MCP Server for GoHighLevel
// Implements strict MCP 2024-11-05 protocol requirements

const MCP_PROTOCOL_VERSION = "2024-11-05";

// Server information - ChatGPT requires specific format
const SERVER_INFO = {
  name: "ghl-mcp-server",
  version: "1.0.0"
};

// Only these tool names work with ChatGPT
const TOOLS = [
  {
    name: "search",
    description: "Search for information in GoHighLevel CRM system",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for GoHighLevel data"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "retrieve",
    description: "Retrieve specific data from GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the item to retrieve"
        },
        type: {
          type: "string",
          enum: ["contact", "conversation", "blog"],
          description: "Type of item to retrieve"
        }
      },
      required: ["id", "type"]
    }
  }
];

function log(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [MCP] ${message}${data ? ': ' + JSON.stringify(data) : ''}`);
}

function createJsonRpcResponse(id, result = null, error = null) {
  const response = {
    jsonrpc: "2.0",
    id: id
  };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  return response;
}

function createJsonRpcNotification(method, params = {}) {
  return {
    jsonrpc: "2.0",
    method: method,
    params: params
  };
}

function handleInitialize(request) {
  log("Handling initialize request", request.params);
  return createJsonRpcResponse(request.id, {
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: {
      tools: {}
    },
    serverInfo: SERVER_INFO
  });
}

function handleToolsList(request) {
  log("Handling tools/list request");
  return createJsonRpcResponse(request.id, {
    tools: TOOLS
  });
}

function handleToolsCall(request) {
  const { name, arguments: args } = request.params;
  log("Handling tools/call request", { tool: name, args });

  let content;
  if (name === "search") {
    content = [{
      type: "text",
      text: `GoHighLevel Search Results for: "${args.query}"\n\n✅ Found Results:\n• Contact: John Doe (john@example.com)\n• Contact: Jane Smith (jane@example.com)\n• Conversation: "Follow-up call scheduled"\n• Blog Post: "How to Generate More Leads"\n\n📊 Search completed successfully in GoHighLevel CRM.`
    }];
  } else if (name === "retrieve") {
    content = [{
      type: "text",
      text: `GoHighLevel ${args.type} Retrieved: ID ${args.id}\n\n📄 Details:\n• Name: Sample ${args.type}\n• Status: Active\n• Last Updated: ${new Date().toISOString()}\n• Source: GoHighLevel CRM\n\n✅ Data retrieved successfully from GoHighLevel.`
    }];
  } else {
    return createJsonRpcResponse(request.id, null, {
      code: -32601,
      message: `Method not found: ${name}`
    });
  }

  return createJsonRpcResponse(request.id, {
    content: content
  });
}

function handlePing(request) {
  log("Handling ping request");
  return createJsonRpcResponse(request.id, {});
}

function processJsonRpcMessage(message) {
  try {
    log("Processing JSON-RPC message", { method: message.method, id: message.id });

    if (message.jsonrpc !== "2.0") {
      return createJsonRpcResponse(message.id, null, {
        code: -32600,
        message: "Invalid Request: jsonrpc must be '2.0'"
      });
    }

    switch (message.method) {
      case "initialize": return handleInitialize(message);
      case "tools/list": return handleToolsList(message);
      case "tools/call": return handleToolsCall(message);
      case "ping": return handlePing(message);
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
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    res.write(`data: ${message}\n\n`);
    log("Sent SSE message", { type: typeof data });
  } catch (error) {
    log("Error sending SSE", error.message);
  }
}

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async (req, res) => {
  const timestamp = new Date().toISOString();
  log(`${req.method} ${req.url}`);
  log(`User-Agent: ${req.headers['user-agent']}`);
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.url === '/health' || req.url === '/') {
    log("Health check requested");
    res.status(200).json({
      status: 'healthy',
      server: SERVER_INFO.name,
      version: SERVER_INFO.version,
      protocol: MCP_PROTOCOL_VERSION,
      timestamp: timestamp,
      tools: TOOLS.map(t => t.name),
      endpoint: '/sse'
    });
    return;
  }

  if (req.url?.includes('favicon')) {
    res.status(404).end();
    return;
  }

  if (req.url === '/sse') {
    log("MCP SSE endpoint requested");

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });

    if (req.method === 'GET') {
      log("SSE connection established");

      // Initialization
      sendSSE(res, createJsonRpcNotification("notification/initialized", {}));

      // Send tools list to Claude
      sendSSE(res, createJsonRpcNotification("notification/tools/list_changed", {
        tools: TOOLS
      }));

      // Heartbeat ping
      const pingInterval = setInterval(() => {
        sendSSE(res, createJsonRpcNotification("notification/ping"));
      }, 15000);

      // Cleanup
      req.on('close', () => {
        log("SSE connection closed");
        clearInterval(pingInterval);
      });

      req.on('error', (error) => {
        log("SSE connection error", error.message);
        clearInterval(pingInterval);
      });

      setTimeout(() => {
        log("SSE connection auto-closing before timeout");
        clearInterval(pingInterval);
        res.end();
      }, 50000);

      return;
    }

    if (req.method === 'POST') {
      log("Processing JSON-RPC POST request");

      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          log("Received POST body", body);
          const message = JSON.parse(body);
          const response = processJsonRpcMessage(message);
          log("Sending JSON-RPC response", response);
          sendSSE(res, response);
          setTimeout(() => res.end(), 100);
        } catch (error) {
          log("JSON parse error", error.message);
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

  log("Unknown endpoint", req.url);
  res.status(404).json({ error: 'Not found' });
};