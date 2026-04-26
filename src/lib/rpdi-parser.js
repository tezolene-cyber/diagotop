// Parser combiné Quotidiag + Infodiag (pages d'accueil)
export async function fetchActualites() {
    const sources = [
      {
        name: 'Quotidiag',
        url: 'https://www.quotidiag.fr/',
        articleSelector: 'article a, .post-title a, h2 a', // adaptez selon le vrai site
        dateSelector: 'time, .post-date',
        linkPrefix: 'https://www.quotidiag.fr'
      },
      {
        name: 'Infodiag',
        url: 'https://infodiag.fr/',
        articleSelector: 'article a, .entry-title a, h2 a',
        dateSelector: 'time, .post-date',
        linkPrefix: 'https://infodiag.fr'
      }
    ];
  
    let allArticles = [];
  
    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Diagotop/1.0)' }
        });
        if (!response.ok) continue;
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
  
        const links = doc.querySelectorAll(source.articleSelector);
        for (const link of links) {
          if (allArticles.length >= 12) break; // on prend 12 pour trier ensuite
  
          const titre = link.textContent.trim();
          let url = link.getAttribute('href');
          if (!url || !titre) continue;
          // rendre l'URL absolue
          if (url.startsWith('/')) url = source.linkPrefix + url;
          else if (!url.startsWith('http')) url = source.linkPrefix + '/' + url;
  
          // Chercher la date à proximité
          let date = '';
          const parent = link.closest('article, div, li');
          if (parent) {
            const dateEl = parent.querySelector(source.dateSelector);
            if (dateEl) date = dateEl.textContent.trim();
            if (!date) {
              const text = parent.textContent;
              const match = text.match(/(\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i);
              if (match) date = match[1];
            }
          }
  
          allArticles.push({ titre, url, date, source: source.name });
        }
      } catch (e) {
        console.error(`Erreur scraping ${source.name}:`, e.message);
      }
    }
  
    // Déduplication et tri par date (du plus récent au plus ancien)
    const unique = [];
    const urls = new Set();
    for (const art of allArticles) {
      if (!urls.has(art.url)) {
        urls.add(art.url);
        unique.push(art);
      }
    }
    unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    return unique.slice(0, 6);
  }