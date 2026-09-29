import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConfigLoader } from '../dist/config/ConfigLoader.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

test('configuration works without a legacy developer token', () => {
  const names = ['CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN', 'CUSTOMER_ID', 'DEVELOPER_TOKEN'];
  const original = new Map(names.map(name => [name, process.env[`GOOGLE_ADS_${name}`]]));
  try {
    process.env.GOOGLE_ADS_CLIENT_ID = 'test-client';
    process.env.GOOGLE_ADS_CLIENT_SECRET = 'test-secret';
    process.env.GOOGLE_ADS_REFRESH_TOKEN = 'test-refresh';
    process.env.GOOGLE_ADS_CUSTOMER_ID = '123-456-7890';
    delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const config = ConfigLoader.loadFromEnvironment();
    ConfigLoader.validate(config);
    assert.equal(config.customerId, '1234567890');
    assert.equal(config.developerToken, undefined);
    delete process.env.GOOGLE_ADS_REFRESH_TOKEN;
    assert.throws(() => ConfigLoader.loadFromEnvironment(), /Missing required/);
  } finally {
    for (const [name, value] of original) {
      if (value === undefined) delete process.env[`GOOGLE_ADS_${name}`];
      else process.env[`GOOGLE_ADS_${name}`] = value;
    }
  }
});

test('stdio initializes and lists keyword tools without a developer token', { timeout: 30000 }, async () => {
  const client = new Client({ name: 'cloud-auth-check', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL('../dist/index.js', import.meta.url))],
    env: {
      GOOGLE_ADS_CLIENT_ID: 'test-client',
      GOOGLE_ADS_CLIENT_SECRET: 'test-secret',
      GOOGLE_ADS_REFRESH_TOKEN: 'test-refresh',
      GOOGLE_ADS_CUSTOMER_ID: '1234567890',
      SKIP_CONNECTION_TEST: 'true',
    },
    stderr: 'pipe',
  });
  try {
    await client.connect(transport);
    assert.equal(client.getServerVersion().name, 'google-keyword-planner');
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), [
      'analyze_global_keyword_interest',
      'analyze_keywords_by_location',
      'get_detailed_keyword_plan',
    ]);
  } finally {
    await client.close();
  }
});
