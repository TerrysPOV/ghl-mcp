# GoHighLevel MCP Server (Claude Code Compatible Fork)

This is a customized deployment of the [original GoHighLevel MCP Server](https://github.com/mastanley13/GoHighLevel-MCP), adapted specifically for Claude Code and ChatGPT integrations.

> 🛠 This fork replaces the original Vercel function-based deployment with a Render-hosted server using a standalone Node.js `server.js`. It maintains full MCP compatibility with Claude Code.

---

## 🔧 Deploy Your Own Instance (Render)

This version is ready to deploy to [Render](https://render.com/) for easy MCP access via Server-Sent Events (SSE).

### Setup Instructions

1. **Create a new Render Web Service**  
   - Runtime: **Node**  
   - Start command: `node server.js`  
   - Build command: `npm install`

2. **Environment Variables**
   - `GHL_API_KEY`: Your GoHighLevel API key  
   - `GHL_BASE_URL`: `https://services.leadconnectorhq.com`  
   - `GHL_LOCATION_ID`: Your Location ID

3. **Ensure your GitHub repo is connected with auto-deploy enabled.**

---

## 🧩 Claude Code MCP Configuration

To add this server to Claude Code using the MCP protocol, run the following in your terminal:

```bash
claude mcp add --transport http leadconnector https://<your-deployment-url>

Replace <your-deployment-url> with your Render service URL (e.g., https://ghl-mcp-xxxx.onrender.com).

⸻

📦 Features
	•	Implements full MCP protocol 2024-11-05
	•	Supports two mock tools:
	•	search: Returns simulated GoHighLevel search results
	•	retrieve: Returns simulated data for contacts, conversations, or blog posts
	•	Designed for Claude’s toolchain to automatically initialize, list tools, and send pings

⸻

👥 Attribution

This project is based on mastanley13/GoHighLevel-MCP. All credit for the original structure and function goes to the author.

This fork was adapted for Render and Claude Code compatibility by Terry Yodaiken.