import { parseXML } from 'linkedom';

export async function fetchActualites() {
  const sources = [
    {
      name: 'Quotidiag',
      url: 'https://www.quotidiag.fr/feed/'
    },
    {
      name: 'Infodiag',
      url: 'https://infodiag.fr/feed/'
    }
  ];

  let allArticles = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Diagotop/1.0)' }
      });
      if (!response.ok) {
        console.error(`Erreur fetch RSS ${source.name}: statut ${response.status}`);
        continue;
      }
      const xmlText = await response.text();
      const { document } = parseXML(xmlText);

      const items = document.querySelectorAll('item');
      let count = 0;
      for (const item of items) {
        if (allArticles.length >= 12) break;

        const titleEl = item.querySelector('title');
        const linkEl = item.querySelector('link');
        const pubDateEl = item.querySelector('pubDate');

        if (!titleEl || !linkEl) continue;

        const titre = titleEl.textContent.trim();
        const url = linkEl.textContent.trim();
        let date = '';
        if (pubDateEl) {
          const rawDate = pubDateEl.textContent.trim();
          // Convertir la date RFC 2822 en format français
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
          }
        }

        allArticles.push({ titre, url, date, source: source.name });
        count++;
      }
      console.log(`${source.name}: ${count} articles extraits`);
    } catch (e) {
      console.error(`Erreur scraping ${source.name}:`, e.message);
    }
  }

  // Déduplication par URL
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