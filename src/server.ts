import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InstagramClient } from './instagram/client.js';
import { config } from './utils/config.js';
import {
  accountOverviewSchema,
  accountOverviewDescription,
  getAccountOverview,
  getActivitySchema,
  getActivityDescription,
  getActivity,
  editProfileSchema,
  editProfileDescription,
  editProfile,
  blockUserSchema,
  blockUserDescription,
  blockUser,
  setPrivacySchema,
  setPrivacyDescription,
  setPrivacy,
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
  uploadAlbumSchema,
  uploadAlbumDescription,
  uploadAlbum,
  searchLocationsSchema,
  searchLocationsDescription,
  searchLocations,
  followUserSchema,
  followUserDescription,
  followUser,
  unfollowUserSchema,
  unfollowUserDescription,
  unfollowUser,
  getInboxSchema,
  getInboxDescription,
  getInbox,
  sendDirectMessageSchema,
  sendDirectMessageDescription,
  sendDirectMessage,
  getDirectMessagesSchema,
  getDirectMessagesDescription,
  getDirectMessages,
  reactToMessageSchema,
  reactToMessageDescription,
  reactToMessage,
  getPendingRequestsSchema,
  getPendingRequestsDescription,
  getPendingRequests,
  muteThreadSchema,
  muteThreadDescription,
  muteThread,
  leaveThreadSchema,
  leaveThreadDescription,
  leaveThread,
  likeMediaSchema,
  likeMediaDescription,
  likeMedia,
  addCommentSchema,
  addCommentDescription,
  addComment,
  replyToCommentSchema,
  replyToCommentDescription,
  replyToComment,
  likeCommentSchema,
  likeCommentDescription,
  likeComment,
  getStoriesSchema,
  getStoriesDescription,
  getStories,
  getHighlightsSchema,
  getHighlightsDescription,
  getHighlights,
  getTimelineSchema,
  getTimelineDescription,
  getTimeline,
  getDiscoverSchema,
  getDiscoverDescription,
  getDiscover,
  getSavedSchema,
  getSavedDescription,
  getSaved,
  getLikedSchema,
  getLikedDescription,
  getLiked,
  getTagFeedSchema,
  getTagFeedDescription,
  getTagFeed,
} from './tools/index.js';

export function createServer(igClient: InstagramClient): McpServer {
  const server = new McpServer({
    name: config.server.name,
    version: config.server.version,
  });

  // ACCOUNT TOOLS
  server.tool(
    'get_account_overview',
    accountOverviewDescription,
    accountOverviewSchema,
    async (params) => {
      return getAccountOverview(igClient, params as any);
    }
  );

  server.tool('get_activity', getActivityDescription, getActivitySchema.shape, async (params) => {
    return getActivity(igClient, params);
  });

  server.tool('edit_profile', editProfileDescription, editProfileSchema.shape, async (params) => {
    return editProfile(igClient, params);
  });

  server.tool('block_user', blockUserDescription, blockUserSchema.shape, async (params) => {
    return blockUser(igClient, params);
  });

  server.tool('set_privacy', setPrivacyDescription, setPrivacySchema.shape, async (params) => {
    return setPrivacy(igClient, params);
  });

  // SOCIAL GRAPH
  server.tool('get_followers', followersDescription, followersSchema, async (params) => {
    return getFollowers(igClient, params);
  });

  server.tool('get_following', followingDescription, followingSchema, async (params) => {
    return getFollowing(igClient, params);
  });

  server.tool('compare_follow_lists', compareDescription, compareSchema, async (params) => {
    return compareFollowLists(igClient, params);
  });

  server.tool('follow_user', followUserDescription, followUserSchema, async (params) => {
    return followUser(igClient, params);
  });

  server.tool('unfollow_user', unfollowUserDescription, unfollowUserSchema, async (params) => {
    return unfollowUser(igClient, params);
  });

  // MEDIA TOOLS
  server.tool('get_recent_posts', recentPostsDescription, recentPostsSchema, async (params) => {
    return getRecentPosts(igClient, params);
  });

  server.tool('get_post_insights', postInsightsDescription, postInsightsSchema, async (params) => {
    return getPostInsights(igClient, params);
  });

  server.tool('upload_photo', uploadPhotoDescription, uploadPhotoSchema, async (params) => {
    return uploadPhoto(igClient, params);
  });

  server.tool('upload_video', uploadVideoDescription, uploadVideoSchema, async (params) => {
    return uploadVideo(igClient, params);
  });

  server.tool('upload_reel', uploadReelDescription, uploadReelSchema, async (params) => {
    return uploadReel(igClient, params);
  });

  server.tool('upload_album', uploadAlbumDescription, uploadAlbumSchema.shape, async (params) => {
    return uploadAlbum(igClient, params);
  });

  server.tool(
    'search_locations',
    searchLocationsDescription,
    searchLocationsSchema.shape,
    async (params) => {
      return searchLocations(igClient, params);
    }
  );

  // INTERACTION TOOLS
  server.tool('like_post', likeMediaDescription, likeMediaSchema.shape, async (params) => {
    return likeMedia(igClient, params);
  });

  server.tool('add_comment', addCommentDescription, addCommentSchema.shape, async (params) => {
    return addComment(igClient, params);
  });

  server.tool(
    'reply_to_comment',
    replyToCommentDescription,
    replyToCommentSchema.shape,
    async (params) => {
      return replyToComment(igClient, params);
    }
  );

  server.tool('like_comment', likeCommentDescription, likeCommentSchema.shape, async (params) => {
    return likeComment(igClient, params);
  });

  // DIRECT MESSAGING
  server.tool('get_inbox', getInboxDescription, getInboxSchema.shape, async (params) => {
    return getInbox(igClient, params);
  });

  server.tool(
    'send_direct_message',
    sendDirectMessageDescription,
    sendDirectMessageSchema.shape,
    async (params) => {
      return sendDirectMessage(igClient, params);
    }
  );

  server.tool(
    'get_direct_messages',
    getDirectMessagesDescription,
    getDirectMessagesSchema.shape,
    async (params) => {
      return getDirectMessages(igClient, params);
    }
  );

  server.tool(
    'react_to_message',
    reactToMessageDescription,
    reactToMessageSchema.shape,
    async (params) => {
      return reactToMessage(igClient, params);
    }
  );

  server.tool(
    'get_pending_requests',
    getPendingRequestsDescription,
    getPendingRequestsSchema.shape,
    async (params) => {
      return getPendingRequests(igClient, params);
    }
  );

  server.tool('mute_thread', muteThreadDescription, muteThreadSchema.shape, async (params) => {
    return muteThread(igClient, params);
  });

  server.tool('leave_thread', leaveThreadDescription, leaveThreadSchema.shape, async (params) => {
    return leaveThread(igClient, params);
  });

  // SEARCH & DISCOVERY
  server.tool('search_instagram', searchDescription, searchSchema, async (params) => {
    return searchInstagram(igClient, params);
  });

  server.tool('get_timeline', getTimelineDescription, getTimelineSchema.shape, async (params) => {
    return getTimeline(igClient, params);
  });

  server.tool('get_discover', getDiscoverDescription, getDiscoverSchema.shape, async (params) => {
    return getDiscover(igClient, params);
  });

  server.tool('get_saved_posts', getSavedDescription, getSavedSchema.shape, async (params) => {
    return getSaved(igClient, params);
  });

  server.tool('get_liked_posts', getLikedDescription, getLikedSchema.shape, async (params) => {
    return getLiked(igClient, params);
  });

  server.tool('get_tag_feed', getTagFeedDescription, getTagFeedSchema.shape, async (params) => {
    return getTagFeed(igClient, params);
  });

  // STORIES & HIGHLIGHTS
  server.tool('get_stories', getStoriesDescription, getStoriesSchema.shape, async (params) => {
    return getStories(igClient, params);
  });

  server.tool(
    'get_highlights',
    getHighlightsDescription,
    getHighlightsSchema.shape,
    async (params) => {
      return getHighlights(igClient, params);
    }
  );

  return server;
}
