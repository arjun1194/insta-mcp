import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const recentPostsSchema = {
  username: z
    .string()
    .optional()
    .describe('Instagram username. Leave empty to get your own posts.'),
  limit: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe('Number of posts to retrieve (1-50). Default is 10.'),
};

export const recentPostsDescription =
  'Get recent Instagram posts with engagement metrics (likes, comments, views).';

export async function getRecentPosts(
  client: InstagramClient,
  params: { username?: string; limit?: number }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const limit = params.limit ?? 10;
    const posts = await client.getRecentPosts(params.username, limit);

    const result = {
      count: posts.length,
      posts: posts.map((post) => ({
        id: post.id,
        shortcode: post.shortcode,
        url: `https://www.instagram.com/p/${post.shortcode}/`,
        type: post.type,
        caption: post.caption.length > 200 ? post.caption.substring(0, 200) + '...' : post.caption,
        engagement: {
          likes: post.likeCount,
          comments: post.commentCount,
          views: post.viewCount ?? null,
        },
        timestamp: post.timestamp,
        mediaUrl: post.mediaUrl,
      })),
      summary: {
        totalLikes: posts.reduce((sum, p) => sum + p.likeCount, 0),
        totalComments: posts.reduce((sum, p) => sum + p.commentCount, 0),
        averageLikes:
          posts.length > 0
            ? Math.round(posts.reduce((sum, p) => sum + p.likeCount, 0) / posts.length)
            : 0,
        averageComments:
          posts.length > 0
            ? Math.round(posts.reduce((sum, p) => sum + p.commentCount, 0) / posts.length)
            : 0,
      },
    };

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
