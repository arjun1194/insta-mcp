import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const accountOverviewSchema = {
  username: z
    .string()
    .optional()
    .describe('Instagram username to look up. Leave empty to get your own account info.'),
};

export const accountOverviewDescription =
  'Get Instagram account profile information including follower/following counts, bio, and account details.';

export async function getAccountOverview(
  client: InstagramClient,
  params: { username?: string }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const overview = await client.getAccountOverview(params.username);

    const result = {
      userId: overview.userId,
      username: overview.username,
      fullName: overview.fullName,
      bio: overview.bio,
      profilePicUrl: overview.profilePicUrl,
      statistics: {
        followers: overview.followerCount,
        following: overview.followingCount,
        posts: overview.mediaCount,
      },
      accountType: {
        isPrivate: overview.isPrivate,
        isVerified: overview.isVerified,
        isBusiness: overview.isBusiness,
      },
      externalUrl: overview.externalUrl,
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

export const getActivitySchema = z.object({});

export const getActivityDescription = 'Get your activity feed (notifications).';

export async function getActivity(igClient: InstagramClient, _params: any) {
  const result = await igClient.getActivityFeed();
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const editProfileSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  biography: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  gender: z.number().optional(),
});

export const editProfileDescription = 'Edit your Instagram profile information.';

export async function editProfile(igClient: InstagramClient, params: any) {
  await igClient.editProfile(params);
  return {
    content: [{ type: 'text' as const, text: 'Profile updated successfully' }],
  };
}

export const blockUserSchema = z.object({
  username: z.string().describe('Username of the user to block'),
});

export const blockUserDescription = 'Block an Instagram user.';

export async function blockUser(igClient: InstagramClient, params: any) {
  const userId = await igClient.resolveUserId(params.username);
  await igClient.blockUser(userId);
  return {
    content: [{ type: 'text' as const, text: `Successfully blocked user ${params.username}` }],
  };
}

export const setPrivacySchema = z.object({
  isPrivate: z.boolean().describe('Set to true for private account, false for public'),
});

export const setPrivacyDescription = 'Change account privacy (private/public).';

export async function setPrivacy(igClient: InstagramClient, params: any) {
  await igClient.setAccountPrivacy(params.isPrivate);
  return {
    content: [
      { type: 'text' as const, text: `Account is now ${params.isPrivate ? 'private' : 'public'}` },
    ],
  };
}
