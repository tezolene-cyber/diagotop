const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.diagotop.fr';
const DIST_DIR = path.join(__dirname, '..', 'dist');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk(DIST_DIR).filter(f => f.endsWith('.html'));
const urls = files.map(f => {
  let url = f.replace(DIST_DIR, '');
  url = url.replace(/\/index\.html$/, '');
  if (url === '') url = '';
  return `${SITE_URL}${url}`;
});

const uniqueUrls = [...new Set(urls)];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap généré avec ${uniqueUrls.length} URLs`);