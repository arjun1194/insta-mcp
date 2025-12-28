import { BaseService } from './base.js';

export class StoryService extends BaseService {
  async getStories(): Promise<any[]> {
    const tray = this.ig.feed.reelsTray();
    return this.withRateLimit(() => tray.items());
  }

  async getUserStories(username: string): Promise<any[]> {
    const userId = await this.resolveUserId(username);
    const feed = this.ig.feed.userStory(userId);
    return this.withRateLimit(() => feed.items());
  }

  async getHighlights(username: string): Promise<any[]> {
    const userId = await this.resolveUserId(username);
    const highlights = await this.withRateLimit(() => this.ig.highlights.highlightsTray(userId));
    return highlights.tray;
  }
}
