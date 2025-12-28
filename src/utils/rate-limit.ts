interface RateLimitConfig {
  minDelayMs: number;
  maxDelayMs: number;
  requestsPerWindow: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  minDelayMs: 1000, // Minimum 1 second between requests
  maxDelayMs: 3000, // Random delay up to 3 seconds
  requestsPerWindow: 20, // Max 20 requests per window
  windowMs: 60000, // 1 minute window
};

export class RateLimiter {
  private requestTimestamps: number[] = [];
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async throttle(): Promise<void> {
    const now = Date.now();

    // Clean old timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter((ts) => now - ts < this.config.windowMs);

    // Check if we're at the limit for the window
    if (this.requestTimestamps.length >= this.config.requestsPerWindow) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = this.config.windowMs - (now - oldestRequest);
      if (waitTime > 0) {
        console.error(`Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
        await this.delay(waitTime);
      }
    }

    // Add random delay to appear more human-like
    const randomDelay =
      this.config.minDelayMs + Math.random() * (this.config.maxDelayMs - this.config.minDelayMs);
    await this.delay(randomDelay);

    // Record this request
    this.requestTimestamps.push(Date.now());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStatus(): { requestsInWindow: number; windowMs: number; limit: number } {
    const now = Date.now();
    const recentRequests = this.requestTimestamps.filter(
      (ts) => now - ts < this.config.windowMs
    ).length;

    return {
      requestsInWindow: recentRequests,
      windowMs: this.config.windowMs,
      limit: this.config.requestsPerWindow,
    };
  }
}
