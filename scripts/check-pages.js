/**
 * Проверяет, существуют ли страницы из списка URL (локально).
 * Выводит локальные ссылки и статус. Запуск: node scripts/check-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'http://127.0.0.1:8080';

const URLS = `
https://androidchity.ru/2023/12/08/fr-legends-mod-na-yaponskie-mashiny/
https://androidchity.ru/category/toka-boka/
https://androidchity.ru/category/2d/
https://androidchity.ru/2023/12/11/deltarune-na-android-vse-glavy-na-russkom/
https://androidchity.ru/2023/12/08/aha-world-2-11-0-mod-vse-otkryto/
https://androidchity.ru/2024/01/24/vk-toster-na-android-poslednyaya-versiya-2024/
https://androidchity.ru/
https://androidchity.ru/2024/01/24/toka-boka-1-80-vsyo-otkryto-poslednyaya-versiya-s-mebelyu-i-domami-2024/
https://androidchity.ru/2023/12/11/undertale-yellow-na-android-poslednyaya-versiya/
https://androidchity.ru/2023/12/09/daily-lives-of-my-countryside-na-android/
https://androidchity.ru/2024/01/18/russkiy-vodila-3-vzlom-mnogo-deneg/
https://androidchity.ru/2023/12/11/vzlom-fnaf-3-plus-na-android/
https://androidchity.ru/2024/01/25/vzlom-shadow-fight-2-mod-menu-na-android-poslednyaya-versiya-2024/
https://androidchity.ru/2023/12/09/yandeks-muzyka-vzlom-vse-otkryto-novaya-versiya-2023/
https://androidchity.ru/2023/12/10/toka-boka-1-79-1-vzlom-vse-otkryto/
https://androidchity.ru/category/onlayn/page/2/
https://androidchity.ru/2023/12/09/skachat-chity-na-beta-test-metro-royal
https://androidchity.ru/2023/12/11/chity-na-special-forces-group-2-v4-21-mod-menyu
https://androidchity.ru/2024/01/30/mta-provintsiya-skachat-na-telefon-besplatno
https://androidchity.ru/2023/12/07/five-nights-in-anime-3d-skachat-na-android
https://androidchity.ru/2023/12/07/nba-2k14-mod-kuroko
https://androidchity.ru/2023/12/08/fr-legends-mod-na-yaponskie-mashiny
https://androidchity.ru/2023/12/10/hdrezka-apk-skachat-na-android-vzlom
https://androidchity.ru/2024/01/24/ya-koplyu-skachat-na-android-kak-na-ayfon
https://androidchity.ru/2023/12/11/sven-bomwollen-skachat-na-android
https://androidchity.ru/2024/12/21/hello-neighbor-mod-kit-skachat-na-android-poslednyaya-versiya
https://androidchity.ru/2023/12/11/sims-fripley-55-uroven-mnogo-deneg
https://androidchity.ru/2023/12/11/chity-na-blockpost-mobile-1-36-f1-poslednyaya-versiya
https://androidchity.ru/2023/12/09/gta-4-s-keshem-na-android
https://androidchity.ru/2024/01/30/desktop-goose-na-telefon-skachat-na-ekran-blokirovki-ekrana
https://androidchity.ru/2023/12/10/omori-na-android
https://androidchity.ru/2023/12/10/fnaf-2-open-source
https://androidchity.ru/2023/12/11/sharp-shooter-3d-na-android
https://androidchity.ru/2024/01/25/vzlom-gta-vice-city-stories-android-poslednyaya-versiya-2024
https://androidchity.ru/2023/12/09/boyfriend-to-death-2-na-android
https://androidchity.ru/2024/01/24/vzlom-gorebox-mod-menu-15-0-4-na-android-2024
https://androidchity.ru/2023/12/09/novyy-chit-klub-romantiki-1-0-17210-ipa-na-ios
https://androidchity.ru/2023/12/09/simulyator-prezidenta-2-vzlom
https://androidchity.ru/2023/12/10/chity-na-grand-criminal-online-bandy
https://androidchity.ru/2023/12/11/metel-mod-menyu-kiber-haker-novaya-versiya
https://androidchity.ru/2023/12/08/solohaplay-mega-mod-na-shadow-fight-2
https://androidchity.ru/2023/12/11/minecraft-error-422-na-android
https://androidchity.ru/2023/12/09/chity-na-dengi-i-mod-menyu-dlya-black-russia-13-0-6-na-android
https://androidchity.ru/2023/12/07/fnaf-plyus-na-android
https://androidchity.ru/2024/01/26/moy-zarabotok-prilozhenie-skachat-poslednyuyu-versiyu-2024
https://androidchity.ru/2024/01/24/vk-toster-na-android-poslednyaya-versiya-2024
https://androidchity.ru/2023/12/11/deltarune-na-android-vse-glavy-na-russkom
https://androidchity.ru/2023/12/11/zuzu-skachat-igru
https://androidchity.ru/2024/01/30/vzlom-hollywood-story-mod-mnogo-deneg-i-almazov-poslednyaya-versiya-2024
https://androidchity.ru/2023/12/09/skachat-chity-na-privatku-v2-9-3-mod-menyu
https://androidchity.ru/2023/12/07/fnaf-jr-na-android
https://androidchity.ru/2024/08/21/alvein-18-na-android
https://androidchity.ru/2024/01/22/school-game-na-android
https://androidchity.ru/2024/12/21/pyat-nochey-s-cheburashkoy-skachat-na-android-besplatno-na-russkom-yazyke
https://androidchity.ru/2024/01/26/vorld-boks-mod-vsyo-otkryto-poslednyaya-versiya-2024
https://androidchity.ru/2024/01/26/gacha-layf-mod-na-odezhdu-i-glaza
https://androidchity.ru/2024/01/25/vzlom-shadow-fight-2-mod-menu-na-android-poslednyaya-versiya-2024
https://androidchity.ru/2024/01/25/vzlom-micro-trolleybus-simulator-na-android-poslednyaya-versiya-2024
https://androidchity.ru/2024/12/23/the-demons-steele-the-dog-princess-skachat-na-android-na-russkom
https://androidchity.ru/2024/12/21/a-house-in-the-rift-0-7-11-beta-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/21/skachat-vzlom-what-a-legend-0-7-na-android-besplatno-poslednyaya-versiya-bez-tsenzury-na-russkom
https://androidchity.ru/2023/12/10/fnaf-ultimate-edition-na-android-poslednyaya-versiya
https://androidchity.ru/2023/12/09/yandeks-muzyka-vzlom-vse-otkryto-novaya-versiya-2023
https://androidchity.ru/2023/12/11/carrion-na-android
https://androidchity.ru/category/dlya-vzroslyh
https://androidchity.ru/2023/12/09/modern-ops-vzlom-na-dengi-i-zoloto
https://androidchity.ru/2023/12/09/yaoilib-skachat-na-android
https://androidchity.ru/2023/12/09/skinchendzher-na-standoff-2-0-25-1-by-acord-changer-2-1
https://androidchity.ru/2023/12/08/skachat-vzlom-wildcraft-mnogo-deneg-i-kristallov
https://androidchity.ru/2024/01/25/vzlom-high-school-simulator-2018-s-oruzhiem-skachat-staraya-versiya
https://androidchity.ru/2023/12/09/fnaf-in-real-time-na-android
https://androidchity.ru/2024/01/25/gacha-kul-mod-vse-otkryto-na-android-poslednyaya-versiya
https://androidchity.ru/2024/01/18/russkiy-vodila-3-vzlom-mnogo-deneg
https://androidchity.ru/2024/02/01/wobbledogs-skachat-na-android-besplatno
https://androidchity.ru/2024/01/22/gta-6-na-android-polnaya-versiya
https://androidchity.ru/category/anime
https://androidchity.ru/category/s-otkrytym-mirom
https://androidchity.ru/2023/12/11/bhop-pro-2-3-3-mod-menu-by-laryhacker
https://androidchity.ru/2024/08/21/erahunter-18-na-android-bez-tsenzury
https://androidchity.ru/2024/12/25/skachat-the-survivalist-na-android-na-russkom
https://androidchity.ru/2024/12/21/gold-russia-crmp-mobile-skachat-na-android-poslednyaya-versiya
https://androidchity.ru/2024/01/23/chity-na-chiken-gan-3-8-01-mod-menyu-by-bomb-hacker-v3
https://androidchity.ru/2024/12/21/slave-lord-elven-conquest-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2023/12/08/chity-na-pubg-mobile-2-9-0-novaya-versiya-na-android
https://androidchity.ru/2023/12/09/chit-ot-leontap-na-standoff-2-0-26-1-na-android
https://androidchity.ru/2023/12/09/privatka-standleo-2-1-na-ios-na-standoff-2
https://androidchity.ru/2024/12/23/gacha-diamond-skachat-besplatno-na-android-mod
https://androidchity.ru/2024/01/25/getkontakt-vzlom-premium
https://androidchity.ru/2024/02/01/vzlom-shadow-fight-4-mod-mnogo-deneg-i-kristallov-poslednyaya-versiya
https://androidchity.ru/2023/12/12/fnia-3-na-android-poslednyaya-versiya
https://androidchity.ru/2024/12/21/skachat-vzlom-klee-prank-adventure-na-android-besplatno-poslednyaya-versiya-bez-tsenzury-na-russkom
https://androidchity.ru/2023/12/10/noch-v-zapretnom-lesu-1-3-0-vzlom-na-almazy-poslednyaya-versiya
https://androidchity.ru/2023/12/11/vzlom-my-singing-monsters-the-lost-landscape-na-android
https://androidchity.ru/2024/12/23/nmps-diag-skachat-besplatno-na-android-na-russkom-yazyke
https://androidchity.ru/2023/12/10/faberlic-3-0-skachat-na-android
https://androidchity.ru/2024/12/21/skachat-vzlom-harem-hotel-na-android-besplatno-poslednyaya-versiya-bez-tsenzury-na-russkom
https://androidchity.ru/2023/12/11/undertale-yellow-na-android-poslednyaya-versiya
https://androidchity.ru/2024/01/14/truck-simulator-ultimate-mnogo-deneg
https://androidchity.ru/2023/12/07/agent-lis-spy-fox-in-dry-cereal-na-android
https://androidchity.ru/download
https://androidchity.ru/2024/01/30/ride-master-vzlom-mnogo-deneg-poslednyaya-versiya-2024
https://androidchity.ru/2024/01/26/standknife-simulator-hotwinter-posledyaya-versiya-2024
https://androidchity.ru/2024/02/01/poppi-pleytaym-3-skachat-na-android
https://androidchity.ru/2024/02/01/red-ball-4-beskonechnye-zhizni-skachat-besplatno
https://androidchity.ru/2024/01/25/simple-brawl-poslednyaya-versiya-53-176
https://androidchity.ru/2024/01/24/vzlom-slovo-patsana-na-android-mod-menyu-2024
https://androidchity.ru/2024/01/24/toka-boka-1-80-vsyo-otkryto-poslednyaya-versiya-s-mebelyu-i-domami-2024
https://androidchity.ru/2024/08/21/night-shift-at-fazklariez-18-na-android-poslednyaya-versiya-bez-tsenzury
https://androidchity.ru/2024/08/22/kisaki-blue-archive-18-na-android-poslednyaya-versiya
https://androidchity.ru/2024/08/22/once-a-porn-a-time-18-na-android-poslednyaya-versiya
https://androidchity.ru/2024/01/24/purrfect-tale-mod-mnogo-deneg-poslednyaya-versiya-2-11-0
https://androidchity.ru/2024/12/21/black-souls-2-chity-na-dushi-na-android-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/01/23/weapon-master-strelyalki-vzlom-mnogo-deneg
https://androidchity.ru/2024/12/21/halloween-harem-1-1-0-na-android-18-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/01/22/overcooked-2-na-android
https://androidchity.ru/2024/12/21/noxian-nights-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/21/npc-tales-the-shopkeeper-0-30-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/21/paradise-overlap-0-6-4-1-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/21/punishment-for-malty-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/01/20/purrfect-tale-vzlom-na-android
https://androidchity.ru/2024/12/21/skachat-gacha-tunnel-na-android-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/21/skachat-game-keyboard-pro-apply-cheats-na-android-poslednyaya-versiya-vse-otkryto
https://androidchity.ru/2024/12/21/skachat-granny-revamp-na-android-poslednyaya-versiya
https://androidchity.ru/2024/12/21/skachat-grenni-2-mod-menyu-kiber-haker-na-android
https://androidchity.ru/2024/12/21/skachat-morozhenschik-8-mod-menyu-ot-kiber-hakera
https://androidchity.ru/2024/12/21/skachat-vzlom-adventurer-trainer-na-android-besplatno-poslednyaya-versiya-bez-tsenzury-na-russkom
https://androidchity.ru/2024/12/21/skachat-vzlom-alvein-99e-na-android-besplatno-na-russkom
https://androidchity.ru/2023/12/11/vzlom-clothoff-io-na-beskonechnye-koiny-na-android
https://androidchity.ru/2023/12/11/shadow-fight-2-2-30-0-mod
https://androidchity.ru/2024/12/21/skachat-vzlom-luna-in-the-tavern-na-android-besplatno-poslednyaya-versiya-bez-tsenzury-na-russkom
https://androidchity.ru/2024/12/21/skachat-vzlom-snow-daze-the-music-of-winter-na-android-besplatno-poslednyaya-versiya-bez-tsenzury-na-russkom
https://androidchity.ru/2023/12/11/chiken-gan-privatnyy-server-1-4-9-novaya-versiya
https://androidchity.ru/2023/12/10/the-price-of-flesh-na-android
https://androidchity.ru/2024/12/21/standfixed-skachat-privatku-poslednyaya-versiya
https://androidchity.ru/2024/12/21/tamas-awakening-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya
https://androidchity.ru/2024/12/21/total-nc-cameo-collector-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2023/12/09/oguzok-horror-vzlom-na-android
https://androidchity.ru/2024/12/23/guilty-pleasure-0-40-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/23/luntik-h-proklyatyy-omlet-skachat-na-android-besplatno-polnuyu-versiyu-4-4-11
https://androidchity.ru/2023/12/09/chity-na-standknife-simulator-2023
https://androidchity.ru/2024/12/23/ravens-quest-1-4-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/23/rogue-like-evolution-1-53c-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2023/12/09/chity-na-kuboom-3d
https://androidchity.ru/2024/12/23/the-kid-at-the-back-5-0-18-na-android-bez-tsenzury-besplatno-poslednyaya-versiya-na-russkom
https://androidchity.ru/2024/12/25/claire-s-quest-gold-0-27-3-18-na-android-bez-tsenzury-poslednyaya-versiya
https://androidchity.ru/2024/12/25/point-rp-skachat-na-android-na-telefon-besplatno-poslednyaya-versiya
https://androidchity.ru/2023/12/09/cherepashki-nindzya-brachnyy-sezon-na-android
https://androidchity.ru/2023/12/08/aha-world-2-11-0-mod-vse-otkryto
https://androidchity.ru/2023/12/07/privatka-standoff-2-so-vsemi-skinami-i-nozhami
https://androidchity.ru/2024/01/24/vzlom-slovo-chushpana-na-android-mod-menyu-2024
https://androidchity.ru/2024/01/26/vzlom-modnoe-tamagochi-toka-boka-skachat-besplatno-poslednyaya-versiya-2024
`.trim().split('\n').map(s => s.trim()).filter(Boolean);

function pathExists(relPath) {
  const safe = relPath.replace(/^\/+/, '').replace(/\/+$/, '') || 'index.html';
  const filePath = path.resolve(ROOT, safe.split('/').join(path.sep));
  if (!filePath.startsWith(ROOT)) return false;
  try {
    const st = fs.statSync(filePath);
    if (st.isFile()) return true;
    if (st.isDirectory()) {
      const idx = path.join(filePath, 'index.html');
      return fs.existsSync(idx);
    }
  } catch (e) {}
  if (safe.startsWith('category/') && safe.includes('/page/')) {
    const [cat, name, , num] = safe.split('/');
    if (cat === 'category' && name && num) {
      const fallback = path.resolve(ROOT, 'category', name, 'index.html');
      return fs.existsSync(fallback);
    }
  }
  return false;
}

function urlToPath(url) {
  const u = url.replace(/^https?:\/\/[^/]+/i, '').trim();
  return u === '' ? '/' : u.startsWith('/') ? u : '/' + u;
}

const seen = new Set();
const results = [];

for (const url of URLS) {
  const pathPart = urlToPath(url);
  const key = pathPart.replace(/\/+$/, '') || '/';
  if (seen.has(key)) continue;
  seen.add(key);
  const relPath = key === '/' ? 'index.html' : key.replace(/^\/+/, '');
  const ok = pathExists(relPath);
  const local = BASE + (key === '/' ? '/' : pathPart.endsWith('/') ? pathPart : pathPart + '/');
  results.push({ url: pathPart, local, ok });
}

const okCount = results.filter(r => r.ok).length;
const failCount = results.filter(r => !r.ok).length;

console.log('Проверка страниц (локально). База:', BASE);
console.log('Всего уникальных URL:', results.length);
console.log('OK:', okCount, '| Нет файла:', failCount);
console.log('');

console.log('--- Локальные ссылки (работают) ---');
results.filter(r => r.ok).forEach(r => console.log(r.local));
console.log('');
console.log('--- Не найдены ---');
results.filter(r => !r.ok).forEach(r => console.log(r.local, '| путь:', r.url));
process.exit(failCount > 0 ? 1 : 0);
