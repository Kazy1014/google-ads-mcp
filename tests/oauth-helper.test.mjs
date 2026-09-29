import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, readFile, stat, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createAuthorization, listenForCode, exchangeCode, saveCredentials } from '../scripts/get-refresh-token.mjs';

test('loopback callback rejects incorrect state and accepts the matching code', async () => {
  const listener = await listenForCode({ timeoutMs: 5000 });
  try {
    const auth = createAuthorization('fixture-client', listener.redirectUri);
    listener.setState(auth.state);
    const url = new URL(auth.url);
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(url.searchParams.get('code_challenge'), createHash('sha256').update(auth.verifier).digest('base64url'));
    assert.equal(url.searchParams.get('access_type'), 'offline');
    assert.equal((await fetch(listener.redirectUri + '?state=wrong&code=ignored')).status, 400);
    assert.equal((await fetch(listener.redirectUri + `?state=${auth.state}&code=fixture-code`)).status, 200);
    assert.equal(await listener.code, 'fixture-code');
  } finally { await listener.close(); }
});

test('callback timeout and denied consent settle without exposing OAuth input', async () => {
  const timeout = await listenForCode({ timeoutMs: 20 });
  try { await assert.rejects(timeout.code, /timed out/); }
  finally { await timeout.close(); }
  const denied = await listenForCode();
  try {
    denied.setState('fixture-state');
    await fetch(denied.redirectUri + '?state=fixture-state&error=access_denied');
    await assert.rejects(denied.code, /declined or incomplete/);
  } finally { await denied.close(); }
});

test('exchange supplies PKCE and never reflects an error response with secrets', async () => {
  const credentials = { client_id: 'fixture-client', client_secret: 'fixture-secret' };
  const token = await exchangeCode(credentials, 'fixture-code', 'http://127.0.0.1/callback', 'fixture-verifier', async (url, init) => {
    assert.equal(url, 'https://oauth2.googleapis.com/token');
    assert.equal(init.body.get('code_verifier'), 'fixture-verifier');
    assert.equal(init.body.get('client_secret'), credentials.client_secret);
    return { ok: true, json: async () => ({ refresh_token: 'fixture-refresh' }) };
  });
  assert.equal(token, 'fixture-refresh');
  await assert.rejects(exchangeCode(credentials, 'fixture-code', 'redirect', 'verifier', async () => ({
    ok: false, json: async () => ({ error_description: 'fixture-secret fixture-code', access_token: 'fixture-access' }),
  })), error => !/fixture-secret|fixture-code|fixture-access/.test(error.message));
});

test('credential file updates preserve customer settings and refuse symbolic links', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'oauth-fixture-'));
  try {
    const output = join(directory, '.env');
    await writeFile(output, 'GOOGLE_ADS_CUSTOMER_ID=1234567890\nGOOGLE_ADS_REFRESH_TOKEN=old-fixture\n');
    await saveCredentials(output, { client_id: 'fixture-client', client_secret: 'fixture-secret' }, 'fixture-refresh');
    const contents = await readFile(output, 'utf8');
    assert.match(contents, /GOOGLE_ADS_CUSTOMER_ID=1234567890/);
    assert.match(contents, /GOOGLE_ADS_REFRESH_TOKEN="fixture-refresh"/);
    assert.doesNotMatch(contents, /old-fixture/);
    if (process.platform !== 'win32') {
      assert.equal((await stat(output)).mode & 0o777, 0o600);
      const linked = join(directory, 'linked.env');
      await symlink(output, linked);
      await assert.rejects(saveCredentials(linked, { client_id: 'fixture-client', client_secret: 'fixture-secret' }, 'fixture-refresh'), /symbolic-link/);
    }
    await assert.rejects(saveCredentials(output, { client_id: 'fixture-client', client_secret: 'bad\nvalue' }, 'fixture-refresh'), /format/);
    assert.equal(await readFile(output, 'utf8'), contents);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
