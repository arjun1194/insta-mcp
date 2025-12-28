import { BaseService } from './base.js';
import { PostInfo, PostInsights, PublishResult, UserInfo } from '../types.js';

export class MediaService extends BaseService {
  public static readonly SHORTCODE_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  public shortcodeToMediaId(shortcode: string): string {
    let mediaId = BigInt(0);
    for (const char of shortcode) {
      mediaId = mediaId * BigInt(64) + BigInt(MediaService.SHORTCODE_ALPHABET.indexOf(char));
    }
    return mediaId.toString();
  }

  async getRecentPosts(username?: string, limit: number = 10): Promise<PostInfo[]> {
    const userId = await this.resolveUserId(username);
    const feed = this.ig.feed.user(userId);
    const posts: PostInfo[] = [];

    while (posts.length < limit) {
      await this.rateLimiter.throttle();
      const items = await feed.items();
      if (items.length === 0) break;

      for (const item of items) {
        if (posts.length >= limit) break;
        posts.push(this.mapMediaToPostInfo(item));
      }
      if (!feed.isMoreAvailable()) break;
    }
    return posts;
  }

  private mapMediaToPostInfo(item: any): PostInfo {
    let type: 'photo' | 'video' | 'carousel' = 'photo';
    if (item.media_type === 2) type = 'video';
    else if (item.media_type === 8) type = 'carousel';

    let mediaUrl = '';
    if (item.image_versions2?.candidates?.[0]) {
      mediaUrl = item.image_versions2.candidates[0].url;
    } else if (item.carousel_media?.[0]?.image_versions2?.candidates?.[0]) {
      mediaUrl = item.carousel_media[0].image_versions2.candidates[0].url;
    }

    return {
      id: item.id,
      shortcode: item.code || '',
      type,
      caption: item.caption?.text || '',
      likeCount: item.like_count || 0,
      commentCount: item.comment_count || 0,
      viewCount: item.view_count,
      timestamp: new Date(item.taken_at * 1000).toISOString(),
      mediaUrl,
    };
  }

  async getPostInsights(
    postId: string,
    includeLikers: boolean = false,
    includeComments: boolean = false
  ): Promise<PostInsights> {
    let mediaId = postId;
    if (!/^\d+$/.test(postId) && !postId.includes('_')) {
      mediaId = this.shortcodeToMediaId(postId);
    }

    const mediaInfo = await this.withRateLimit(() => this.ig.media.info(mediaId));
    const item = mediaInfo.items[0];

    const insights: PostInsights = {
      ...this.mapMediaToPostInfo(item),
      likers: [],
      comments: [],
    };

    if (includeLikers) {
      try {
        const likers = await this.withRateLimit(() => this.ig.media.likers(mediaId));
        insights.likers = likers.users.slice(0, 50).map((user) => ({
          userId: user.pk.toString(),
          username: user.username,
          fullName: user.full_name || '',
          profilePicUrl: user.profile_pic_url,
          isPrivate: user.is_private,
          isVerified: user.is_verified || false,
        }));
      } catch {}
    }

    if (includeComments) {
      try {
        const commentsFeed = this.ig.feed.mediaComments(mediaId);
        await this.rateLimiter.throttle();
        const comments = await commentsFeed.items();
        insights.comments = comments.slice(0, 20).map((comment) => ({
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
      } catch {}
    }

    return insights;
  }

  async likeMedia(mediaId: string): Promise<any> {
    let id = mediaId;
    if (!/^\d+$/.test(mediaId) && !mediaId.includes('_')) {
      id = this.shortcodeToMediaId(mediaId);
    }
    return this.withRateLimit(() =>
      this.ig.media.like({
        mediaId: id,
        moduleInfo: { module_name: 'feed_timeline' },
        d: 1,
      })
    );
  }

  async addComment(mediaId: string, text: string): Promise<any> {
    let id = mediaId;
    if (!/^\d+$/.test(mediaId) && !mediaId.includes('_')) {
      id = this.shortcodeToMediaId(mediaId);
    }
    return this.withRateLimit(() =>
      this.ig.media.comment({
        mediaId: id,
        text,
      })
    );
  }

  async replyToComment(mediaId: string, targetCommentId: string, text: string): Promise<any> {
    let id = mediaId;
    if (!/^\d+$/.test(mediaId) && !mediaId.includes('_')) {
      id = this.shortcodeToMediaId(mediaId);
    }
    return this.withRateLimit(() =>
      this.ig.media.comment({
        mediaId: id,
        text,
        replyToCommentId: targetCommentId,
      })
    );
  }

  async likeComment(commentId: string): Promise<any> {
    return this.withRateLimit(() => this.ig.media.likeComment(commentId));
  }

  async deleteComment(mediaId: string, commentId: string): Promise<any> {
    let id = mediaId;
    if (!/^\d+$/.test(mediaId) && !mediaId.includes('_')) {
      id = this.shortcodeToMediaId(mediaId);
    }
    return this.withRateLimit(() => this.ig.media.commentsBulkDelete(id, [commentId]));
  }

  async searchLocations(query: string, lat?: number, lng?: number): Promise<any> {
    return this.withRateLimit(() => this.ig.locationSearch.index(lat || 0, lng || 0, query));
  }

  async uploadAlbum(
    items: Array<{ file: Buffer; type: 'photo' | 'video' }>,
    caption: string = ''
  ): Promise<PublishResult> {
    const result = (await this.withRateLimit(() =>
      this.ig.publish.album({
        items: items.map((item) => ({
          file: item.file,
          ...(item.type === 'video' ? { video: item.file } : {}),
        })),
        caption,
      })
    )) as any;

    return {
      id: result.media.id,
      shortcode: result.media.code,
      postUrl: `https://www.instagram.com/p/${result.media.code}/`,
      caption: result.media.caption?.text || caption,
      mediaType: 'photo',
    };
  }

  async uploadPhoto(imageBuffer: Buffer, caption: string = ''): Promise<PublishResult> {
    const result = (await this.withRateLimit(() =>
      this.ig.publish.photo({
        file: imageBuffer,
        caption,
      })
    )) as any;

    return {
      id: result.media.id,
      shortcode: result.media.code,
      postUrl: `https://www.instagram.com/p/${result.media.code}/`,
      caption: result.media.caption?.text || caption,
      mediaType: 'photo',
    };
  }

  async uploadVideo(
    videoBuffer: Buffer,
    coverImageBuffer: Buffer,
    caption: string = ''
  ): Promise<PublishResult> {
    const result = (await this.withRateLimit(() =>
      this.ig.publish.video({
        video: videoBuffer,
        coverImage: coverImageBuffer,
        caption,
      })
    )) as any;

    return {
      id: result.media.id,
      shortcode: result.media.code,
      postUrl: `https://www.instagram.com/p/${result.media.code}/`,
      caption: result.media.caption?.text || caption,
      mediaType: 'video',
    };
  }

  async uploadReel(
    videoBuffer: Buffer,
    coverImageBuffer: Buffer,
    caption: string = ''
  ): Promise<PublishResult> {
    const result = (await this.withRateLimit(() =>
      this.ig.publish.video({
        video: videoBuffer,
        coverImage: coverImageBuffer,
        caption,
      })
    )) as any;

    return {
      id: result.media.id,
      shortcode: result.media.code,
      postUrl: `https://www.instagram.com/reel/${result.media.code}/`,
      caption: result.media.caption?.text || caption,
      mediaType: 'reel',
    };
  }
}
