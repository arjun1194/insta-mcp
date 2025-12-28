import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for data (defaults to project root / data)
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_DIR = process.env.INSTA_DATA_DIR || DEFAULT_DATA_DIR;

export const config = {
  instagram: {
    username: process.env.INSTAGRAM_USERNAME,
    password: process.env.INSTAGRAM_PASSWORD,
  },
  paths: {
    dataDir: DATA_DIR,
    sessionFile: path.join(DATA_DIR, 'session.json'),
    credentialsFile: path.join(DATA_DIR, 'credentials.json'),
  },
  server: {
    name: 'insta-mcp',
    version: '1.0.0',
  },
};

export function validateConfig() {
  const missing: string[] = [];

  // Only require env vars if credentials file doesn't exist (we'll check that in auth)
  // But for a pluggable server, env vars are preferred.
  if (!config.instagram.username && !process.env.INSTAGRAM_USERNAME) {
    // We'll allow falling back to credentials.json for now to not break existing setups
  }

  return {
    isValid: true, // We'll do more specific checks in auth.ts
    missing,
  };
}
