export const API_CONFIG = {
  graphify: {
    baseUrl: process.env.GRAPHIFY_API_URL || 'http://localhost:3001',
    apiKey: process.env.GRAPHIFY_API_KEY,
  },
  mcp: {
    baseUrl: process.env.MCP_SERVER_URL || 'http://localhost:3002',
  },
  websites: [
    { name: 'site1', url: process.env.SITE1_URL, token: process.env.SITE1_TOKEN },
    { name: 'site2', url: process.env.SITE2_URL, token: process.env.SITE2_TOKEN },
  ]
};