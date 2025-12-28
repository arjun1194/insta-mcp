import { BaseService } from './base.js';
import { PostInfo } from '../types.js';

export class FeedService extends BaseService {
  async getTimelineFeed(limit: number = 20): Promise<PostInfo[]> {
    const feed = this.ig.feed.timeline();
    const posts: PostInfo[] = [];

    await this.rateLimiter.throttle();
    const items = await feed.items();

    for (const item of items.slice(0, limit)) {
      posts.push(this.mapMediaToPostInfo(item));
    }
    return posts;
  }

  async getDiscoverFeed(limit: number = 20): Promise<PostInfo[]> {
    const feed = this.ig.feed.discover();
    const posts: PostInfo[] = [];

    await this.rateLimiter.throttle();
    const items = await feed.items();

    for (const item of items.slice(0, limit)) {
      const media = (item as any).media;
      if (!media) continue;
      posts.push(this.mapMediaToPostInfo(media));
    }
    return posts;
  }

  async getSavedPosts(limit: number = 20): Promise<PostInfo[]> {
    const feed = this.ig.feed.saved();
    const posts: PostInfo[] = [];

    await this.rateLimiter.throttle();
    const items = await feed.items();

    for (const item of items.slice(0, limit)) {
      posts.push(this.mapMediaToPostInfo(item));
    }
    return posts;
  }

  async getLikedPosts(limit: number = 20): Promise<PostInfo[]> {
    const feed = this.ig.feed.liked();
    const posts: PostInfo[] = [];

    await this.rateLimiter.throttle();
    const items = await feed.items();

    for (const item of items.slice(0, limit)) {
      posts.push(this.mapMediaToPostInfo(item));
    }
    return posts;
  }

  async getTagFeed(tag: string, limit: number = 20): Promise<PostInfo[]> {
    const feed = this.ig.feed.tag(tag);
    const posts: PostInfo[] = [];

    await this.rateLimiter.throttle();
    const items = await feed.items();

    for (const item of items.slice(0, limit)) {
      posts.push(this.mapMediaToPostInfo(item));
    }
    return posts;
  }

  async getActivityFeed(): Promise<any[]> {
    const feed = this.ig.feed.news();
    return this.withRateLimit(() => feed.items());
  }

  private mapMediaToPostInfo(item: any): PostInfo {
    let type: 'photo' | 'video' | 'carousel' = 'photo';
    if (item.media_type === 2) type = 'video';
    else if (item.media_type === 8) type = 'carousel';

    let mediaUrl = '';
    if (item.image_versions2?.candidates?.[0]) {
      mediaUrl = item.image_versions2.candidates[0].url;
    }

    return {
      id: item.id,
      shortcode: item.code || '',
      type,
      caption: item.caption?.text || '',
      likeCount: item.like_count || 0,
      commentCount: item.comment_count || 0,
      timestamp: new Date(item.taken_at * 1000).toISOString(),
      mediaUrl,
    };
  }
}
