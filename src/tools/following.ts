import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const followingSchema = {
  username: z.string().optional().describe(
    'Instagram username to get following list for. Leave empty to get your own following list.'
  ),
  limit: z.number().min(1).max(200).default(50).describe(
    'Maximum number of accounts to retrieve (1-200). Default is 50.'
  ),
};

export const followingDescription =
  'Get a list of Instagram accounts a user is following. Can get following list for any public account or your own account.';

export async function getFollowing(
  client: InstagramClient,
  params: { username?: string; limit?: number }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const limit = params.limit ?? 50;
    const following = await client.getFollowing(params.username, limit);

    const result = {
      count: following.length,
      following: following.map(user => ({
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        profilePicUrl: user.profilePicUrl,
        profileUrl: `https://www.instagram.com/${user.username}/`,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified,
      })),
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
