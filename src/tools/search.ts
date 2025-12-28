import { z } from 'zod';
import {
  InstagramClient,
  UserSearchResult,
  HashtagSearchResult,
  PlaceSearchResult,
} from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

export const searchSchema = {
  query: z.string().min(1).describe('Search query (username, hashtag without #, or location name)'),
  search_type: z
    .enum(['user', 'hashtag', 'place'])
    .default('user')
    .describe(
      'Type of search: "user" for profiles, "hashtag" for hashtags, "place" for locations. Default is "user".'
    ),
  limit: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe('Maximum number of results to return (1-50). Default is 10.'),
};

export const searchDescription =
  'Search Instagram for users, hashtags, or places and get matching results.';

export async function searchInstagram(
  client: InstagramClient,
  params: { query: string; search_type?: 'user' | 'hashtag' | 'place'; limit?: number }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const searchType = params.search_type ?? 'user';
    const limit = params.limit ?? 10;
    const query = params.query.replace(/^#/, ''); // Remove leading # if present

    let result: {
      query: string;
      searchType: string;
      count: number;
      results: Array<UserSearchResult | HashtagSearchResult | PlaceSearchResult>;
    };

    if (searchType === 'user') {
      const users = await client.searchUsers(query, limit);
      result = {
        query,
        searchType: 'user',
        count: users.length,
        results: users,
      };
    } else if (searchType === 'hashtag') {
      const hashtags = await client.searchHashtags(query, limit);
      result = {
        query,
        searchType: 'hashtag',
        count: hashtags.length,
        results: hashtags,
      };
    } else {
      const places = await client.searchPlaces(query, limit);
      result = {
        query,
        searchType: 'place',
        count: places.length,
        results: places,
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
