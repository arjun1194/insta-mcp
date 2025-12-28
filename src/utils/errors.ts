import {
  IgApiClient,
  IgCheckpointError,
  IgLoginRequiredError,
  IgLoginTwoFactorRequiredError,
  IgResponseError,
  IgNetworkError,
  IgSentryBlockError,
  IgActionSpamError,
} from 'instagram-private-api';

export class InstagramError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'InstagramError';
  }
}

export function handleInstagramError(error: unknown, ig: IgApiClient): never {
  if (error instanceof IgCheckpointError) {
    const checkpoint = ig.state.checkpoint as unknown as Record<string, unknown> | undefined;
    const challengeUrl = checkpoint?.url || 'unknown';
    throw new InstagramError(
      `Instagram security challenge required. Please complete verification at: ${challengeUrl}`,
      'CHECKPOINT_REQUIRED',
      false
    );
  }

  if (error instanceof IgLoginRequiredError) {
    throw new InstagramError(
      'Session expired. Please restart the server to re-authenticate.',
      'LOGIN_REQUIRED',
      true
    );
  }

  if (error instanceof IgLoginTwoFactorRequiredError) {
    throw new InstagramError(
      'Two-factor authentication required. This server does not support 2FA. Please disable 2FA on your account or use an app password.',
      'TWO_FACTOR_REQUIRED',
      false
    );
  }

  if (error instanceof IgSentryBlockError) {
    throw new InstagramError(
      'Account temporarily blocked by Instagram due to suspicious activity. Please wait a few hours before retrying.',
      'SENTRY_BLOCK',
      true
    );
  }

  if (error instanceof IgActionSpamError) {
    throw new InstagramError(
      'Action blocked by Instagram spam filter. Please wait before making more requests.',
      'ACTION_SPAM',
      true
    );
  }

  if (error instanceof IgNetworkError) {
    throw new InstagramError(
      'Network error connecting to Instagram. Please check your internet connection.',
      'NETWORK_ERROR',
      true
    );
  }

  if (error instanceof IgResponseError) {
    const response = error.response;
    const statusCode = response?.statusCode;

    if (statusCode === 429) {
      throw new InstagramError(
        'Rate limited by Instagram. Please wait before making more requests.',
        'RATE_LIMITED',
        true
      );
    }

    if (statusCode === 400) {
      throw new InstagramError(`Bad request: ${error.message}`, 'BAD_REQUEST', false);
    }

    if (statusCode === 404) {
      throw new InstagramError(
        'Resource not found. The user or post may not exist.',
        'NOT_FOUND',
        false
      );
    }
  }

  // Unknown error - wrap it
  const message = error instanceof Error ? error.message : 'Unknown error';
  throw new InstagramError(`Instagram API error: ${message}`, 'UNKNOWN_ERROR', false);
}

export function formatErrorForMcp(error: unknown): string {
  if (error instanceof InstagramError) {
    return `[${error.code}] ${error.message}${error.retryable ? ' (retryable)' : ''}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}
