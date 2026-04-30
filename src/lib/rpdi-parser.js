// Parser basé sur regex pour Quotidiag et Infodiag – version robuste
export async function fetchActualites() {
  const sources = [
    {
      name: 'Quotidiag',
      url: 'https://www.quotidiag.fr/',
      articleRegex: /<h3 class="post__title typescale-2"><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>\s*<div class="post__meta">[^<]*<time class="time published" datetime="[^"]*"[^>]*>([^<]+)<\/time>/gi
    },
    {
      name: 'Infodiag',
      url: 'https://infodiag.fr/',
      articleRegex: /<h3 class="entry-title mh-posts-list-title"><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>\s*<div class="mh-meta entry-meta">\s*<span class="entry-meta-date updated">[^<]*<i[^>]*><\/i><a[^>]*>([^<]+)<\/a><\/span>/gi
    }
  ];

  let allArticles = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Diagotop/1.0)' }
      });
      if (!response.ok) {
        console.error(`Erreur fetch ${source.name}: statut ${response.status}`);
        continue;
      }
      const html = await response.text();

      const matches = html.matchAll(source.articleRegex);
      let count = 0;
      for (const match of matches) {
        if (allArticles.length >= 12) break;
        const url = match[1].startsWith('http') ? match[1] : source.url + match[1];
        const titre = match[2]
          .replace(/&#8217;|&#039;|&rsquo;|&lsquo;/g, "'")
          .replace(/&amp;/g, '&')
          .trim();
        let date = match[3].trim();
        const datePropre = date.match(/(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i);
        if (datePropre) date = datePropre[1];

        allArticles.push({ titre, url, date, source: source.name });
        count++;
      }
      console.log(`${source.name}: ${count} articles extraits`);
    } catch (e) {
      console.error(`Erreur scraping ${source.name}:`, e.message);
    }
  }

  const unique = [];
  const urls = new Set();
  for (const art of allArticles) {
    if (!urls.has(art.url)) {
      urls.add(art.url);
      unique.push(art);
    }
  }
  unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  const result = unique.slice(0, 6);
  if (result.length === 0) {
    console.warn('Aucun article extrait, utilisation du fallback');
    return null;
  }
  return result;
}