/**
 * Inject Google and Yandex verification meta tags into all HTML files
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const META_GOOGLE = '<meta name="google-site-verification" content="byPs6xMDU8w7CMabtGrLxGjuNQ-zXEoG6K8kOgYKRTs" />';
const META_YANDEX = '<meta name="yandex-verification" content="246bbb804e5c0d30" />';
const META_BLOCK = META_GOOGLE + '\n  ' + META_YANDEX;

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'terminals'].includes(file)) {
        walkDir(filepath, callback);
      }
    } else if (file.endsWith('.html')) {
      callback(filepath);
    }
  }
}

let processed = 0;

walkDir(ROOT, (filepath) => {
  processed++;
  let content = fs.readFileSync(filepath, 'utf8');

  // Remove existing verification meta tags
  content = content.replace(/<meta\s+name="google-site-verification"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  content = content.replace(/<meta\s+name="yandex-verification"\s+content="[^"]*"\s*\/?>\s*/gi, '');

  // Insert after <head> if not already present
  if (!content.includes('google-site-verification')) {
    content = content.replace(
      /(<head[^>]*>)/i,
      '$1\n  ' + META_BLOCK
    );
  }

  fs.writeFileSync(filepath, content, 'utf8');
});

console.log(`Processed: ${processed} HTML files`);
