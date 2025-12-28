import { BaseService } from './base.js';
import {
  AccountOverview,
  UserInfo,
  UserSearchResult,
  FollowResult,
  CompareResult,
  HashtagSearchResult,
  PlaceSearchResult,
  ProfileEditOptions,
} from '../types.js';

export class UserService extends BaseService {
  // ... existing methods ...
  async editProfile(options: ProfileEditOptions): Promise<any> {
    const current = await this.ig.account.currentUser();
    return this.withRateLimit(() =>
      this.ig.account.editProfile({
        external_url: options.website || current.external_url,
        gender: String(options.gender || current.gender),
        phone_number: options.phoneNumber || current.phone_number,
        username: options.username || current.username,
        first_name: options.name || current.full_name,
        biography: options.biography || current.biography,
        email: options.email || current.email,
      })
    );
  }

  async setAccountPrivacy(isPrivate: boolean): Promise<any> {
    return this.withRateLimit(() =>
      isPrivate ? this.ig.account.setPrivate() : this.ig.account.setPublic()
    );
  }

  async blockUser(userId: string): Promise<any> {
    return this.withRateLimit(() => this.ig.friendship.block(userId));
  }

  async unblockUser(userId: string): Promise<any> {
    return this.withRateLimit(() => this.ig.friendship.unblock(userId));
  }

  async getBlockedUsers(): Promise<any[]> {
    const feed = this.ig.feed.blockedUsers();
    return this.withRateLimit(() => feed.items());
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

  async getFollowers(username?: string, limit: number = 50): Promise<UserInfo[]> {
    const userId = await this.resolveUserId(username);
    const feed = this.ig.feed.accountFollowers(userId);
    const followers: UserInfo[] = [];

    while (followers.length < limit) {
      await this.rateLimiter.throttle();
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
    }
    return followers;
  }

  async getFollowing(username?: string, limit: number = 50): Promise<UserInfo[]> {
    const userId = await this.resolveUserId(username);
    const feed = this.ig.feed.accountFollowing(userId);
    const following: UserInfo[] = [];

    while (following.length < limit) {
      await this.rateLimiter.throttle();
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
    }
    return following;
  }

  async searchUsers(query: string, limit: number = 10): Promise<UserSearchResult[]> {
    const searchResult = await this.withRateLimit(() => this.ig.user.search(query));
    return searchResult.users.slice(0, limit).map((user) => ({
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

    return searchResult.slice(0, limit).map((tag) => ({
      id: String(tag.id),
      name: tag.name,
      mediaCount: tag.media_count || 0,
      searchResultSubtitle:
        tag.search_result_subtitle || `${tag.media_count?.toLocaleString() || 0} posts`,
      url: `https://www.instagram.com/explore/tags/${tag.name}/`,
    }));
  }

  async searchPlaces(query: string, limit: number = 10): Promise<PlaceSearchResult[]> {
    const searchResult = await this.withRateLimit(() => this.ig.search.places(query));

    return searchResult.slice(0, limit).map((item) => ({
      id: String(item.location.pk),
      name: item.location.name,
      address: item.location.address || '',
      city: item.location.city || '',
      latitude: item.location.lat,
      longitude: item.location.lng,
      url: `https://www.instagram.com/explore/locations/${item.location.pk}/`,
    }));
  }

  async followUser(username: string): Promise<FollowResult> {
    const user = await this.withRateLimit(() => this.ig.user.searchExact(username));
    const userId = user.pk.toString();
    const result = (await this.withRateLimit(() => this.ig.friendship.create(userId))) as any;

    let status: 'followed' | 'requested' = 'followed';
    if (result.outgoing_request) {
      status = 'requested';
    }

    return {
      userId,
      username: user.username,
      followedBy: result.followed_by || false,
      following: result.following || false,
      outgoingRequest: result.outgoing_request || false,
      status,
    };
  }

  async unfollowUser(username: string): Promise<FollowResult> {
    const user = await this.withRateLimit(() => this.ig.user.searchExact(username));
    const userId = user.pk.toString();
    const result = (await this.withRateLimit(() => this.ig.friendship.destroy(userId))) as any;

    return {
      userId,
      username: user.username,
      followedBy: result.followed_by || false,
      following: result.following || false,
      outgoingRequest: result.outgoing_request || false,
      status: 'unfollowed',
    };
  }

  async compareFollowLists(
    analysisType: 'unfollowers' | 'fans' | 'both' = 'both'
  ): Promise<CompareResult> {
    const [followers, following] = await Promise.all([
      this.getFollowers(undefined, 1000),
      this.getFollowing(undefined, 1000),
    ]);

    const followerIds = new Set(followers.map((f) => f.userId));
    const followingIds = new Set(following.map((f) => f.userId));

    const result: CompareResult = {
      unfollowers: [],
      fans: [],
    };

    if (analysisType === 'unfollowers' || analysisType === 'both') {
      result.unfollowers = following.filter((f) => !followerIds.has(f.userId));
    }

    if (analysisType === 'fans' || analysisType === 'both') {
      result.fans = followers.filter((f) => !followingIds.has(f.userId));
    }

    return result;
  }
}
