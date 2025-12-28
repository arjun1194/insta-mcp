import { BaseService } from './base.js';
import { DirectThread, DirectMessage } from '../types.js';

export class DirectService extends BaseService {
  async getInbox(limit: number = 20): Promise<DirectThread[]> {
    const inbox = this.ig.feed.directInbox();
    const threads: DirectThread[] = [];

    await this.rateLimiter.throttle();
    const items = await inbox.items();

    for (const item of items.slice(0, limit)) {
      threads.push({
        threadId: item.thread_id,
        threadTitle: item.thread_title,
        users: item.users.map((u: any) => ({
          userId: u.pk.toString(),
          username: u.username,
          fullName: u.full_name,
          profilePicUrl: u.profile_pic_url,
          isPrivate: u.is_private,
          isVerified: u.is_verified,
        })),
        lastMessage: item.last_permanent_item?.text,
        timestamp: new Date(Number(item.last_activity_at) / 1000).toISOString(),
      });
    }
    return threads;
  }

  async getDirectMessages(threadId: string, limit: number = 20): Promise<DirectMessage[]> {
    const thread = this.ig.feed.directThread({ thread_id: threadId } as any);
    const messages: DirectMessage[] = [];

    await this.rateLimiter.throttle();
    const items = await thread.items();

    for (const item of items.slice(0, limit)) {
      messages.push({
        id: item.item_id,
        userId: item.user_id.toString(),
        text: item.text || '',
        timestamp: new Date(Number(item.timestamp) / 1000).toISOString(),
        itemType: item.item_type,
      });
    }
    return messages;
  }

  async sendDirectMessage(userIds: string[], text: string): Promise<any> {
    const thread = this.ig.entity.directThread(userIds);
    return this.withRateLimit(() => thread.broadcastText(text));
  }

  async reactToMessage(threadId: string, itemId: string, _reaction: string): Promise<any> {
    return this.withRateLimit(() =>
      this.ig.directThread.broadcast({
        threadIds: [threadId],
        item: 'reaction',
        form: {
          item_id: itemId,
          node_type: 'item',
          reaction_status: 'created',
          reaction_type: 'like',
        },
      })
    );
  }

  async sendDirectPhoto(userIds: string[], imageBuffer: Buffer): Promise<any> {
    const thread = this.ig.entity.directThread(userIds);
    return this.withRateLimit(() => thread.broadcastPhoto({ file: imageBuffer }));
  }

  async muteThread(threadId: string): Promise<any> {
    return this.withRateLimit(() => this.ig.directThread.mute(threadId));
  }

  async unmuteThread(threadId: string): Promise<any> {
    return this.withRateLimit(() => this.ig.directThread.unmute(threadId));
  }

  async leaveThread(threadId: string): Promise<any> {
    return this.withRateLimit(() => this.ig.directThread.leave(threadId));
  }

  async getPendingDirectRequests(): Promise<DirectThread[]> {
    const feed = this.ig.feed.directPending();
    const threads: DirectThread[] = [];

    await this.rateLimiter.throttle();
    const items = await feed.items();

    for (const item of items) {
      threads.push({
        threadId: item.thread_id,
        threadTitle: item.thread_title,
        users: item.users.map((u: any) => ({
          userId: u.pk.toString(),
          username: u.username,
          fullName: u.full_name,
          profilePicUrl: u.profile_pic_url,
          isPrivate: u.is_private,
          isVerified: u.is_verified,
        })),
        lastMessage: item.last_permanent_item?.text,
        timestamp: new Date(Number(item.last_activity_at) / 1000).toISOString(),
      });
    }
    return threads;
  }
}
