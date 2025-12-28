import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const postInsightsSchema = {
  post_id: z
    .string()
    .describe(
      'The Instagram post ID (numeric) or shortcode (the code from the post URL, e.g., "CxYz123AbC").'
    ),
  include_likers: z
    .boolean()
    .default(false)
    .describe('Include list of users who liked the post (up to 50 users).'),
  include_comments: z
    .boolean()
    .default(false)
    .describe('Include recent comments on the post (up to 20 comments).'),
};

export const postInsightsDescription =
  'Get detailed analytics for a specific Instagram post, including engagement metrics and optionally likers/comments.';

export async function getPostInsights(
  client: InstagramClient,
  params: { post_id: string; include_likers?: boolean; include_comments?: boolean }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const insights = await client.getPostInsights(
      params.post_id,
      params.include_likers ?? false,
      params.include_comments ?? false
    );

    const result: Record<string, unknown> = {
      id: insights.id,
      shortcode: insights.shortcode,
      url: `https://www.instagram.com/p/${insights.shortcode}/`,
      type: insights.type,
      caption: insights.caption,
      engagement: {
        likes: insights.likeCount,
        comments: insights.commentCount,
        views: insights.viewCount ?? null,
      },
      timestamp: insights.timestamp,
      mediaUrl: insights.mediaUrl,
    };

    if (insights.likers) {
      result.likers = {
        count: insights.likers.length,
        users: insights.likers.map((user) => ({
          username: user.username,
          fullName: user.fullName,
          profileUrl: `https://www.instagram.com/${user.username}/`,
          isVerified: user.isVerified,
        })),
      };
    }

    if (insights.comments) {
      result.comments = {
        count: insights.comments.length,
        items: insights.comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          timestamp: comment.timestamp,
          user: {
            username: comment.user.username,
            profileUrl: `https://www.instagram.com/${comment.user.username}/`,
          },
          likes: comment.likeCount,
        })),
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: formatErrorForMcp(error),
        },
      ],
    };
  }
}
