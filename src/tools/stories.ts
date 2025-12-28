import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';

export const getStoriesSchema = z.object({
  username: z
    .string()
    .optional()
    .describe('Username to get stories from. If omitted, gets your reels tray.'),
});

export const getStoriesDescription = 'Get active stories for a user or your own story tray.';

export async function getStories(igClient: InstagramClient, params: any) {
  let result;
  if (params.username) {
    result = await igClient.getUserStories(params.username);
  } else {
    result = await igClient.getStories();
  }
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const getHighlightsSchema = z.object({
  username: z.string().describe('Username to get highlights from'),
});

export const getHighlightsDescription = "Get a user's story highlights.";

export async function getHighlights(igClient: InstagramClient, params: any) {
  const result = await igClient.getHighlights(params.username);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}
