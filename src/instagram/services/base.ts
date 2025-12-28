import { IgApiClient } from 'instagram-private-api';
import { RateLimiter } from '../../utils/rate-limit.js';
import { handleInstagramError } from '../../utils/errors.js';

export class BaseService {
  protected currentUserId: string | null = null;

  constructor(
    protected ig: IgApiClient,
    protected rateLimiter: RateLimiter
  ) {}

  protected async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    await this.rateLimiter.throttle();
    try {
      return await operation();
    } catch (error) {
      handleInstagramError(error, this.ig);
    }
  }

  public async getCurrentUserId(): Promise<string> {
    if (this.currentUserId) {
      return this.currentUserId;
    }
    const user = await this.withRateLimit(() => this.ig.account.currentUser());
    this.currentUserId = user.pk.toString();
    return this.currentUserId;
  }

  public async resolveUserId(username?: string): Promise<string> {
    if (!username) {
      return this.getCurrentUserId();
    }
    const user = await this.withRateLimit(() => this.ig.user.searchExact(username));
    return user.pk.toString();
  }
}
