import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const followersSchema = {
  username: z
    .string()
    .optional()
    .describe('Instagram username to get followers for. Leave empty to get your own followers.'),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe('Maximum number of followers to retrieve (1-200). Default is 50.'),
};

export const followersDescription =
  'Get a list of Instagram followers with their profile information. Can get followers for any public account or your own account.';

export async function getFollowers(
  client: InstagramClient,
  params: { username?: string; limit?: number }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const limit = params.limit ?? 50;
    const followers = await client.getFollowers(params.username, limit);

    const result = {
      count: followers.length,
      followers: followers.map((user) => ({
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
