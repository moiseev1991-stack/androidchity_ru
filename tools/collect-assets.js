/**
 * Скачивает отсутствующие ресурсы из wp-content в проект.
 * Использует inventory из tools/resources-inventory.json (запустите inventory-resources.js сначала).
 * Опционально: SOURCE_URL=https://androidchity.ru node tools/collect-assets.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const invPath = path.join(ROOT, 'tools', 'resources-inventory.json');
const SOURCE = process.env.SOURCE_URL || 'https://androidchity.ru';

let inv;
try {
  inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
} catch (e) {
  console.error('Run tools/inventory-resources.js first');
  process.exit(1);
}

const missing = inv.wpContent?.missing || [];
if (missing.length === 0) {
  console.log('No missing wp-content files.');
  process.exit(0);
}

const failed = [];
const ok = [];

function download(url) {
  return new Promise((resolve, reject) => {
    const u = url.startsWith('http') ? url : SOURCE.replace(/\/$/, '') + url;
    const client = u.startsWith('https') ? https : http;
    const req = client.get(u, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  const toFetch = missing.slice(0, 500);
  console.log('Fetching', toFetch.length, 'missing files...');
  for (const p of toFetch) {
    const localPath = path.join(ROOT, p.replace(/^\//, '').replace(/\//g, path.sep));
    const dir = path.dirname(localPath);
    try {
      const data = await download(p);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(localPath, data);
      ok.push(p);
    } catch (e) {
      failed.push({ path: p, err: e.message });
    }
  }
  console.log('OK:', ok.length, '| Failed:', failed.length);
  if (failed.length) {
    const logPath = path.join(ROOT, 'tools', 'collect-assets-failed.json');
    fs.writeFileSync(logPath, JSON.stringify(failed, null, 2));
    console.log('Failed log:', logPath);
  }
}

main().catch(console.error);
