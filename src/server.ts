import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InstagramClient } from './instagram/client.js';
import {
  accountOverviewSchema,
  accountOverviewDescription,
  getAccountOverview,
  recentPostsSchema,
  recentPostsDescription,
  getRecentPosts,
  followersSchema,
  followersDescription,
  getFollowers,
  followingSchema,
  followingDescription,
  getFollowing,
  postInsightsSchema,
  postInsightsDescription,
  getPostInsights,
  compareSchema,
  compareDescription,
  compareFollowLists,
  searchSchema,
  searchDescription,
  searchInstagram,
  uploadPhotoSchema,
  uploadPhotoDescription,
  uploadPhoto,
  uploadVideoSchema,
  uploadVideoDescription,
  uploadVideo,
  uploadReelSchema,
  uploadReelDescription,
  uploadReel,
  followUserSchema,
  followUserDescription,
  followUser,
  unfollowUserSchema,
  unfollowUserDescription,
  unfollowUser,
} from './tools/index.js';

export function createServer(igClient: InstagramClient): McpServer {
  const server = new McpServer({
    name: 'insta-mcp',
    version: '1.0.0',
  });

  // Register get_account_overview tool
  server.tool(
    'get_account_overview',
    accountOverviewDescription,
    accountOverviewSchema,
    async (params) => {
      return getAccountOverview(igClient, params);
    }
  );

  // Register get_recent_posts tool
  server.tool(
    'get_recent_posts',
    recentPostsDescription,
    recentPostsSchema,
    async (params) => {
      return getRecentPosts(igClient, params);
    }
  );

  // Register get_followers tool
  server.tool(
    'get_followers',
    followersDescription,
    followersSchema,
    async (params) => {
      return getFollowers(igClient, params);
    }
  );

  // Register get_following tool
  server.tool(
    'get_following',
    followingDescription,
    followingSchema,
    async (params) => {
      return getFollowing(igClient, params);
    }
  );

  // Register get_post_insights tool
  server.tool(
    'get_post_insights',
    postInsightsDescription,
    postInsightsSchema,
    async (params) => {
      return getPostInsights(igClient, params);
    }
  );

  // Register compare_follow_lists tool
  server.tool(
    'compare_follow_lists',
    compareDescription,
    compareSchema,
    async (params) => {
      return compareFollowLists(igClient, params);
    }
  );

  // Register search_instagram tool
  server.tool(
    'search_instagram',
    searchDescription,
    searchSchema,
    async (params) => {
      return searchInstagram(igClient, params);
    }
  );

  // Register upload_photo tool
  server.tool(
    'upload_photo',
    uploadPhotoDescription,
    uploadPhotoSchema,
    async (params) => {
      return uploadPhoto(igClient, params);
    }
  );

  // Register upload_video tool
  server.tool(
    'upload_video',
    uploadVideoDescription,
    uploadVideoSchema,
    async (params) => {
      return uploadVideo(igClient, params);
    }
  );

  // Register upload_reel tool
  server.tool(
    'upload_reel',
    uploadReelDescription,
    uploadReelSchema,
    async (params) => {
      return uploadReel(igClient, params);
    }
  );

  // Register follow_user tool
  server.tool(
    'follow_user',
    followUserDescription,
    followUserSchema,
    async (params) => {
      return followUser(igClient, params);
    }
  );

  // Register unfollow_user tool
  server.tool(
    'unfollow_user',
    unfollowUserDescription,
    unfollowUserSchema,
    async (params) => {
      return unfollowUser(igClient, params);
    }
  );

  return server;
}
