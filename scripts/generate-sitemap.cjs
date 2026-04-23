const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.diagotop.fr';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function walk(dir) {
  // Le dossier public ne contient pas encore les pages, on ne peut pas lister les .html.
  // On va plutôt lister les fichiers générés après le build, mais on veut écrire dans public avant.
  // Donc on ne peut pas appliquer la même logique. On va générer les URLs manuellement
  // à partir de la liste des villes et des pages connues.
  const VILLES = [
    "paris-1","paris-2","paris-3","paris-4","paris-5","paris-6","paris-7","paris-8","paris-9","paris-10",
    "paris-11","paris-12","paris-13","paris-14","paris-15","paris-16","paris-17","paris-18","paris-19","paris-20",
    "melun","meaux","chelles","pontault-combault","savigny-le-temple","bussy-saint-georges",
    "dammarie-les-lys","torcy","combs-la-ville","montereau-fault-yonne",
    "versailles","sartrouville","saint-germain-en-laye","mantes-la-jolie","poissy",
    "conflans-sainte-honorine","rambouillet",
    "evry-courcouronnes","corbeil-essonnes","massy","savigny-sur-orge","athis-mons",
    "juvisy-sur-orge","grigny","sainte-genevieve-des-bois",
    "boulogne-billancourt","nanterre","asnieres-sur-seine","colombes","courbevoie",
    "rueil-malmaison","levallois-perret","clichy","montrouge",
    "saint-denis","montreuil","aubervilliers","aulnay-sous-bois","drancy",
    "noisy-le-grand","pantin","le-blanc-mesnil","bobigny",
    "vitry-sur-seine","creteil","champigny-sur-marne","saint-maur-des-fosses",
    "ivry-sur-seine","maisons-alfort","villejuif","vincennes",
    "argenteuil","cergy","sarcelles","garges-les-gonesse","franconville",
    "bezons","pontoise","herblay-sur-seine"
  ];

  const urls = [
    '',
    ...VILLES.map(v => `/zone-intervention/${v}`),
    '/zones-intervention',
    '/mentions',
    '/confidentialite',
    '/cgv'
  ];

  return urls.map(u => `${SITE_URL}${u}`);
}

const uniqueUrls = [...new Set(walk())];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap généré dans public/ avec ${uniqueUrls.length} URLs`);