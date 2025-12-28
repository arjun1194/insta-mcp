# Instagram MCP Server - Gemini Context

This project is a Model Context Protocol (MCP) server that enables LLMs to interact with Instagram through the `instagram-private-api`.

## Project Overview

- **Type**: MCP Server (Node.js/TypeScript)
- **Primary Technology**: `@modelcontextprotocol/sdk`, `instagram-private-api`
- **Core Purpose**: Provide a comprehensive set of tools for Instagram account management, social graph analysis, content discovery, interaction, and publishing.
- **Architecture**:
  - `src/index.ts`: Entry point, handles configuration and initialization.
  - `src/server.ts`: Defines the MCP server and registers all tools.
  - `src/instagram/client.ts`: Facade client delegating to specialized services.
  - `src/instagram/services/`: Modular logic split into `UserService`, `MediaService`, `FeedService`, `StoryService`, and `DirectService`.
  - `src/tools/`: Implementation of MCP-specific tool schemas and handlers.
  - `src/utils/`: Utilities for rate limiting, error handling, and configuration.

## Key Features

- **Account & Activity**: Profile overviews, followers/following, comparison tools, and activity notifications.
- **Direct Messaging**: Get inbox threads, fetch message history, send messages (text/photo), react to messages, and manage pending requests.
- **Feeds & Discovery**: Home timeline, explore feed, liked posts, saved posts (collections), and hashtag feeds.
- **Stories & Highlights**: Get active stories and story highlights.
- **Interactions**: Like posts/comments, add/reply/delete comments, and follow/unfollow/block users.
- **Content Creation**: Upload photos, videos, reels, and albums (carousels) with location tagging.
- **Search**: Advanced search for users, hashtags, and locations.

## Building and Running

### Commands
- **Install Dependencies**: `npm install`
- **Format Code**: `npm run format` (uses Prettier)
- **Build**: `npm run build` (transpiles TypeScript to `dist/`)
- **Run**: `npm start`
- **Development**: `npm run dev`

### Configuration
The server supports authentication via:
1. **Environment Variables**: `INSTAGRAM_USERNAME`, `INSTAGRAM_PASSWORD`, and `INSTA_DATA_DIR`.
2. **Credentials File**: `data/credentials.json`.

## Development Conventions

- **Modular Services**: Logic should be kept in specialized services under `src/instagram/services/`.
- **Tool Registration**: All tools must be registered in `src/server.ts`.
- **Rate Limiting**: All API calls must pass through the `BaseService` rate limiter.
- **Error Handling**: Use `handleInstagramError` to ensure LLM-friendly error messages.
- **Pluggability**: Avoid absolute paths and prioritize environment-based configuration.

## Usage as an MCP Server

Register the server by pointing your client to `dist/index.js`. Use the `.mcp.json` as a template for your configuration.