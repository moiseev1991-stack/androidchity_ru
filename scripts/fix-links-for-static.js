/**
 * Заменяет https://androidchity.ru и http://androidchity.ru на относительные пути
 * для работы сайта как статики на любом домене.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts'];

function walk(dir, callback) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (EXCLUDE.some(e => full.includes(path.sep + e + path.sep) || full.endsWith(path.sep + e))) continue;
    if (item.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

const ext = ['.html', '.css', '.js'];
let total = 0;
walk(ROOT, (file) => {
  if (!ext.includes(path.extname(file))) return;
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  s = s.replace(/https:\/\/androidchity\.ru/g, '');
  s = s.replace(/http:\/\/androidchity\.ru/g, '');
  s = s.replace(/https:\\\/\\\/androidchity\.ru/g, '');
  s = s.replace(/http:\\\/\\\/androidchity\.ru/g, '');
  if (s !== orig) {
    fs.writeFileSync(file, s);
    total++;
    console.log(file.replace(ROOT + path.sep, ''));
  }
});
console.log('Done. Updated', total, 'files.');
