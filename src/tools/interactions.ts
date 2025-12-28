import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';

export const likeMediaSchema = z.object({
  mediaId: z.string().describe('The ID of the media to like (can be numeric ID or shortcode)'),
});

export const likeMediaDescription = 'Like a post, video, or reel.';

export async function likeMedia(igClient: InstagramClient, params: any) {
  let mediaId = params.mediaId;
  // Convert shortcode to ID if needed
  if (!/^\d+$/.test(mediaId) && !mediaId.includes('_')) {
    mediaId = (igClient as any).shortcodeToMediaId(mediaId);
  }

  await igClient.likeMedia(mediaId);
  return {
    content: [{ type: 'text' as const, text: `Successfully liked media ${params.mediaId}` }],
  };
}

export const addCommentSchema = z.object({
  mediaId: z.string().describe('The ID of the media to comment on'),
  text: z.string().describe('The comment text'),
});

export const addCommentDescription = 'Add a comment to a post, video, or reel.';

export async function addComment(igClient: InstagramClient, params: any) {
  let mediaId = params.mediaId;
  // Convert shortcode to ID if needed
  if (!/^\d+$/.test(mediaId) && !mediaId.includes('_')) {
    mediaId = (igClient as any).shortcodeToMediaId(mediaId);
  }

  const result = await igClient.addComment(mediaId, params.text);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Successfully added comment to media ${params.mediaId}. Comment ID: ${result.pk}`,
      },
    ],
  };
}

export const replyToCommentSchema = z.object({
  mediaId: z.string().describe('The ID of the media the comment is on'),
  commentId: z.string().describe('The ID of the comment to reply to'),
  text: z.string().describe('The reply text'),
});

export const replyToCommentDescription = 'Reply to a specific comment on a post.';

export async function replyToComment(igClient: InstagramClient, params: any) {
  const result = await igClient.replyToComment(params.mediaId, params.commentId, params.text);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Successfully replied to comment ${params.commentId}. Reply ID: ${result.pk}`,
      },
    ],
  };
}

export const likeCommentSchema = z.object({
  commentId: z.string().describe('The ID of the comment to like'),
});

export const likeCommentDescription = 'Like an Instagram comment.';

export async function likeComment(igClient: InstagramClient, params: any) {
  await igClient.likeComment(params.commentId);
  return {
    content: [{ type: 'text' as const, text: `Successfully liked comment ${params.commentId}` }],
  };
}
