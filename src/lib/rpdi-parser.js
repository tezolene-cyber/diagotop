// Parser RSS robuste par découpage de chaînes
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

      // Découper le flux en segments <item>...</item>
      const itemBlocks = xml.split(/<item[^>]*>/i).slice(1);
      let count = 0;

      for (const block of itemBlocks) {
        if (allArticles.length >= 12) break;
        const itemContent = block.split('</item>')[0];

        // Extraction du titre (gère CDATA)
        const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
        const titre = titleMatch ? titleMatch[1].trim() : '';

        // Extraction du lien
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i);
        const url = linkMatch ? linkMatch[1].trim() : '';

        // Extraction de la date
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

  // Déduplication par URL
  const unique = [];
  const urls = new Set();
  for (const art of allArticles) {
    if (!urls.has(art.url)) {
      urls.add(art.url);
      unique.push(art);
    }
  }

  // Trier tous les articles par date décroissante
  unique.sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- Logique : 3 max par source, puis complément si < 6 articles ---
  const maxPerSourceFirstPass = 3;
  const selected = [];
  const counts = {};

  // Première passe : jusqu'à 3 par source
  const remaining = [];
  for (const art of unique) {
    const src = art.source;
    counts[src] = counts[src] || 0;
    if (counts[src] < maxPerSourceFirstPass) {
      selected.push(art);
      counts[src]++;
    } else {
      remaining.push(art);
    }
  }

  // Si on n'a pas 6 articles, on complète avec les restants
  if (selected.length < 6) {
    const needed = 6 - selected.length;
    selected.push(...remaining.slice(0, needed));
  }
  // ------------------------------------------------------------------------

  if (selected.length === 0) {
    console.warn('Aucun article extrait, utilisation du fallback');
    return null;
  }
  return selected;
}