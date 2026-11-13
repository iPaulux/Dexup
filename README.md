# Dexup

> Application web progressive (PWA) de suivi de collection de cartes Pokémon — React + Vite + Supabase.

---

## Fonctionnalités

### Authentification
- Inscription / connexion par **email + mot de passe** (Supabase Auth)
- L'application est entièrement privée — inaccessible sans compte
- Session persistante (reste connecté après fermeture)
- Page de connexion animée avec logo flottant

### 📦 Collection (Sets)
- Toutes les extensions TCG triées par date de sortie
- **Noms en français** quand la langue FR est active (mapping statique complet)
- **Tag ID** affiché sur chaque set (ex : `MEW`, `SV01`, `ME2`…)
- Recherche **en français ou anglais**, également par ID de set
- Vue **liste** ou **grille** au choix
- Barre de progression par set (cartes possédées / total)
- Favoris par set ★

### 🃏 Cartes d'un set
- Grille 3 colonnes avec image de chaque carte
- Tap → fiche détaillée complète
- Barre de progression `X / N cartes — XX%`
- Filtres : Toutes · Possédées · Manquantes
- Tri correct des numéros : 1, 2, 3… puis SV, TG, GG…

### 🔍 Fiche carte
- Grande image de la carte + rareté abrégée colorée (SAR · AR · HR · RR · UR · SR · ACE…)
- Artiste, numéro dans le set, ID du set
- **Prix en temps réel** (Cardmarket + TCGPlayer) via l'API Pokémon TCG
- Toggle **Ma collection** et **Favoris**
- Section **Grading** — enregistrer le grade PSA / PCA / CA / CollectAura / CCC / CGC / Beckett + champ libre "Autres"
- **Ajouter à une liste** personnalisée
- Lien direct **Cardmarket**

### 🔍 Recherche
- Recherche par nom en **français ou anglais** (`Salamèche` → Charmander, insensible aux accents)
- 1 025 Pokémon couverts avec indication 🔄 quand le nom a été traduit
- Filtres par rareté : Commune · Peu Commune · Rare · Rare Holo · EX / GX / V · Ultra Rare · Promo
- Combinaison nom + rareté possible

### 📷 Scan
- Accès caméra avec cadre de scan animé (ligne rouge)
- **Scan automatique** : la lecture se déclenche dès que la carte est nette, immobile et bien éclairée (conseils « Ne bouge plus », « Plus de lumière », « Trop de reflets »), puis attend que la carte change avant de relire
- OCR du numéro (`025/193`) avec correction des caractères ambigus (O→0, l→1…) et contraste automatique
- **BarcodeDetector** natif (Chrome / Safari) pour détecter QR codes et codes-barres automatiquement
- Recherche manuelle par numéro de carte (ex : `025`, `163/193`)
- Résultats en grille cliquables → fiche détaillée

### 📋 Mes Listes
- **Liste "Ma collection" épinglée** — non supprimable, affiche toutes les cartes possédées triées par date de sortie, avec icône Pokédex
- **Liste "Mes cartes gradées" épinglée** — non supprimable, toutes les cartes gradées regroupées par société (sections déroulantes), icône Baie Oran
- Créer autant de listes que souhaité (wishlist, échanges, master set…)
- Chaque liste dispose d'une **icône pokéball** au choix : Pokéball, Super Ball, Hyper Ball, Master Ball, Prémium, Guérison, Sombre, Chrono
- Renommer et changer l'icône via la modale d'édition ou le bouton dans le header
- Supprimer une liste (confirmation)
- Barre de progression possédées / total par liste
- Détail : vue grille ou liste, filtres Toutes / Possédées / Manquantes

### ★ Favoris
- Sets, cartes **et produits** favoris regroupés dans un onglet dédié
- Catégories déroulantes (Sets / Cartes / Produits) avec compteurs

### 🛍️ Produits
- Catalogue de produits TCG scellés (boosters, ETB, displays…) avec filtres par catégorie
- Images réelles des produits (visuels booster / ETB depuis pokemon.com et Bulbapedia)
- Système de favoris ★ synchronisé
- Lien direct vers Cardmarket pour chaque produit

### 📰 Actualités & Événements
- **Actualités TCG** — flux en temps réel depuis r/PokemonTCG (posts populaires) avec thumbnails, domaine source et scores ; en production : articles RSS depuis PokéBeach / PokeGuardian / Limitless TCG via Netlify Function
- **Conventions FR** — calendrier des événements Pokémon TCG français et européens (Régionaux, Internationaux, Japan Expo…), mis à jour depuis Supabase sans redéploiement
- Cache serveur partagé 24h (`pokecollect_shared`) pour des chargements instantanés

### ☁ Sync serveur
- Toutes les données utilisateur (collection, favoris, listes) sont **synchronisées sur Supabase**
- Les données survivent au vidage du cache navigateur
- Accessibles depuis n'importe quel appareil connecté avec le même compte
- Bouton "Forcer la sync" dans le menu compte pour pousser manuellement les données

---

## Architecture

```
src/
├── App.jsx                     # Routing + Header + BottomTabs + Auth gate
├── main.jsx
├── screens/
│   ├── SetsScreen.jsx          # Extensions (liste/grille, noms FR, tags) + blocs Actualités/Conventions
│   ├── CardsScreen.jsx         # Cartes d'un set
│   ├── SearchScreen.jsx        # Recherche nom + rareté
│   ├── ScanScreen.jsx          # Scanner une carte (caméra + numéro)
│   ├── ListsScreen.jsx         # Listes épinglées (Collection, Gradées) + listes utilisateur
│   ├── FavoritesScreen.jsx     # Favoris sets + cartes + produits (sections déroulantes)
│   ├── ProductsScreen.jsx      # Catalogue produits scellés (images, favoris, Cardmarket)
│   ├── PokedexListScreen.jsx   # Vue "Ma collection" triée par date de sortie
│   ├── GradedListScreen.jsx    # Vue "Mes cartes gradées" groupées par société
│   └── ListDetailScreen.jsx    # Détail d'une liste personnalisée
├── components/
│   ├── AuthScreen.jsx          # Page de connexion / inscription
│   ├── AccountModal.jsx        # Menu compte (sync, déconnexion)
│   ├── SplashScreen.jsx        # Écran de démarrage animé
│   ├── CardDetailModal.jsx     # Fiche carte (prix, rareté, grading PSA/PCA/CA/COL/CCC/CGC/BEC/Autres, listes)
│   ├── AddToListModal.jsx      # Bottom sheet "Ajouter à une liste"
│   ├── PokeBallPicker.jsx      # Sélecteur d'icône pokéball (SVG inline)
│   ├── ArticlesModal.jsx       # Bottom sheet actualités TCG (RSS prod / Reddit fallback)
│   ├── ConventionsModal.jsx    # Bottom sheet événements Pokémon TCG FR/EU
│   └── rn-web.jsx              # Shim React Native → DOM (View, Text, FlatList…)
├── utils/
│   ├── supabase.js             # Client Supabase + helpers auth (signIn, signUp, signOut)
│   ├── persist.js              # Stockage double couche : SQLite local + Supabase cloud
│   ├── db.js                   # Base SQLite locale (sql.js + IndexedDB)
│   ├── storage.js              # Cartes possédées, favoris, grading
│   ├── lists.js                # Listes personnalisées (CRUD)
│   ├── cache.js                # Cache API 24h (SQLite local)
│   ├── sharedCache.js          # Cache partagé Supabase (actualités, conventions) TTL 24h
│   ├── setNames.js             # Noms FR↔EN des sets + filtrage
│   ├── pokemonNames.js         # Traduction FR→EN des noms Pokémon (PokeAPI GraphQL)
│   ├── theme.js                # Polices et couleurs globales
│   └── LanguageContext.jsx     # Contexte langue EN / FR / JA
└── netlify/
    └── functions/
        └── fetch-news.js       # Proxy RSS serveur (PokéBeach / PokeGuardian / Limitless TCG)
```

---

## Stack technique

| Outil | Rôle |
|-------|------|
| React 19 | UI |
| Vite 6 | Build + dev server |
| React Router DOM 7 | Navigation (HashRouter) |
| Supabase JS 2 | Auth + base de données cloud |
| sql.js 1.12 | SQLite dans le navigateur (IndexedDB) |
| Lucide React | Icônes SVG |
| vite-plugin-pwa | Service Worker + manifest PWA |

---

## APIs utilisées

| API | Usage |
|-----|-------|
| [Pokémon TCG API](https://pokemontcg.io/) `v2` | Sets, cartes, images, prix Cardmarket / TCGPlayer |
| [PokeAPI GraphQL](https://beta.pokeapi.co/graphql/v1beta) | Noms FR→EN des 1 025 Pokémon |
| [Reddit JSON API](https://www.reddit.com/r/PokemonTCG/hot.json) | Actualités TCG (fallback CORS natif) |
| PokéBeach / PokeGuardian / Limitless TCG RSS | Actualités TCG (via Netlify Function en production) |

---

## Stockage des données

Architecture double couche :

1. **SQLite local** (sql.js + IndexedDB) — lecture rapide, fonctionne hors ligne
2. **Supabase cloud** (PostgreSQL) — persistance serveur, survie au vidage de cache

Seules les données utilisateur sont synchronisées. Le cache API reste local.

| Table Supabase | Rôle |
|---|---|
| `pokecollect_data` | Données par utilisateur (collection, favoris, listes) — RLS user-scoped |
| `pokecollect_shared` | Cache partagé global (actualités TCG, conventions FR) — lecture publique |

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

> Les conventions France peuvent être mises à jour directement dans la table `pokecollect_shared` via le dashboard Supabase (clé `fr_conventions`, valeur JSON du tableau d'événements).

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

### Commandes

```bash
npm install

# Développement
npm run dev

# Build de production (dans dist_new/ pour éviter les conflits de permissions)
npm run build -- --outDir dist_new

# Déploiement Netlify
netlify deploy --prod --dir dist_new
```

---

## Onglets

| Icône | Onglet | Description |
|:-----:|--------|-------------|
| 🏠 | Home | Tous les sets TCG |
| 🔍 | Search | Recherche par nom + rareté |
| 📷 | Scan | Scanner une carte par caméra ou numéro |
| 📋 | Lists | Listes personnalisées avec pokéballs |
| ★ | Favoris | Sets, cartes et produits mis en favoris |
| 🛍️ | Produits | Catalogue scellé avec images et favoris |

---

## Road map

### Contenu & communauté
- [x] **Articles Pokémon** — flux d'actualités TCG via RSS (PokéBeach, PokeGuardian, Limitless TCG) en production, Reddit fallback en dev ; cache serveur Supabase 24h
- [x] **Dates des conventions** — calendrier des événements TCG français et européens, mis à jour depuis Supabase sans redéploiement
- [ ] **Rappels d'événements** — notifications push pour les conventions et tournois à venir

### Marché & prix
- [ ] **Prix FR sur les cartes** — cotations en euros en temps réel depuis Cardmarket pour chaque carte de la collection
- [ ] **Prix FR sur les produits** — mise à jour automatique des prix des boosters / ETB / displays depuis le marché français
- [ ] **Graphique des prix** — historique de prix par carte (évolution semaine / mois / an)
- [ ] **Valeur totale de la collection** — estimation automatique de la valeur en euros de toute la collection (somme des prix Cardmarket de chaque carte possédée)

### Performance & offline
- [x] **Cache serveur des sets et cartes** — sets (TTL 7j) et cartes par set (TTL 30j) stockés dans Supabase ; stratégie 3-tiers : local SQLite → Supabase → API pokemontcg.io

### Scan
- [ ] **Fix scan de cartes** — améliorer la fiabilité du BarcodeDetector (QR codes + codes-barres des boosters) et de la recherche manuelle par numéro

### Grading
- [x] **Sociétés de gradation françaises** — PSA, PCA, CA, CollectAura, CCC, CGC, Beckett + champ libre "Autres"

---

## Auteur

Fait avec ❤️ par **Paul Guttin**

---

## Licences tierces

Le scanner reprend et adapte du code de [pokeum](https://github.com/TBLgGamin/pokeum) (© 2026 TBLgGamin, licence MIT) — voir [`third_party/pokeum`](third_party/pokeum).
