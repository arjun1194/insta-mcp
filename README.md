# insta-mcp

An Instagram MCP (Model Context Protocol) server that provides AI assistants with tools to access Instagram analytics and insights.

## Features

- **Account Overview** - Get profile information including follower/following counts and bio
- **Recent Posts** - Retrieve posts with engagement metrics (likes, comments, views)
- **Followers List** - Get your followers with their profile information
- **Following List** - Get accounts you're following
- **Post Insights** - Detailed analytics for specific posts including likers and comments
- **Compare Follow Lists** - Find unfollowers and fans by comparing follower/following lists
- **Search** - Search for users, hashtags, or places on Instagram

## Installation

```bash
npm install
npm run build
```

## Configuration

1. Copy the example credentials file:
   ```bash
   cp config/credentials.example.json config/credentials.json
   ```

2. Add your Instagram credentials to `config/credentials.json`:
   ```json
   {
     "username": "YOUR_INSTAGRAM_USERNAME",
     "password": "YOUR_INSTAGRAM_PASSWORD"
   }
   ```

## Usage

### With Claude Code

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "insta-mcp": {
      "command": "node",
      "args": ["/path/to/insta-mcp/dist/index.js"]
    }
  }
}
```

### Development

```bash
npm run dev
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_account_overview` | Get Instagram account profile information for any user |
| `get_recent_posts` | Get recent posts with engagement metrics for any user |
| `get_followers` | Get list of followers for any user (public accounts or your own) |
| `get_following` | Get list of accounts a user follows (public accounts or your own) |
| `get_post_insights` | Get detailed analytics for a specific post |
| `compare_follow_lists` | Find unfollowers and fans |
| `search_instagram` | Search for users, hashtags, or places |
| `upload_photo` | Upload a photo to Instagram as a new post |
| `upload_video` | Upload a video to Instagram as a new post |
| `upload_reel` | Upload a video as an Instagram Reel |
| `follow_user` | Send a follow request to a user |
| `unfollow_user` | Unfollow a user |

## Requirements

- Node.js >= 18.0.0

## License

MIT
