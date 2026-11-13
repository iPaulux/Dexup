# Dexup

> Application web progressive (PWA) pour suivre sa collection de cartes Pokémon — React + Vite + Supabase.

Anciennement « PokéCollect ».

---

## Fonctionnalités

### Accueil
- Nombre de cartes possédées, sets entamés, cartes gradées et **valeur Cardmarket** de la collection
- Statistiques détaillées (grading par société, répartition par set)
- Accès direct à « Mes cartes », aux Actualités, aux Conventions et aux Produits
- Extensions en cours et dernières sorties

### Extensions
- Toutes les extensions TCG, de la plus récente à la plus ancienne
- **Noms en français** (langue réglable dans « Mon compte » : FR / EN / JA) et code de set (`ME6`, `SV3PT5`…)
- Recherche en français ou en anglais, ou par code ; filtres Toutes / Entamées / Favorites
- Vue liste ou grille, barre de progression et favori ★ par extension

### Cartes d'une extension
- Grille de cartes : **un tap sur le « + » ajoute la carte à la collection**, un tap sur l'image ouvre sa fiche
- Filtres Toutes / Possédées / Manquantes, vue grille ou liste
- Sets de plus de 250 cartes chargés en entier (pagination de l'API)

### Fiche carte
- Image, rareté, numéro, artiste, extension
- **Prix Cardmarket** (tendance, moyennes 7 j / 30 j) via l'API Pokémon TCG ; le lien Cardmarket reste disponible même quand l'API n'a pas de prix
- Ajout à la collection, favori ★, ajout à une liste
- **Grading** : PSA / PCA / CA / CollectAura / CCC / CGC / Beckett ou société libre
- Se ferme toute seule quand on change de page

### Recherche
- Par nom en **français ou en anglais** (`Salamèche` → Charmander, insensible aux accents)
- Filtre par rareté, résultats paginés (« Voir plus »)

### Scanner
- Caméra en **plein écran**, commandes en bas, résultats dans une feuille par-dessus la caméra
- **Scan automatique** : la lecture se déclenche dès que la carte est nette, immobile et bien éclairée (conseils « Ne bouge plus », « Plus de lumière », « Trop de reflets »), puis attend que la carte change avant de relire
- OCR du numéro (`025/193`) avec correction des caractères ambigus (O→0, l→1…) et contraste automatique
- **Il suffit de passer la carte** : pas de zone à viser. Le bas de la carte (numéro à gauche ou à droite selon l'époque) et le nom en haut sont lus en parallèle ; le nom (« Goupix », « Tiplouf ») + les chiffres lus ouvrent directement la bonne carte. Si seul le nom est lisible (webcam, reflet), les cartes de ce Pokémon sont proposées des plus récentes aux plus anciennes
- **BarcodeDetector** natif (Chrome / Safari) pour détecter QR codes et codes-barres automatiquement
- Recherche manuelle par numéro de carte (ex : `025`, `163/193`)
- Les PV et les noms d'attaques lus départagent les cartes d'un même Pokémon ; si une carte se détache, sa fiche s'ouvre directement

### Classeur
- **Listes** : « Ma collection » (cartes possédées, groupées par extension) et « Cartes gradées » (par société) toujours présentes, plus autant de listes personnelles que souhaité
- Chaque liste a son icône : Poké, Super, Hyper, Master, Honor, Soin, Sombre ou Chrono Ball
- Renommer, changer l'icône, retirer des cartes, supprimer — depuis le menu « ⋯ »
- **Favoris** : cartes, extensions et produits

### Produits
- Catalogue de produits scellés (boosters, displays, ETB, tins, coffrets, decks) avec prix indicatifs Cardmarket
- Marquer un produit comme **possédé**, filtre « Possédés », favoris ★
- Lien Cardmarket et accès aux cartes de l'extension

### Actualités et conventions
- **Actualités TCG** : flux RSS de pokemonblog.com (catégorie TCG) relayé par une fonction Netlify
- **Conventions** : salons et conventions pour collectionneurs en France et en Europe (pas les tournois compétitifs)
- Cache partagé 24 h dans Supabase

### Compte et synchronisation
- Inscription / connexion par email + mot de passe (Supabase Auth) ; l'app est privée
- Collection, favoris, listes et produits possédés **synchronisés sur Supabase**, lisibles hors ligne grâce à la base locale
- « Forcer la synchronisation » dans « Mon compte »

### Interface
- Thème clair monochrome : grille de points, titres en serif fin, libellés en monospace, une seule couleur d'accent (le violet du logo)
- Navigation à 5 entrées : Accueil · Extensions · Scanner · Recherche · Classeur (barre flottante sur mobile, barre latérale sur ordinateur)
- Animations légères : entrées en cascade, feuilles qui glissent, compteurs ; désactivées si le système demande moins d'animations

---

## Architecture

```
src/
├── App.jsx                 # Session, routes, barre d'onglets / barre latérale
├── main.jsx
├── styles.css              # Design system (tokens, composants, animations)
├── screens/
│   ├── Home.jsx            # Accueil : chiffres clés, raccourcis, extensions en cours
│   ├── Sets.jsx            # Liste des extensions
│   ├── SetDetail.jsx       # Cartes d'une extension
│   ├── Search.jsx          # Recherche par nom + rareté
│   ├── Scan.jsx            # Scanner plein écran
│   ├── Binder.jsx          # Classeur : listes + favoris
│   ├── Collection.jsx      # « Ma collection » et « Cartes gradées »
│   ├── ListDetail.jsx      # Détail d'une liste personnelle
│   └── Products.jsx        # Catalogue de produits scellés
├── components/
│   ├── ui.jsx              # Feuilles, champs, pastilles, états vides, page défilante
│   ├── cards.jsx           # Tuiles et lignes de cartes (grille / liste)
│   ├── CardSheet.jsx       # Fiche carte, grading, ajout à une liste
│   ├── sheets.jsx          # Statistiques, actualités, conventions, compte, édition de liste
│   ├── PokeBall.jsx        # Icônes de liste
│   ├── Logo.jsx            # Logo
│   └── Auth.jsx            # Connexion / inscription, écran de démarrage
├── store/
│   └── collection.jsx      # État partagé : cartes possédées, favoris, listes, fiche ouverte
├── lib/
│   ├── tcg.js              # Accès à l'API cartes (sets, cartes, recherche, valeur)
│   ├── scan.js             # Lecture d'une carte (OCR) et classement des candidats
│   ├── quality.js          # Mesure de netteté / exposition d'une image
│   ├── useAutoCapture.js   # Déclenchement automatique du scan
│   ├── news.js             # Actualités
│   └── events.js           # Conventions
├── utils/                  # Couche données
│   ├── supabase.js         # Client Supabase + authentification
│   ├── persist.js          # SQLite local + synchronisation Supabase
│   ├── db.js               # Base SQLite locale (sql.js + IndexedDB)
│   ├── storage.js          # Cartes et produits possédés, favoris, grading
│   ├── lists.js            # Listes personnelles
│   ├── cache.js            # Cache local de l'API
│   ├── sharedCache.js      # Cache partagé Supabase
│   ├── api.js              # URL de l'API (directe en dev, proxy en production)
│   ├── setNames.js         # Noms FR ↔ EN des extensions
│   ├── pokemonNames.js     # Noms FR → EN des Pokémon
│   └── LanguageContext.jsx # Langue des extensions
└── data/
    └── products.js         # Catalogue de produits

netlify/functions/
├── pokemon-api.js          # Proxy vers api.pokemontcg.io (avec nouvelles tentatives)
└── fetch-news.js           # Relais du flux RSS d'actualités
```

---

## Stack technique

| Outil | Rôle |
|-------|------|
| React 19 | Interface |
| Vite 6 | Build + serveur de développement |
| React Router 7 | Navigation (HashRouter) |
| Supabase JS 2 | Authentification + base de données |
| sql.js | SQLite dans le navigateur (IndexedDB) |
| Tesseract.js | Lecture des cartes au scan (OCR) |
| Lucide React | Icônes |
| vite-plugin-pwa | Service worker + manifeste |

## APIs utilisées

| API | Usage |
|-----|-------|
| [Pokémon TCG API](https://pokemontcg.io/) v2 | Extensions, cartes, images, prix Cardmarket |
| [PokeAPI GraphQL](https://graphql.pokeapi.co/v1beta2) | Noms français → anglais des Pokémon |
| Flux RSS pokemonblog.com | Actualités TCG (via fonction Netlify) |

---

## Stockage des données

Architecture double couche :

1. **SQLite local** (sql.js + IndexedDB) — lecture rapide, fonctionne hors ligne
2. **Supabase cloud** (PostgreSQL) — persistance serveur, survie au vidage de cache

Seules les données utilisateur sont synchronisées. Le cache API reste local.

| Table Supabase | Rôle |
|---|---|
| `pokecollect_data` | Données par utilisateur (collection, favoris, listes, produits possédés) — RLS user-scoped |
| `pokecollect_shared` | Cache partagé global (sets, cartes, actualités, conventions) — lecture publique |

`pokecollect_data` : RLS activé — chaque utilisateur n'accède qu'à ses propres données.  
`pokecollect_shared` : lecture publique (anon), écriture réservée aux utilisateurs authentifiés.

---

## Installation

### Prérequis
- Node.js ≥ 18
- Un projet Supabase avec la table `pokecollect_data` créée

### Setup Supabase

```sql
create table if not exists pokecollect_data (
  user_id    text not null,
  key        text not null,
  value      text,
  updated_at bigint,
  primary key (user_id, key)
);

alter table pokecollect_data enable row level security;

create policy "own data only"
  on pokecollect_data for all
  using  (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
```

Dans **Authentication → Settings** : désactiver "Confirm email" pour une inscription immédiate.

**Table partagée** (actualités + conventions — accessible à tous) :

```sql
create table if not exists pokecollect_shared (
  key        text primary key,
  value      text,
  updated_at bigint default 0
);

alter table pokecollect_shared enable row level security;

-- Lecture publique (non authentifié)
create policy "shared_read"
  on pokecollect_shared for select
  using (true);

-- Écriture réservée aux utilisateurs connectés
create policy "shared_write"
  on pokecollect_shared for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

> Les tables gardent le préfixe `pokecollect_` (ancien nom de l'app) : les renommer orphelinerait les collections existantes.
>
> La liste des conventions vit dans `src/lib/events.js` ; elle est mise en cache dans `pokecollect_shared` sous la clé `collector_events_2027` (à faire évoluer quand la liste change).

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Sans ces variables, l'app tourne en mode local sans compte.

### Commandes

```bash
npm install

# Développement (les fonctions Netlify sont servies aussi)
npm run dev

# Build de production dans dist/
npm run build
```

En développement, ajouter `?guest=1` à l'adresse (avant le `#`) ouvre l'app sans connexion, avec des données locales.

Le déploiement se fait par Netlify à chaque push sur `main` (commande `npm run build`, dossier `dist`).

---

## Pistes

- [ ] Rappels pour les conventions à venir
- [ ] Prix à jour pour les produits scellés (aujourd'hui saisis à la main)
- [ ] Historique de prix par carte
- [ ] Noms et visuels français des cartes

---

## Auteur

Fait avec ❤️ par **Paul Guttin**

---

## Licences tierces

Le scanner reprend et adapte du code de [pokeum](https://github.com/TBLgGamin/pokeum) (© 2026 TBLgGamin, licence MIT) — voir [`third_party/pokeum`](third_party/pokeum).
