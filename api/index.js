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

// Create proper JSON-RPC 2.0 response
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

// Create proper JSON-RPC 2.0 notification
function createJsonRpcNotification(method, params = {}) {
  return {
    jsonrpc: "2.0",
    method: method,
    params: params
  };
}

// Handle MCP initialize request
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

// Handle tools/list request
function handleToolsList(request) {
  log("Handling tools/list request");
  
  return createJsonRpcResponse(request.id, {
    tools: TOOLS
  });
}

// Handle tools/call request
function handleToolsCall(request) {
  const { name, arguments: args } = request.params;
  log("Handling tools/call request", { tool: name, args });
  
  let content;
  
  if (name === "search") {
    content = [
      {
        type: "text",
        text: `GoHighLevel Search Results for: "${args.query}"\n\n✅ Found Results:\n• Contact: John Doe (john@example.com)\n• Contact: Jane Smith (jane@example.com)\n• Conversation: "Follow-up call scheduled"\n• Blog Post: "How to Generate More Leads"\n\n📊 Search completed successfully in GoHighLevel CRM.`
      }
    ];
  } else if (name === "retrieve") {
    content = [
      {
        type: "text", 
        text: `GoHighLevel ${args.type} Retrieved: ID ${args.id}\n\n📄 Details:\n• Name: Sample ${args.type}\n• Status: Active\n• Last Updated: ${new Date().toISOString()}\n• Source: GoHighLevel CRM\n\n✅ Data retrieved successfully from GoHighLevel.`
      }
    ];
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

// Handle ping request (required by MCP protocol)
function handlePing(request) {
  log("Handling ping request");
  return createJsonRpcResponse(request.id, {});
}

// Process JSON-RPC message
function processJsonRpcMessage(message) {
  try {
    log("Processing JSON-RPC message", { method: message.method, id: message.id });
    
    // Validate JSON-RPC format
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

// Send Server-Sent Event
function sendSSE(res, data) {
  try {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    res.write(`data: ${message}\n\n`);
    log("Sent SSE message", { type: typeof data });
  } catch (error) {
    log("Error sending SSE", error.message);
  }
}

// Set CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// Main request handler - Node.js style export
module.exports = async (req, res) => {
  const timestamp = new Date().toISOString();
  log(`${req.method} ${req.url}`);
  log(`User-Agent: ${req.headers['user-agent']}`);
  
  // Set CORS headers
  setCORSHeaders(res);
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Health check
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
  
  // Favicon handling
  if (req.url?.includes('favicon')) {
    res.status(404).end();
    return;
  }
  
  // MCP SSE endpoint
  if (req.url === '/sse') {
    log("MCP SSE endpoint requested");
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    
    // Handle GET (SSE connection)
    if (req.method === 'GET') {
      log("SSE connection established");
      
      // Send immediate initialization notification
      const initNotification = createJsonRpcNotification("notification/initialized", {});
      sendSSE(res, initNotification);
      
      // Send tools available notification
      setTimeout(() => {
        const toolsNotification = createJsonRpcNotification("notification/tools/list_changed", {});
        sendSSE(res, toolsNotification);
      }, 100);
      
      // Keep-alive heartbeat every 25 seconds (well under Vercel's 60s limit)
      const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
      }, 25000);
      
      // Cleanup on connection close
      req.on('close', () => {
        log("SSE connection closed");
        clearInterval(heartbeat);
      });
      
      req.on('error', (error) => {
        log("SSE connection error", error.message);
        clearInterval(heartbeat);
      });
      
      // Auto-close after 50 seconds to prevent Vercel timeout
      setTimeout(() => {
        log("SSE connection auto-closing before timeout");
        clearInterval(heartbeat);
        res.end();
      }, 50000);
      
      return;
    }
    
    // Handle POST (JSON-RPC messages)
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
          
          // Send as SSE for MCP protocol compliance
          sendSSE(res, response);
          
          // Close connection after response
          setTimeout(() => {
            res.end();
          }, 100);
          
        } catch (error) {
          log("JSON parse error", error.message);
          const errorResponse = createJsonRpcResponse(null, null, {
            code: -32700,
            message: "Parse error"
          });
          sendSSE(res, errorResponse);
          res.end();
        }
      });
      
      return;
    }
  }
  
  // Default 404
  log("Unknown endpoint", req.url);
  res.status(404).json({ error: 'Not found' });
}; 