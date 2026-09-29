#!/usr/bin/env node
import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, writeFile, rename, unlink, lstat } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export function createAuthorization(clientId, redirectUri) {
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/adwords',
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
  }).toString();
  return { url: url.href, state, verifier };
}

export async function listenForCode({ timeoutMs = 300000 } = {}) {
  let expectedState;
  let settle;
  let fail;
  const code = new Promise((resolveCode, rejectCode) => {
    settle = resolveCode;
    fail = rejectCode;
  });
  // A timeout can occur while the caller is opening the browser.
  code.catch(() => {});
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET' || url.pathname !== '/oauth2callback') {
      res.writeHead(404).end('Not found');
      return;
    }
    if (!expectedState || url.searchParams.get('state') !== expectedState) {
      res.writeHead(400).end('Invalid OAuth state');
      return;
    }
    if (url.searchParams.has('error') || !url.searchParams.get('code')) {
      res.writeHead(400).end('Authorization did not complete.');
      fail(new Error('Authorization was declined or incomplete.'));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end('Authorization received. You can close this tab.');
    settle(url.searchParams.get('code'));
  });
  await new Promise((ready, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', ready);
  });
  const timer = setTimeout(() => fail(new Error('Authorization timed out. Retry the command.')), timeoutMs);
  return {
    redirectUri: `http://127.0.0.1:${server.address().port}/oauth2callback`,
    setState(state) { expectedState = state; },
    code,
    async close() {
      clearTimeout(timer);
      await new Promise(done => server.close(done));
    },
  };
}

export async function exchangeCode(credentials, code, redirectUri, verifier, fetchFn = fetch) {
  const response = await fetchFn('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(30000),
  });
  const tokens = await response.json();
  // Never put the token response, code or credentials into errors or logs.
  if (!response.ok || typeof tokens.refresh_token !== 'string' || !tokens.refresh_token) {
    throw new Error('Token exchange failed. Check your OAuth client and consent, then retry.');
  }
  return tokens.refresh_token;
}

export async function saveCredentials(output, credentials, refreshToken) {
  let existing = '';
  try {
    if ((await lstat(output)).isSymbolicLink()) throw new Error('Refusing a symbolic-link output file.');
    existing = await readFile(output, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const updates = {
    GOOGLE_ADS_CLIENT_ID: credentials.client_id,
    GOOGLE_ADS_CLIENT_SECRET: credentials.client_secret,
    GOOGLE_ADS_REFRESH_TOKEN: refreshToken,
  };
  const lines = existing.split(/\r?\n/).filter(line =>
    !Object.keys(updates).some(key => new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(line)));
  for (const [key, value] of Object.entries(updates)) {
    // OAuth values are single-line tokens. Double quotes protect dotenv punctuation.
    if (!value || /[\r\n"\\]/.test(value)) throw new Error('Invalid credential format.');
    lines.push(`${key}="${value}"`);
  }
  const temp = resolve(dirname(output), `.${basename(output)}.${randomBytes(8).toString('hex')}.tmp`);
  try {
    await writeFile(temp, lines.join('\n') + '\n', { mode: 0o600, flag: 'wx' });
    await rename(temp, output);
  } finally {
    await unlink(temp).catch(() => {});
  }
}

async function main() {
  const { values } = parseArgs({ options: {
    credentials: { type: 'string' }, output: { type: 'string', default: '.env' },
    help: { type: 'boolean' },
  }});
  if (values.help || !values.credentials) {
    console.log('Usage: npm run get-refresh-token -- --credentials /path/to/desktop-oauth.json --output /path/to/.env');
    console.log('Use your own Desktop OAuth client JSON. Tokens are saved to the output file, never printed.');
    if (!values.help) process.exitCode = 1;
    return;
  }
  const credentials = JSON.parse(await readFile(resolve(values.credentials), 'utf8')).installed;
  if (!credentials?.client_id || !credentials?.client_secret) {
    throw new Error('A Desktop OAuth client JSON is required. Use OAuth Playground for a Web client.');
  }
  const listener = await listenForCode();
  try {
    const authorization = createAuthorization(credentials.client_id, listener.redirectUri);
    listener.setState(authorization.state);
    console.log('Open this URL locally and approve access with your Google Ads user account:');
    // The public client ID and random state appear here; secret/token/code never do.
    console.log(authorization.url);
    const code = await listener.code;
    const refreshToken = await exchangeCode(credentials, code, listener.redirectUri, authorization.verifier);
    await saveCredentials(resolve(values.output), credentials, refreshToken);
    console.log('OAuth credentials saved privately. Set your customer IDs in that file.');
  } finally {
    await listener.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => {
    console.error('OAuth setup failed. Check the client file, consent and output path; see setup-auth.md.');
    process.exitCode = 1;
  });
}
