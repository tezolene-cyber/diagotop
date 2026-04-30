// Parser RSS natif par regex – compatible Node 18
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
      const xml = await response.text();

      // Extraire chaque bloc <item>...</item>
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      const items = xml.matchAll(itemRegex);
      let count = 0;

      for (const itemMatch of items) {
        if (allArticles.length >= 12) break;
        const itemContent = itemMatch[1];

        // Extraire le titre
        const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
        const titre = titleMatch ? titleMatch[1].trim() : '';
        
        // Extraire le lien
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i);
        const url = linkMatch ? linkMatch[1].trim() : '';
        
        // Extraire la date de publication
        const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i);
        let date = '';
        if (pubDateMatch) {
          const rawDate = pubDateMatch[1].trim();
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
          }
        }

        if (titre && url) {
          allArticles.push({ titre, url, date, source: source.name });
          count++;
        }
      }
      console.log(`${source.name}: ${count} articles extraits`);
    } catch (e) {
      console.error(`Erreur scraping ${source.name}:`, e.message);
    }
  }

  // Déduplication et tri
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