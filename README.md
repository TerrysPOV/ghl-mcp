# GoHighLevel MCP Server (Claude Code Compatible Fork)

This is a customized deployment of the [original GoHighLevel MCP Server](https://github.com/mastanley13/GoHighLevel-MCP), adapted specifically for Claude Code and ChatGPT integrations with complete GoHighLevel API coverage.

> 🛠 This fork replaces the original mock tools with full GoHighLevel API integration (253 tools) and includes production-ready deployment configuration for Render.

[![Deploy](https://img.shields.io/badge/Deploy-Render-brightgreen)](https://render.com)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://typescriptlang.org)

## 📋 Features

### 🎯 **Complete GoHighLevel Integration**
- **253 Tools**: Full API coverage across all GHL modules
- **Real-time**: Server-Sent Events (SSE) for live communication
- **Authenticated**: Secure API key-based authentication
- **Production Ready**: Deployed on Render with auto-scaling

### 🧩 **MCP Protocol Support**
- **Standard Compliant**: MCP Protocol 2024-11-05
- **JSON-RPC 2.0**: Standard request/response format
- **Tool Discovery**: Automatic tool listing and introspection
- **Error Handling**: Comprehensive error reporting

### 🔧 **Available Tool Categories**

#### 🎯 **Contact Management** (31 tools)
- **BASIC**: create, search, get, update, delete contacts
- **TAGS**: add/remove contact tags, bulk tag operations  
- **TASKS**: get, create, update, delete contact tasks
- **NOTES**: get, create, update, delete contact notes
- **ADVANCED**: upsert, duplicate check, business association
- **BULK**: mass tag updates, business assignments
- **FOLLOWERS**: add/remove contact followers
- **CAMPAIGNS**: add/remove contacts to/from campaigns
- **WORKFLOWS**: add/remove contacts to/from workflows
- **APPOINTMENTS**: get contact appointments

#### 💬 **Messaging & Conversations** (20 tools)
- **BASIC**: send_sms, send_email - Send messages to contacts
- **CONVERSATIONS**: search, get, create, update, delete conversations
- **MESSAGES**: get individual messages, email messages, upload attachments
- **STATUS**: update message delivery status, monitor recent activity
- **MANUAL**: add inbound messages, add outbound calls manually
- **RECORDINGS**: get call recordings, transcriptions, download transcripts
- **SCHEDULING**: cancel scheduled messages and emails
- **LIVE CHAT**: typing indicators for real-time conversations

#### 📝 **Blog Management** (7 tools)
- create_blog_post, update_blog_post, get_blog_posts
- get_blog_sites, get_blog_authors, get_blog_categories
- check_url_slug - Validate URL slug availability

#### 💰 **Opportunity Management** (10 tools)
- **SEARCH**: search_opportunities - Search by pipeline, stage, status, contact
- **PIPELINES**: get_pipelines - Get all sales pipelines and stages
- **CRUD**: create, get, update, delete opportunities
- **STATUS**: update_opportunity_status - Quick status updates (won/lost)
- **UPSERT**: upsert_opportunity - Smart create/update based on contact
- **FOLLOWERS**: add/remove followers for opportunity notifications

#### 🗓 **Calendar & Appointments** (14 tools)
- get_calendar_groups, get_calendars, create_calendar
- get_calendar, update_calendar, delete_calendar
- get_calendar_events, get_free_slots
- create_appointment, get_appointment, update_appointment, delete_appointment
- create_block_slot, update_block_slot

#### 📧 **Email Marketing** (5 tools)
- get_email_campaigns, create_email_template, get_email_templates
- update_email_template, delete_email_template

#### 🏢 **Location Management** (18 tools)
- search_locations, get_location, create_location, update_location, delete_location
- get_location_tags, create_location_tag, update_location_tag, delete_location_tag
- search_location_tasks, custom fields management, templates, timezones

#### 📱 **Social Media Posting** (16 tools)
- **POSTS**: search, create, get, update, delete social posts
- **BULK**: bulk delete up to 50 posts at once
- **ACCOUNTS**: get connected accounts, delete connections
- **CSV**: upload bulk posts via CSV, manage import status
- **ORGANIZE**: categories and tags for content organization
- **OAUTH**: start OAuth flows, get platform accounts
- **PLATFORMS**: Google, Facebook, Instagram, LinkedIn, Twitter, TikTok

#### 💳 **Payments Management** (15 tools)
- **INTEGRATIONS**: create/list white-label payment integrations
- **ORDERS**: list_orders, get_order_by_id - Manage customer orders
- **FULFILLMENT**: create/list order fulfillments with tracking
- **TRANSACTIONS**: list/get payment transactions and history
- **SUBSCRIPTIONS**: list/get recurring payment subscriptions
- **COUPONS**: create, update, delete, list promotional coupons
- **CUSTOM PROVIDERS**: integrate custom payment gateways

#### 🧾 **Invoices & Billing** (12 tools)
- **TEMPLATES**: create, list, get, update, delete invoice templates
- **SCHEDULES**: create, list, get recurring invoice automation
- **INVOICES**: create, list, get, send invoices to customers
- **ESTIMATES**: create, list, send estimates, convert to invoices
- **UTILITIES**: generate invoice/estimate numbers automatically

#### And many more categories including:
- 📁 **Media Management** - File uploads, organization
- 🏗️ **Custom Objects** - Flexible data structures
- ✅ **Email Verification** - Deliverability checking
- 📊 **Surveys & Workflows** - Automation tools

## 🚀 Quick Start

### Deploy Your Own Instance

#### Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. **Fork this repository**
2. **Create new Render Web Service**
3. **Configure deployment settings:**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
4. **Set environment variables:**
   ```bash
   GHL_API_KEY=your_gohighlevel_api_key
   GHL_BASE_URL=https://services.leadconnectorhq.com
   GHL_LOCATION_ID=your_location_id
   GHL_API_VERSION=2021-07-28
   ```

## 🔧 Integration

### Claude Code MCP Integration

#### Method 1: HTTP Transport (Recommended)
Add the server using Claude Code CLI:

```bash
claude mcp add --transport http leadconnector https://<your-deployment-url>/sse
```

Replace `<your-deployment-url>` with your Render service URL (e.g., https://ghl-mcp-xxxx.onrender.com).

Verify the connection:
```bash
claude mcp list
```

#### Method 2: Manual Configuration
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "leadconnector": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-fetch", "https://<your-deployment-url>/sse"]
    }
  }
}
```

#### Method 3: Direct HTTP API
For direct integration without MCP:
```bash
curl -X POST https://<your-deployment-url>/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": "1", "method": "tools/list", "params": {}}'
```

### Direct HTTP API

#### Health Check
```bash
curl https://<your-deployment-url>/health
```

#### List Available Tools
```bash
curl -X POST https://<your-deployment-url>/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list",
    "params": {}
  }'
```

#### Create Contact Example
```bash
curl -X POST https://<your-deployment-url>/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/call",
    "params": {
      "name": "create_contact",
      "arguments": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890"
      }
    }
  }'
```

## 🛠 Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/TerrysPOV/ghl-mcp.git
cd ghl-mcp

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your GHL credentials

# Build TypeScript
npm run build

# Start server
npm start
```

### Environment Variables

```bash
GHL_API_KEY=pit-xxxxxxxxxxxxxxxxxxxxxxxxx  # Your GHL API key
GHL_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=xxxxxxxxxxxxxxxxxxxxxx     # Your location ID
GHL_API_VERSION=2021-07-28                  # API version
PORT=10000                                  # Server port (optional)
```

### Project Structure

```
ghl-mcp/
├── src/
│   ├── clients/
│   │   └── ghl-api-client.ts      # Main GHL API client
│   ├── tools/                     # Individual tool modules
│   │   ├── contact-tools.ts       # Contact management
│   │   ├── conversation-tools.ts  # Messaging
│   │   ├── calendar-tools.ts      # Appointments
│   │   └── ...                    # 19 total tool modules
│   └── types/
│       └── ghl-types.ts           # TypeScript definitions
├── dist/                          # Compiled JavaScript
├── api/
│   └── index.js                   # HTTP request handler
├── server.js                      # Main server entry point
├── render.yaml                    # Render deployment config
└── package.json
```

## 📚 API Documentation

### JSON-RPC Methods

| Method | Description |
|--------|-------------|
| `initialize` | Initialize MCP connection |
| `tools/list` | Get all available tools |
| `tools/call` | Execute a specific tool |
| `ping` | Health check |

### Tool Categories

All 253 tools are organized into logical categories. Each tool follows the same pattern:

```json
{
  "name": "tool_name",
  "description": "What the tool does",
  "inputSchema": {
    "type": "object",
    "properties": { ... },
    "required": [ ... ]
  }
}
```

## 🔐 Security

- **API Key Authentication**: All requests authenticated with GHL API key
- **Environment Variables**: Sensitive data stored securely
- **CORS Enabled**: Cross-origin requests supported
- **Error Handling**: Comprehensive error reporting without exposing secrets
- **Rate Limiting**: Respects GHL API rate limits

## 🚦 Status & Monitoring

- **Health Endpoint**: `/health` - Server status and tool count
- **Logging**: Comprehensive request/response logging
- **Error Tracking**: Detailed error reporting
- **Performance**: Optimized for concurrent requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Build and test: `npm run build && npm test`
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Attribution

This project is based on [mastanley13/GoHighLevel-MCP](https://github.com/mastanley13/GoHighLevel-MCP). All credit for the original structure and MCP implementation goes to the original author.

**This fork was enhanced for production by**: Terry Yodaiken
- ✅ Fixed Version header issues for GHL API compatibility
- ✅ Added complete tool coverage (253 tools vs original mock tools)
- ✅ Render deployment optimization with TypeScript build pipeline
- ✅ Production-ready error handling and logging
- ✅ Comprehensive documentation and deployment guides

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/TerrysPOV/ghl-mcp/issues)
- **Documentation**: This README and inline code comments
- **Original Project**: [mastanley13/GoHighLevel-MCP](https://github.com/mastanley13/GoHighLevel-MCP)

---

*Last updated: July 26, 2025*
*Production Status: ✅ Ready for deployment*
*Tools Available: 253*