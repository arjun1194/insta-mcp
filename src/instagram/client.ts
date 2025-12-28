import { IgApiClient } from 'instagram-private-api';
import { RateLimiter } from '../utils/rate-limit.js';
import { UserService } from './services/user.service.js';
import { MediaService } from './services/media.service.js';
import { FeedService } from './services/feed.service.js';
import { StoryService } from './services/story.service.js';
import { DirectService } from './services/direct.service.js';
import * as Types from './types.js';

export * from './types.js';

export class InstagramClient {
  private rateLimiter: RateLimiter;
  private user: UserService;
  private media: MediaService;
  private feeds: FeedService;
  private stories: StoryService;
  private direct: DirectService;

  constructor(private ig: IgApiClient) {
    this.rateLimiter = new RateLimiter();
    this.user = new UserService(ig, this.rateLimiter);
    this.media = new MediaService(ig, this.rateLimiter);
    this.feeds = new FeedService(ig, this.rateLimiter);
    this.stories = new StoryService(ig, this.rateLimiter);
    this.direct = new DirectService(ig, this.rateLimiter);
  }

  // User Service delegation
  async getAccountOverview(username?: string) {
    return this.user.getAccountOverview(username);
  }
  async getFollowers(username?: string, limit?: number) {
    return this.user.getFollowers(username, limit);
  }
  async getFollowing(username?: string, limit?: number) {
    return this.user.getFollowing(username, limit);
  }
  async searchUsers(query: string, limit?: number) {
    return this.user.searchUsers(query, limit);
  }
  async searchHashtags(query: string, limit?: number) {
    return this.user.searchHashtags(query, limit);
  }
  async searchPlaces(query: string, limit?: number) {
    return this.user.searchPlaces(query, limit);
  }
  async followUser(username: string) {
    return this.user.followUser(username);
  }
  async unfollowUser(username: string) {
    return this.user.unfollowUser(username);
  }
  async resolveUserId(username?: string) {
    return this.user.resolveUserId(username);
  }
  async compareFollowLists(analysisType?: 'unfollowers' | 'fans' | 'both') {
    return this.user.compareFollowLists(analysisType);
  }
  async editProfile(options: Types.ProfileEditOptions) {
    return this.user.editProfile(options);
  }
  async setAccountPrivacy(isPrivate: boolean) {
    return this.user.setAccountPrivacy(isPrivate);
  }
  async blockUser(userId: string) {
    return this.user.blockUser(userId);
  }
  async unblockUser(userId: string) {
    return this.user.unblockUser(userId);
  }
  async getBlockedUsers() {
    return this.user.getBlockedUsers();
  }

  // Media Service delegation
  async getRecentPosts(username?: string, limit?: number) {
    return this.media.getRecentPosts(username, limit);
  }
  async getPostInsights(postId: string, includeLikers?: boolean, includeComments?: boolean) {
    return this.media.getPostInsights(postId, includeLikers, includeComments);
  }
  async likeMedia(mediaId: string) {
    return this.media.likeMedia(mediaId);
  }
  async addComment(mediaId: string, text: string) {
    return this.media.addComment(mediaId, text);
  }
  async replyToComment(mediaId: string, targetCommentId: string, text: string) {
    return this.media.replyToComment(mediaId, targetCommentId, text);
  }
  async likeComment(commentId: string) {
    return this.media.likeComment(commentId);
  }
  async deleteComment(mediaId: string, commentId: string) {
    return this.media.deleteComment(mediaId, commentId);
  }
  async searchLocations(query: string, lat?: number, lng?: number) {
    return this.media.searchLocations(query, lat, lng);
  }
  async uploadAlbum(items: Array<{ file: Buffer; type: 'photo' | 'video' }>, caption?: string) {
    return this.media.uploadAlbum(items, caption);
  }
  async uploadPhoto(imageBuffer: Buffer, caption?: string) {
    return this.media.uploadPhoto(imageBuffer, caption);
  }
  async uploadVideo(videoBuffer: Buffer, coverImageBuffer: Buffer, caption?: string) {
    return this.media.uploadVideo(videoBuffer, coverImageBuffer, caption);
  }
  async uploadReel(videoBuffer: Buffer, coverImageBuffer: Buffer, caption?: string) {
    return this.media.uploadReel(videoBuffer, coverImageBuffer, caption);
  }
  shortcodeToMediaId(shortcode: string) {
    return this.media.shortcodeToMediaId(shortcode);
  }

  // Feed Service delegation
  async getTimelineFeed(limit?: number) {
    return this.feeds.getTimelineFeed(limit);
  }
  async getDiscoverFeed(limit?: number) {
    return this.feeds.getDiscoverFeed(limit);
  }
  async getSavedPosts(limit?: number) {
    return this.feeds.getSavedPosts(limit);
  }
  async getLikedPosts(limit?: number) {
    return this.feeds.getLikedPosts(limit);
  }
  async getTagFeed(tag: string, limit?: number) {
    return this.feeds.getTagFeed(tag, limit);
  }
  async getActivityFeed() {
    return this.feeds.getActivityFeed();
  }

  // Story Service delegation
  async getStories() {
    return this.stories.getStories();
  }
  async getUserStories(username: string) {
    return this.stories.getUserStories(username);
  }
  async getHighlights(username: string) {
    return this.stories.getHighlights(username);
  }

  // Direct Service delegation
  async getInbox(limit?: number) {
    return this.direct.getInbox(limit);
  }
  async getDirectMessages(threadId: string, limit?: number) {
    return this.direct.getDirectMessages(threadId, limit);
  }
  async sendDirectMessage(userIds: string[], text: string) {
    return this.direct.sendDirectMessage(userIds, text);
  }
  async sendDirectPhoto(userIds: string[], imageBuffer: Buffer) {
    return this.direct.sendDirectPhoto(userIds, imageBuffer);
  }
  async reactToMessage(threadId: string, itemId: string, reaction: string) {
    return this.direct.reactToMessage(threadId, itemId, reaction);
  }
  async muteThread(threadId: string) {
    return this.direct.muteThread(threadId);
  }
  async unmuteThread(threadId: string) {
    return this.direct.unmuteThread(threadId);
  }
  async leaveThread(threadId: string) {
    return this.direct.leaveThread(threadId);
  }
  async getPendingDirectRequests() {
    return this.direct.getPendingDirectRequests();
  }
}
