import { IgApiClient } from 'instagram-private-api';
import { readFile, writeFile, access, mkdir } from 'fs/promises';
import { constants } from 'fs';
import { dirname } from 'path';
import { config } from '../utils/config.js';

const SESSION_PATH = config.paths.sessionFile;

export async function sessionExists(): Promise<boolean> {
  try {
    await access(SESSION_PATH, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function saveSession(ig: IgApiClient): Promise<void> {
  try {
    const serialized = await ig.state.serialize();
    // Remove constants as they should always use library's version
    delete serialized.constants;

    // Ensure data directory exists
    await mkdir(dirname(SESSION_PATH), { recursive: true });
    await writeFile(SESSION_PATH, JSON.stringify(serialized, null, 2));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export async function loadSession(ig: IgApiClient): Promise<boolean> {
  try {
    const data = await readFile(SESSION_PATH, 'utf-8');
    const session = JSON.parse(data);
    await ig.state.deserialize(session);
    return true;
  } catch {
    return false;
  }
}

export function setupSessionPersistence(ig: IgApiClient): void {
  // Subscribe to request completion to auto-save session
  // This ensures session is saved after each successful request
  ig.request.end$.subscribe(async () => {
    await saveSession(ig);
  });
}
