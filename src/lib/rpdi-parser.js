// Parser RSS robuste par découpage de chaînes – avec extraction d'image + fallback
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

        // 🆕 Extraction de l'image (première balise <img> dans description ou content:encoded)
        let image = '';
        const imgMatch = itemContent.match(/<img[^>]+src="([^"]+)"/i);
        if (imgMatch) image = imgMatch[1];

        // ✅ Fallback : si pas d'image, on utilise le logo du site source
        if (!image) {
          if (source.name === 'Quotidiag') {
            image = 'https://www.quotidiag.fr/wp-content/uploads/2024/03/cropped-LOGO-QUOTIDIAG-couleurs-1-32x32.png';
          } else if (source.name === 'Infodiag') {
            image = 'https://infodiag.fr/wp-content/uploads/2021/10/cropped-Logo2-32x32.png';
          }
        }

        if (titre && url) {
          allArticles.push({ titre, url, date, source: source.name, image });
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

  // Logique : 3 max par source
  const maxPerSource = 3;
  const selected = [];
  const counts = {};

  for (const art of unique) {
    if (selected.length >= 6) break;
    const src = art.source;
    counts[src] = counts[src] || 0;
    if (counts[src] < maxPerSource) {
      selected.push(art);
      counts[src]++;
    }
  }

  if (selected.length < 6) {
    const remaining = unique.filter(a => !selected.includes(a));
    selected.push(...remaining.slice(0, 6 - selected.length));
  }

  if (selected.length === 0) {
    console.warn('Aucun article extrait, utilisation du fallback');
    return null;
  }
  return selected;
}