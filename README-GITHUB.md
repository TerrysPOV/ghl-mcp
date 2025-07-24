# 🚀 GoHighLevel MCP Server

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mastanley13/GoHighLevel-MCP)
[![Donate to the Project](https://img.shields.io/badge/Donate_to_the_Project-💝_Support_Development-ff69b4?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/28E14o1hT7JAfstfvqdZ60y)

> **Transform ChatGPT into a GoHighLevel CRM powerhouse with 21 powerful tools**

## 🎯 What This Does

This MCP (Model Context Protocol) server connects ChatGPT directly to your GoHighLevel account, enabling you to:

- **👥 Manage Contacts**: Create, search, update, and organize contacts
- **💬 Handle Communications**: Send SMS and emails, manage conversations  
- **📝 Create Content**: Manage blog posts, authors, and categories
- **🔄 Automate Workflows**: Combine multiple actions through ChatGPT

## 🔑 **CRITICAL: GoHighLevel API Setup**

### **📋 Required: Private Integrations API Key**

> **⚠️ This project requires a PRIVATE INTEGRATIONS API key, not a regular API key!**

**Quick Setup:**
1. **GoHighLevel Settings** → **Integrations** → **Private Integrations**
2. **Create New Integration** with required scopes (contacts, conversations, etc.)
3. **Copy the Private API Key** and your **Location ID**

## ⚡ Quick Deploy to Vercel

### 1. One-Click Deploy
Click the button above or: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mastanley13/GoHighLevel-MCP)

### 2. Add Environment Variables
```
GHL_API_KEY=your_private_integrations_api_key_here
GHL_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=your_location_id_here
NODE_ENV=production
```

### 3. Connect to ChatGPT
Use your deployed URL in ChatGPT:
```
https://your-app-name.vercel.app/sse
```

## 🛠️ Available Tools (21 Total)

### 🎯 Contact Management (7 Tools)
- `create_contact` - Create new contacts
- `search_contacts` - Find contacts by criteria
- `get_contact` - Retrieve contact details  
- `update_contact` - Modify contact information
- `add_contact_tags` - Organize with tags
- `remove_contact_tags` - Remove tags
- `delete_contact` - Delete contacts

### 💬 Messaging & Conversations (7 Tools)
- `send_sms` - Send SMS messages
- `send_email` - Send emails with HTML support
- `search_conversations` - Find conversations
- `get_conversation` - Get conversation details
- `create_conversation` - Start new conversations
- `update_conversation` - Modify conversations
- `get_recent_messages` - Monitor recent activity

### 📝 Blog Management (7 Tools)
- `create_blog_post` - Create blog posts with SEO
- `update_blog_post` - Edit existing posts
- `get_blog_posts` - List and search posts
- `get_blog_sites` - Manage blog sites
- `get_blog_authors` - Handle authors
- `get_blog_categories` - Organize categories
- `check_url_slug` - Validate URL slugs

## 🎮 ChatGPT Usage Examples

### Contact Management
```
"Create a contact for John Smith with email john@company.com and add tags 'lead' and 'hot-prospect'"
```

### Communication  
```
"Send an SMS to contact ID abc123 saying 'Thanks for your interest! We'll call you within 24 hours.'"
```

### Blog Content
```
"Create a blog post titled 'Insurance Tips for 2024' with SEO-optimized content about life insurance benefits"
```

### Advanced Workflows
```
"Search for contacts tagged 'VIP', get their recent conversations, and send them a personalized email about our premium services"
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- GoHighLevel API access
- Valid API key and Location ID

### Setup
```bash
# Clone repository
git clone https://github.com/mastanley13/GoHighLevel-MCP.git
cd GoHighLevel-MCP

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your GHL API credentials

# Build and start
npm run build
npm start
```

### Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test tools endpoint  
curl http://localhost:8000/tools

# Test SSE endpoint
curl -H "Accept: text/event-stream" http://localhost:8000/sse
```

## 🌐 Deployment Options

### Vercel (Recommended)
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Easy GitHub integration

### Railway
- ✅ Free $5 credit
- ✅ Simple deployment
- ✅ Automatic scaling

### Render
- ✅ Free tier
- ✅ Easy setup
- ✅ Reliable hosting

## 📋 Project Structure

```
GoHighLevel-MCP/
├── src/
│   ├── clients/          # GHL API client
│   ├── tools/           # MCP tool implementations
│   ├── types/           # TypeScript interfaces
│   ├── server.ts        # CLI MCP server
│   └── http-server.ts   # HTTP MCP server
├── tests/               # Comprehensive test suite
├── docs/                # Documentation
├── vercel.json         # Vercel configuration
├── Dockerfile          # Docker support
└── README.md           # This file
```

## 🔐 Security & Environment

### Required Environment Variables
```bash
GHL_API_KEY=your_private_integrations_api_key  # Private Integrations API key (NOT regular API key)
GHL_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=your_location_id               # From Settings → Company → Locations  
NODE_ENV=production                             # Environment mode
```

### Security Features
- ✅ Environment-based configuration
- ✅ Input validation and sanitization
- ✅ Comprehensive error handling
- ✅ CORS protection for web deployment
- ✅ No sensitive data in code

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
npm run build  # Check TypeScript compilation
npm install    # Ensure dependencies installed
```

**API Connection Issues:**
- Verify Private Integrations API key is valid (not regular API key)
- Check location ID is correct
- Ensure required scopes are enabled in Private Integration
- Ensure environment variables are set

**ChatGPT Integration:**
- Confirm SSE endpoint is accessible
- Check CORS configuration
- Verify MCP protocol compatibility

## 📊 Technical Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for HTTP server
- **MCP SDK**: @modelcontextprotocol/sdk
- **API Client**: Axios with interceptors
- **Testing**: Jest with comprehensive coverage
- **Deployment**: Vercel, Railway, Render, Docker

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Open a GitHub issue
- **API Docs**: GoHighLevel API documentation
- **MCP Protocol**: Model Context Protocol specification

## 🎉 Success Story

This server successfully connects ChatGPT to GoHighLevel with:
- ✅ **21 operational tools**
- ✅ **Real-time API integration**
- ✅ **Production-ready deployment**
- ✅ **Comprehensive error handling**
- ✅ **Full TypeScript support**

**Ready to automate your GoHighLevel workflows through ChatGPT!** 🚀

---

Made with ❤️ for the GoHighLevel community 