import { IgApiClient } from 'instagram-private-api';
import { RateLimiter } from '../utils/rate-limit.js';
import { handleInstagramError } from '../utils/errors.js';

export interface AccountOverview {
  userId: string;
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  isBusiness: boolean;
  externalUrl: string | null;
}

export interface PostInfo {
  id: string;
  shortcode: string;
  type: 'photo' | 'video' | 'carousel';
  caption: string;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  timestamp: string;
  mediaUrl: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  isPrivate: boolean;
  isVerified: boolean;
}

export interface PostInsights {
  id: string;
  shortcode: string;
  type: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  timestamp: string;
  mediaUrl: string;
  likers?: UserInfo[];
  comments?: CommentInfo[];
}

export interface CommentInfo {
  id: string;
  text: string;
  timestamp: string;
  user: UserInfo;
  likeCount: number;
}

export interface CompareResult {
  unfollowers: UserInfo[];
  fans: UserInfo[];
}

export interface UserSearchResult {
  userId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  isPrivate: boolean;
  isVerified: boolean;
  followerCount?: number;
  profileUrl: string;
}

export interface HashtagSearchResult {
  id: string;
  name: string;
  mediaCount: number;
  searchResultSubtitle: string;
  url: string;
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  url: string;
}

export interface PublishResult {
  id: string;
  shortcode: string;
  postUrl: string;
  caption: string;
  mediaType: 'photo' | 'video' | 'reel';
}

export interface FollowResult {
  userId: string;
  username: string;
  followedBy: boolean;
  following: boolean;
  outgoingRequest: boolean;
  status: 'followed' | 'requested' | 'unfollowed';
}

export class InstagramClient {
  private rateLimiter: RateLimiter;
  private currentUserId: string | null = null;

  // Base64 alphabet used by Instagram for shortcodes
  private static readonly SHORTCODE_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  constructor(private ig: IgApiClient) {
    this.rateLimiter = new RateLimiter();
  }

  private shortcodeToMediaId(shortcode: string): string {
    let mediaId = BigInt(0);
    for (const char of shortcode) {
      mediaId = mediaId * BigInt(64) + BigInt(InstagramClient.SHORTCODE_ALPHABET.indexOf(char));
    }
    return mediaId.toString();
  }

  private async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    await this.rateLimiter.throttle();
    try {
      return await operation();
    } catch (error) {
      handleInstagramError(error, this.ig);
    }
  }

  private async getCurrentUserId(): Promise<string> {
    if (this.currentUserId) {
      return this.currentUserId;
    }
    const user = await this.withRateLimit(() => this.ig.account.currentUser());
    this.currentUserId = user.pk.toString();
    return this.currentUserId;
  }

  private async resolveUserId(username?: string): Promise<string> {
    if (!username) {
      return this.getCurrentUserId();
    }
    const user = await this.withRateLimit(() => this.ig.user.searchExact(username));
    return user.pk.toString();
  }

  async getAccountOverview(username?: string): Promise<AccountOverview> {
    const userId = await this.resolveUserId(username);
    const userInfo = await this.withRateLimit(() => this.ig.user.info(userId));

    return {
      userId: userInfo.pk.toString(),
      username: userInfo.username,
      fullName: userInfo.full_name || '',
      bio: userInfo.biography || '',
      profilePicUrl: userInfo.profile_pic_url,
      followerCount: userInfo.follower_count,
      followingCount: userInfo.following_count,
      mediaCount: userInfo.media_count,
      isPrivate: userInfo.is_private,
      isVerified: userInfo.is_verified,
      isBusiness: userInfo.is_business || false,
      externalUrl: userInfo.external_url || null,
    };
  }

  async getRecentPosts(username?: string, limit: number = 10): Promise<PostInfo[]> {
    const userId = await this.resolveUserId(username);
    const feed = this.ig.feed.user(userId);
    const posts: PostInfo[] = [];

    while (posts.length < limit) {
      await this.rateLimiter.throttle();
      try {
        const items = await feed.items();
        if (items.length === 0) break;

        for (const item of items) {
          if (posts.length >= limit) break;

          let type: 'photo' | 'video' | 'carousel' = 'photo';
          if (item.media_type === 2) type = 'video';
          else if (item.media_type === 8) type = 'carousel';

          let mediaUrl = '';
          if (item.image_versions2?.candidates?.[0]) {
            mediaUrl = item.image_versions2.candidates[0].url;
          } else if (item.carousel_media?.[0]?.image_versions2?.candidates?.[0]) {
            mediaUrl = item.carousel_media[0].image_versions2.candidates[0].url;
          }

          posts.push({
            id: item.id,
            shortcode: item.code || '',
            type,
            caption: item.caption?.text || '',
            likeCount: item.like_count || 0,
            commentCount: item.comment_count || 0,
            viewCount: item.view_count,
            timestamp: new Date(item.taken_at * 1000).toISOString(),
            mediaUrl,
          });
        }

        if (!feed.isMoreAvailable()) break;
      } catch (error) {
        handleInstagramError(error, this.ig);
      }
    }

    return posts;
  }

  async getFollowers(username?: string, limit: number = 50): Promise<UserInfo[]> {
    const userId = username ? await this.resolveUserId(username) : await this.getCurrentUserId();
    const feed = this.ig.feed.accountFollowers(userId);
    const followers: UserInfo[] = [];

    while (followers.length < limit) {
      await this.rateLimiter.throttle();
      try {
        const items = await feed.items();
        if (items.length === 0) break;

        for (const item of items) {
          if (followers.length >= limit) break;
          followers.push({
            userId: item.pk.toString(),
            username: item.username,
            fullName: item.full_name || '',
            profilePicUrl: item.profile_pic_url,
            isPrivate: item.is_private,
            isVerified: item.is_verified || false,
          });
        }

        if (!feed.isMoreAvailable()) break;
      } catch (error) {
        handleInstagramError(error, this.ig);
      }
    }

    return followers;
  }

  async getFollowing(username?: string, limit: number = 50): Promise<UserInfo[]> {
    const userId = username ? await this.resolveUserId(username) : await this.getCurrentUserId();
    const feed = this.ig.feed.accountFollowing(userId);
    const following: UserInfo[] = [];

    while (following.length < limit) {
      await this.rateLimiter.throttle();
      try {
        const items = await feed.items();
        if (items.length === 0) break;

        for (const item of items) {
          if (following.length >= limit) break;
          following.push({
            userId: item.pk.toString(),
            username: item.username,
            fullName: item.full_name || '',
            profilePicUrl: item.profile_pic_url,
            isPrivate: item.is_private,
            isVerified: item.is_verified || false,
          });
        }

        if (!feed.isMoreAvailable()) break;
      } catch (error) {
        handleInstagramError(error, this.ig);
      }
    }

    return following;
  }

  async getPostInsights(
    postId: string,
    includeLikers: boolean = false,
    includeComments: boolean = false
  ): Promise<PostInsights> {
    // Handle both numeric IDs and shortcodes
    let mediaId = postId;

    // If it looks like a shortcode (not purely numeric), we need to convert it
    // Shortcodes are base64-encoded media IDs
    if (!/^\d+$/.test(postId) && !postId.includes('_')) {
      // Convert shortcode to media ID using base64 decoding
      mediaId = this.shortcodeToMediaId(postId);
    }

    const mediaInfo = await this.withRateLimit(() => this.ig.media.info(mediaId));
    const item = mediaInfo.items[0];

    let type: string = 'photo';
    if (item.media_type === 2) type = 'video';
    else if (item.media_type === 8) type = 'carousel';

    let mediaUrl = '';
    if (item.image_versions2?.candidates?.[0]) {
      mediaUrl = item.image_versions2.candidates[0].url;
    }

    const insights: PostInsights = {
      id: item.id,
      shortcode: item.code || '',
      type,
      caption: item.caption?.text || '',
      likeCount: item.like_count || 0,
      commentCount: item.comment_count || 0,
      viewCount: (item as unknown as Record<string, unknown>).view_count as number | undefined,
      timestamp: new Date(item.taken_at * 1000).toISOString(),
      mediaUrl,
    };

    if (includeLikers) {
      try {
        const likers = await this.withRateLimit(() => this.ig.media.likers(mediaId));
        insights.likers = likers.users.slice(0, 50).map(user => ({
          userId: user.pk.toString(),
          username: user.username,
          fullName: user.full_name || '',
          profilePicUrl: user.profile_pic_url,
          isPrivate: user.is_private,
          isVerified: user.is_verified || false,
        }));
      } catch {
        // Likers may not be available for all posts
        insights.likers = [];
      }
    }

    if (includeComments) {
      try {
        const commentsFeed = this.ig.feed.mediaComments(mediaId);
        await this.rateLimiter.throttle();
        const comments = await commentsFeed.items();
        insights.comments = comments.slice(0, 20).map(comment => ({
          id: comment.pk.toString(),
          text: comment.text,
          timestamp: new Date(comment.created_at * 1000).toISOString(),
          user: {
            userId: comment.user.pk.toString(),
            username: comment.user.username,
            fullName: comment.user.full_name || '',
            profilePicUrl: comment.user.profile_pic_url,
            isPrivate: comment.user.is_private,
            isVerified: comment.user.is_verified || false,
          },
          likeCount: comment.comment_like_count || 0,
        }));
      } catch {
        // Comments may not be available
        insights.comments = [];
      }
    }

    return insights;
  }

  async compareFollowLists(
    analysisType: 'unfollowers' | 'fans' | 'both' = 'both'
  ): Promise<CompareResult> {
    // Get all followers and following
    // Using higher limits for comparison
    const [followers, following] = await Promise.all([
      this.getFollowers(undefined, 1000),
      this.getFollowing(undefined, 1000),
    ]);

    const followerIds = new Set(followers.map(f => f.userId));
    const followingIds = new Set(following.map(f => f.userId));

    const result: CompareResult = {
      unfollowers: [],
      fans: [],
    };

    if (analysisType === 'unfollowers' || analysisType === 'both') {
      // Unfollowers: people you follow who don't follow you back
      result.unfollowers = following.filter(f => !followerIds.has(f.userId));
    }

    if (analysisType === 'fans' || analysisType === 'both') {
      // Fans: people who follow you but you don't follow back
      result.fans = followers.filter(f => !followingIds.has(f.userId));
    }

    return result;
  }

  async searchUsers(query: string, limit: number = 10): Promise<UserSearchResult[]> {
    const searchResult = await this.withRateLimit(() => this.ig.user.search(query));

    return searchResult.users.slice(0, limit).map(user => ({
      userId: user.pk.toString(),
      username: user.username,
      fullName: user.full_name || '',
      profilePicUrl: user.profile_pic_url,
      isPrivate: user.is_private,
      isVerified: user.is_verified || false,
      followerCount: user.follower_count,
      profileUrl: `https://www.instagram.com/${user.username}/`,
    }));
  }

  async searchHashtags(query: string, limit: number = 10): Promise<HashtagSearchResult[]> {
    const searchResult = await this.withRateLimit(() => this.ig.search.tags(query));

    // searchResult is an array of tags directly
    return searchResult.slice(0, limit).map(tag => ({
      id: String(tag.id),
      name: tag.name,
      mediaCount: tag.media_count || 0,
      searchResultSubtitle: tag.search_result_subtitle || `${tag.media_count?.toLocaleString() || 0} posts`,
      url: `https://www.instagram.com/explore/tags/${tag.name}/`,
    }));
  }

  async searchPlaces(query: string, limit: number = 10): Promise<PlaceSearchResult[]> {
    const searchResult = await this.withRateLimit(() => this.ig.search.places(query));

    // searchResult is an array of place items directly
    return searchResult.slice(0, limit).map(item => ({
      id: String(item.location.pk),
      name: item.location.name,
      address: item.location.address || '',
      city: item.location.city || '',
      latitude: item.location.lat,
      longitude: item.location.lng,
      url: `https://www.instagram.com/explore/locations/${item.location.pk}/`,
    }));
  }

  async uploadPhoto(
    imageBuffer: Buffer,
    caption: string = ''
  ): Promise<PublishResult> {
    const result = await this.withRateLimit(() =>
      this.ig.publish.photo({
        file: imageBuffer,
        caption,
      })
    );

    const media = result.media as unknown as { id: string; code: string; caption?: { text: string } | null };

    return {
      id: media.id,
      shortcode: media.code,
      postUrl: `https://www.instagram.com/p/${media.code}/`,
      caption: media.caption?.text || caption,
      mediaType: 'photo',
    };
  }

  async uploadVideo(
    videoBuffer: Buffer,
    coverImageBuffer: Buffer,
    caption: string = ''
  ): Promise<PublishResult> {
    const result = await this.withRateLimit(() =>
      this.ig.publish.video({
        video: videoBuffer,
        coverImage: coverImageBuffer,
        caption,
      })
    );

    const media = result.media as unknown as { id: string; code: string; caption?: { text: string } | null };

    return {
      id: media.id,
      shortcode: media.code,
      postUrl: `https://www.instagram.com/p/${media.code}/`,
      caption: media.caption?.text || caption,
      mediaType: 'video',
    };
  }

  async uploadReel(
    videoBuffer: Buffer,
    coverImageBuffer: Buffer,
    caption: string = ''
  ): Promise<PublishResult> {
    // Reels are uploaded as regular videos through the instagram-private-api
    // The API will handle the reel-specific processing
    const result = await this.withRateLimit(() =>
      this.ig.publish.video({
        video: videoBuffer,
        coverImage: coverImageBuffer,
        caption,
      })
    );

    const media = result.media as unknown as { id: string; code: string; caption?: { text: string } | null };

    return {
      id: media.id,
      shortcode: media.code,
      postUrl: `https://www.instagram.com/reel/${media.code}/`,
      caption: media.caption?.text || caption,
      mediaType: 'reel',
    };
  }

  async followUser(username: string): Promise<FollowResult> {
    // First resolve the username to a user ID
    const user = await this.withRateLimit(() => this.ig.user.searchExact(username));
    const userId = user.pk.toString();

    // Send follow request
    const result = await this.withRateLimit(() => this.ig.friendship.create(userId));

    // The result is the friendship_status directly
    const friendshipStatus = result as unknown as {
      followed_by?: boolean;
      following?: boolean;
      outgoing_request?: boolean;
    };

    // Determine the status based on the response
    let status: 'followed' | 'requested' = 'followed';
    if (friendshipStatus.outgoing_request) {
      status = 'requested'; // Private account, follow request sent
    }

    return {
      userId,
      username: user.username,
      followedBy: friendshipStatus.followed_by || false,
      following: friendshipStatus.following || false,
      outgoingRequest: friendshipStatus.outgoing_request || false,
      status,
    };
  }

  async unfollowUser(username: string): Promise<FollowResult> {
    // First resolve the username to a user ID
    const user = await this.withRateLimit(() => this.ig.user.searchExact(username));
    const userId = user.pk.toString();

    // Unfollow the user
    const result = await this.withRateLimit(() => this.ig.friendship.destroy(userId));

    // The result is the friendship_status directly
    const friendshipStatus = result as unknown as {
      followed_by?: boolean;
      following?: boolean;
      outgoing_request?: boolean;
    };

    return {
      userId,
      username: user.username,
      followedBy: friendshipStatus.followed_by || false,
      following: friendshipStatus.following || false,
      outgoingRequest: friendshipStatus.outgoing_request || false,
      status: 'unfollowed',
    };
  }
}
