#!/usr/bin/env node
/**
 * Google Ads API Refresh Token取得ヘルパー
 * 
 * このスクリプトは、Google Ads APIのRefresh Tokenを取得するためのものです。
 */

import * as readline from 'readline';
import * as https from 'https';

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

function httpsPost(hostname: string, path: string, postData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('='.repeat(70));
  console.log('Google Ads API - Refresh Token取得ヘルパー');
  console.log('='.repeat(70));
  console.log();

  // Step 1: Get Client ID and Secret
  console.log('📝 ステップ1: OAuth2認証情報を入力してください');
  console.log();
  
  const clientId = await question('Client ID: ');
  const clientSecret = await question('Client Secret: ');
  
  console.log();
  console.log('-'.repeat(70));
  console.log('📋 ステップ2: 以下のURLをブラウザで開いてください');
  console.log('-'.repeat(70));
  console.log();
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/adwords&access_type=offline&prompt=consent`;
  
  console.log(authUrl);
  console.log();
  console.log('👆 このURLをコピーしてブラウザで開き、Googleアカウントでログインしてください');
  console.log('   承認後、表示される認証コードをコピーしてください');
  console.log();
  
  // Step 2: Get authorization code
  const authCode = await question('認証コード: ');
  
  console.log();
  console.log('⏳ トークンを取得中...');
  console.log();
  
  // Step 3: Exchange code for tokens
  try {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: authCode,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      grant_type: 'authorization_code'
    }).toString();

    const responseData = await httpsPost('oauth2.googleapis.com', '/token', postData);
    const tokenResponse: TokenResponse = JSON.parse(responseData);

    if (tokenResponse.error) {
      console.error('❌ エラーが発生しました:');
      console.error(`   ${tokenResponse.error}: ${tokenResponse.error_description}`);
      console.log();
      console.log('💡 よくあるエラー:');
      console.log('   - "invalid_grant": 認証コードが無効または期限切れです。最初からやり直してください。');
      console.log('   - "invalid_client": Client IDまたはClient Secretが間違っています。');
      process.exit(1);
    }

    if (tokenResponse.refresh_token) {
      console.log('✅ 成功！Refresh Tokenを取得しました');
      console.log();
      console.log('='.repeat(70));
      console.log('📋 以下の値を .env ファイルまたはClaude設定に追加してください');
      console.log('='.repeat(70));
      console.log();
      console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokenResponse.refresh_token}`);
      console.log();
      console.log('💾 この値を安全に保管してください。再取得には同じ手順が必要です。');
      console.log();
    } else {
      console.error('❌ Refresh Tokenが取得できませんでした');
      console.error('   レスポンス:', JSON.stringify(tokenResponse, null, 2));
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error('予期しないエラー:', error);
  rl.close();
  process.exit(1);
});

