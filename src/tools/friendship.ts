import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

// Follow User
export const followUserSchema = {
  username: z.string().describe('Instagram username to follow.'),
};

export const followUserDescription =
  'Send a follow request to an Instagram user. For public accounts, you will follow immediately. For private accounts, a follow request will be sent.';

export async function followUser(
  client: InstagramClient,
  params: { username: string }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const result = await client.followUser(params.username);

    const message =
      result.status === 'requested'
        ? `Follow request sent to @${result.username} (private account)`
        : `Now following @${result.username}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message,
              ...result,
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

// Unfollow User
export const unfollowUserSchema = {
  username: z.string().describe('Instagram username to unfollow.'),
};

export const unfollowUserDescription = 'Unfollow an Instagram user.';

export async function unfollowUser(
  client: InstagramClient,
  params: { username: string }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const result = await client.unfollowUser(params.username);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Unfollowed @${result.username}`,
              ...result,
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
