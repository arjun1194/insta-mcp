import { IgApiClient, IgLoginRequiredError } from 'instagram-private-api';
import { loadSession, saveSession, sessionExists, setupSessionPersistence } from './session.js';
import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { config } from '../utils/config.js';

interface Credentials {
  username: string;
  password: string;
}

async function getCredentials(): Promise<Credentials> {
  // Priority 1: Environment Variables
  if (config.instagram.username && config.instagram.password) {
    return {
      username: config.instagram.username,
      password: config.instagram.password,
    };
  }

  // Priority 2: Credentials File
  const CREDENTIALS_PATH = config.paths.credentialsFile;
  try {
    await access(CREDENTIALS_PATH, constants.F_OK);
    const data = await readFile(CREDENTIALS_PATH, 'utf-8');
    const credentials = JSON.parse(data) as Credentials;

    if (
      credentials.username &&
      credentials.password &&
      credentials.username !== 'YOUR_INSTAGRAM_USERNAME'
    ) {
      return credentials;
    }
  } catch {
    // File not found or invalid, continue to error
  }

  throw new Error(
    'Instagram credentials not found. Please set INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD ' +
      `environment variables, or provide a valid credentials file at ${CREDENTIALS_PATH}.`
  );
}

export async function authenticateClient(ig: IgApiClient): Promise<void> {
  const credentials = await getCredentials();

  // Generate device ID (deterministic based on username for consistency)
  ig.state.generateDevice(credentials.username);

  // Try to restore existing session first
  if (await sessionExists()) {
    const restored = await loadSession(ig);
    if (restored) {
      try {
        // Verify session is still valid by making a test request
        await ig.account.currentUser();
        setupSessionPersistence(ig);
        console.error('Session restored successfully');
        return;
      } catch (error) {
        if (error instanceof IgLoginRequiredError) {
          console.error('Session expired, performing fresh login...');
        } else {
          console.error('Session validation failed:', error);
        }
      }
    }
  }

  // Perform fresh login
  console.error('Performing fresh login...');

  try {
    // Simulate pre-login behavior to avoid detection
    await ig.simulate.preLoginFlow();

    // Login
    const loggedInUser = await ig.account.login(credentials.username, credentials.password);
    console.error(`Logged in as: ${loggedInUser.username}`);

    // Simulate post-login behavior
    process.nextTick(async () => {
      try {
        await ig.simulate.postLoginFlow();
      } catch (error) {
        // Post-login flow errors are not critical
        console.error('Post-login simulation warning:', error);
      }
    });

    // Save session and setup auto-persistence
    await saveSession(ig);
    setupSessionPersistence(ig);
  } catch (error: any) {
    if (error.name === 'IgCheckpointError') {
      console.error('CRITICAL: Instagram requested a checkpoint (Security Verification).');
      console.error('Please log into the Instagram app on your phone, click "This Was Me",');
      console.error('and then restart this MCP server.');
    } else if (error.name === 'IgLoginTwoFactorRequiredError') {
      console.error('CRITICAL: Two-Factor Authentication is enabled on this account.');
      console.error('The current server version requires 2FA to be temporarily disabled or');
      console.error('implementation of a 2FA challenge tool.');
    }
    throw error;
  }
}
