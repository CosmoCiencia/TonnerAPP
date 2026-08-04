import { readFileSync } from 'node:fs';

function loadDotEnv() {
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!match) continue;
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // The script can also run with exported env vars only.
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Export it before running this script.`);
  }
  return value;
}

loadDotEnv();

const supabaseUrl = requireEnv('VITE_SUPABASE_URL').replace(/\/$/, '');
const secret = requireEnv('SYNC_CUP_SECRET');
const response = await fetch(`${supabaseUrl}/functions/v1/calculate-cup-points`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-tonner-sync-secret': secret,
  },
  body: '{}',
});

const body = await response.text();
if (!response.ok) {
  throw new Error(`calculate-cup-points HTTP ${response.status}: ${body}`);
}

console.log(body);
