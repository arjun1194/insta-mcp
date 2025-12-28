# Instagram MCP Server

A professional Model Context Protocol (MCP) server that provides a comprehensive toolkit for interacting with Instagram. This server enables LLMs (like Claude or Gemini) to manage accounts, analyze social graphs, discover content, and engage with the Instagram community directly from their interface.

## 🚀 Features

- **Full Account Control**: Edit profile, manage privacy, and track activity.
- **Advanced Messaging**: Read history, send text/media, and react to messages.
- **Content Creation**: Support for Photos, Videos, Reels, and Carousel/Albums.
- **Deep Insights**: Analyze post performance, followers, and engagement.
- **Social Graph**: Smart comparison tools to find unfollowers and fans.
- **Discovery**: Search by user, hashtag, or location.

## 📋 Prerequisites

- **Node.js**: v18 or higher.
- **Instagram Account**: Standard account credentials.

## 🛠 Installation

```bash
git clone https://github.com/your-repo/insta-mcp.git
cd insta-mcp
npm install
npm run build
```

## ⚙️ Configuration

The server supports flexible configuration via environment variables or a local JSON file.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `INSTAGRAM_USERNAME` | Your Instagram username | - |
| `INSTAGRAM_PASSWORD` | Your Instagram password | - |
| `INSTA_DATA_DIR` | Path to store sessions/credentials | `./data` |

### Method 1: `.env` File (Local Dev)
Create a `.env` in the root:
```env
INSTAGRAM_USERNAME=your_user
INSTAGRAM_PASSWORD=your_pass
```

### Method 2: `credentials.json`
Copy the example and fill in your details:
```bash
cp config/credentials.example.json data/credentials.json
```

---

## 🔧 Tools Catalog

### Account & Activity
- `get_account_overview`: Get profile stats (followers, following, bio).
- `get_activity`: See notifications (likes, follows, etc.).
- `edit_profile`: Update name, bio, website, and email.
- `block_user`: Block a specific user.
- `set_privacy`: Toggle between Private and Public account.

### Social Graph
- `get_followers`: List a user's followers.
- `get_following`: List who a user follows.
- `compare_follow_lists`: Detect "Unfollowers" or "Fans".
- `follow_user` / `unfollow_user`: Manage friendships.

### Media & Interaction
- `get_recent_posts`: View latest posts for any user.
- `get_post_insights`: Detailed stats (likes, comments, viewers).
- `upload_photo` / `upload_video` / `upload_reel`: Post content.
- `upload_album`: Post carousels with multiple items.
- `search_locations`: Find locations for tagging.
- `like_post` / `add_comment` / `reply_to_comment`: Engage with posts.

### Direct Messaging (DM)
- `get_inbox`: View recent message threads.
- `get_direct_messages`: Fetch history for a specific thread.
- `send_direct_message`: Send text to users or groups.
- `react_to_message`: Add heart reactions to messages.
- `get_pending_requests`: Manage DM requests.
- `mute_thread` / `leave_thread`: Thread management.

### Feeds & Discovery
- `search_instagram`: Search for users, tags, or places.
- `get_timeline`: Your main home feed.
- `get_discover`: The explore page feed.
- `get_saved_posts`: Your bookmarked collections.
- `get_liked_posts`: History of your likes.
- `get_tag_feed`: Recent posts for a hashtag.

### Stories
- `get_stories`: View active stories from your tray or a user.
- `get_highlights`: Access a user's story highlights.

---

## 🖥 Usage with MCP Clients

### Claude Desktop
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "instagram": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/insta-mcp/dist/index.js"],
      "env": {
        "INSTAGRAM_USERNAME": "your_username",
        "INSTAGRAM_PASSWORD": "your_password"
      }
    }
  }
}
```

### Development
To run in development mode with auto-reload:
```bash
npm run format # Format code
npm run dev    # Build and start
```

## ⚠️ Security & Ethics
This project uses the `instagram-private-api`. 
- **Rate Limiting**: The server includes built-in throttling. Avoid aggressive automated requests.
- **Compliance**: Adhere to Instagram's Terms of Service. Use for personal analytics and legitimate social management only.

## 📄 License
MIT