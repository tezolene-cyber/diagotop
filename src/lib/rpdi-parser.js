import { parseHTML } from 'linkedom';

// Parser combiné Quotidiag + Infodiag (sélecteurs vérifiés)
export async function fetchActualites() {
  const sources = [
    {
      name: 'Quotidiag',
      url: 'https://www.quotidiag.fr/',
      containerSelector: 'div.post__text',
      titleSelector: 'h3.post__title a',
      dateSelector: 'time.published'
    },
    {
      name: 'Infodiag',
      url: 'https://infodiag.fr/',
      containerSelector: 'div.mh-posts-list-content',
      titleSelector: 'h3.entry-title.mh-posts-list-title a',
      dateSelector: 'span.entry-meta-date'
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
      const { document } = parseHTML(html);

      const containers = document.querySelectorAll(source.containerSelector);
      console.log(`${source.name}: ${containers.length} articles trouvés`);

      for (const container of containers) {
        if (allArticles.length >= 12) break;

        const titleEl = container.querySelector(source.titleSelector);
        if (!titleEl) continue;
        const titre = titleEl.textContent.trim();
        const url = titleEl.href;
        if (!titre || !url) continue;

        let date = '';
        const dateEl = container.querySelector(source.dateSelector);
        if (dateEl) {
          date = dateEl.textContent.trim();
          const matchDatePropre = date.match(/(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i);
          if (matchDatePropre) date = matchDatePropre[1];
        }

        allArticles.push({ titre, url, date, source: source.name });
      }
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