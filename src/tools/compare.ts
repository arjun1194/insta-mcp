import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const compareSchema = {
  analysis_type: z
    .enum(['unfollowers', 'fans', 'both'])
    .default('both')
    .describe(
      'Type of analysis: "unfollowers" (people you follow who don\'t follow back), "fans" (people who follow you but you don\'t follow back), or "both".'
    ),
};

export const compareDescription =
  "Compare your followers and following lists to find unfollowers (people who don't follow you back) and fans (people you don't follow back).";

export async function compareFollowLists(
  client: InstagramClient,
  params: { analysis_type?: 'unfollowers' | 'fans' | 'both' }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const analysisType = params.analysis_type ?? 'both';
    const comparison = await client.compareFollowLists(analysisType);

    const result: Record<string, unknown> = {
      analysisType,
    };

    if (analysisType === 'unfollowers' || analysisType === 'both') {
      result.unfollowers = {
        description: "People you follow who don't follow you back",
        count: comparison.unfollowers.length,
        users: comparison.unfollowers.map((user) => ({
          username: user.username,
          fullName: user.fullName,
          profileUrl: `https://www.instagram.com/${user.username}/`,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
        })),
      };
    }

    if (analysisType === 'fans' || analysisType === 'both') {
      result.fans = {
        description: "People who follow you but you don't follow back",
        count: comparison.fans.length,
        users: comparison.fans.map((user) => ({
          username: user.username,
          fullName: user.fullName,
          profileUrl: `https://www.instagram.com/${user.username}/`,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
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
