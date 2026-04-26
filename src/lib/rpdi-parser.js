// Parse la page d'accueil de RPDI.fr pour extraire les 6 derniers articles
export async function fetchActualites() {
    try {
      const response = await fetch('https://www.rpdi.fr/');
      if (!response.ok) throw new Error(`Statut ${response.status}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
  
      // Cherche tous les liens contenant "/article/"
      const articleLinks = doc.querySelectorAll('a[href*="/article/"]');
      const articles = [];
  
      for (const link of articleLinks) {
        if (articles.length >= 6) break;
  
        const titre = link.textContent.trim();
        const url = new URL(link.href, 'https://www.rpdi.fr').href;
  
        // Essayer de récupérer la date
        let date = '';
        const parent = link.closest('div, article, li');
        if (parent) {
          const dateEl = parent.querySelector('time, .date, .post-date');
          if (dateEl) date = dateEl.textContent.trim();
          if (!date) {
            const text = parent.textContent;
            const match = text.match(/(\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i);
            if (match) date = match[1];
          }
        }
  
        // Source selon le domaine
        let source = 'RPDI';
        if (url.includes('quotidiag.fr')) source = 'Quotidiag';
        else if (url.includes('infodiag.fr')) source = 'Infodiag';
  
        articles.push({ titre, url, date, source });
      }
  
      if (articles.length === 0) throw new Error('Aucun article extrait');
      return articles;
    } catch (error) {
      console.error('Erreur parsing RPDI:', error);
      return null; // déclenchera le fallback
    }
  }