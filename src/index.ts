#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { IgApiClient } from 'instagram-private-api';
import { authenticateClient } from './instagram/auth.js';
import { InstagramClient } from './instagram/client.js';
import { createServer } from './server.js';

async function main() {
  try {
    // Initialize Instagram API client
    const ig = new IgApiClient();

    // Authenticate (will use saved session or perform login)
    console.error('Initializing Instagram MCP Server...');
    await authenticateClient(ig);

    // Create wrapper client with rate limiting
    const igClient = new InstagramClient(ig);

    // Create MCP server with tools
    const server = createServer(igClient);

    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Instagram MCP Server started successfully');
    console.error(
      'Available tools: get_account_overview, get_recent_posts, get_followers, get_following, get_post_insights, compare_follow_lists'
    );
  } catch (error) {
    console.error('Failed to start Instagram MCP Server:', error);
    process.exit(1);
  }
}

main();
