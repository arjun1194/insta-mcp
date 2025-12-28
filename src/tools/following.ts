import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const followingSchema = {
  username: z.string().optional().describe('Username to get following list for'),
  limit: z.number().optional().default(50).describe('Maximum number of accounts to return'),
};

export const followingDescription = 'Get the list of accounts a user is following.';

export async function getFollowing(
  client: InstagramClient,
  params: { username?: string; limit?: number }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const limit = params.limit ?? 50;
    const following = await client.getFollowing(params.username, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              username: params.username || 'me',
              count: following.length,
              following: following.map((user: any) => ({
                username: user.username,
                fullName: user.fullName,
                profilePicUrl: user.profilePicUrl,
                isPrivate: user.isPrivate,
                isVerified: user.isVerified,
              })),
            },
            null,
            2
          ),
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
