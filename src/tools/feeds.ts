import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';

export const getTimelineSchema = z.object({
  limit: z.number().optional().default(20),
});

export const getTimelineDescription = 'Get your home timeline feed.';

export async function getTimeline(igClient: InstagramClient, params: any) {
  const result = await igClient.getTimelineFeed(params.limit);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const getDiscoverSchema = z.object({
  limit: z.number().optional().default(20),
});

export const getDiscoverDescription = 'Get the explore/discover feed.';

export async function getDiscover(igClient: InstagramClient, params: any) {
  const result = await igClient.getDiscoverFeed(params.limit);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const getSavedSchema = z.object({
  limit: z.number().optional().default(20),
});

export const getSavedDescription = 'Get your saved posts.';

export async function getSaved(igClient: InstagramClient, params: any) {
  const result = await igClient.getSavedPosts(params.limit);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const getLikedSchema = z.object({
  limit: z.number().optional().default(20),
});

export const getLikedDescription = 'Get posts you have liked.';

export async function getLiked(igClient: InstagramClient, params: any) {
  const result = await igClient.getLikedPosts(params.limit);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const getTagFeedSchema = z.object({
  tag: z.string().describe('Hashtag to get feed for'),
  limit: z.number().optional().default(20),
});

export const getTagFeedDescription = 'Get recent posts for a specific hashtag.';

export async function getTagFeed(igClient: InstagramClient, params: any) {
  const result = await igClient.getTagFeed(params.tag, params.limit);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}
