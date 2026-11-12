// Base de données statique des produits TCG Pokémon
// Types : booster | display | etb | tin | coffret | deck
// Prix indicatifs relevés sur Cardmarket — mis à jour août 2026
export const PRICE_SOURCE = 'Cardmarket';
export const PRICE_UPDATED = 'août 2026';

const PKM = (year, slug) =>
  `https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/incrementals/${year}/${slug}/${slug}-169-en.png`;

export const PRODUCT_TYPES = [
  { id: 'all',      label: 'Tous',     emoji: '🎴' },
  { id: 'booster', label: 'Boosters', emoji: '📦' },
  { id: 'display', label: 'Displays', emoji: '🗃️' },
  { id: 'etb',     label: 'ETB',      emoji: '🎁' },
  { id: 'tin',     label: 'Tins',     emoji: '🥫' },
  { id: 'coffret', label: 'Coffrets', emoji: '🎀' },
  { id: 'deck',    label: 'Decks',    emoji: '🃏' },
];

export const PRODUCTS = [

  // ═══════════════════════════════════════════════════════════════
  // MEGA EVOLUTION (2025-2026)
  // ═══════════════════════════════════════════════════════════════

  // ─── me4 — Chaos Rising / Chaos Ascendant (2026) ─────────────
  { id:'me4-booster', name:'Booster Chaos Rising', nameFr:'Booster Chaos Ascendant', type:'booster', setId:'me4', setName:'Chaos Rising', series:'Mega Evolution', releaseDate:'2026/06/27', price:'4.80€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Booster 10 cartes du set Chaos Ascendant.', color:'#1a1a3a' },
  { id:'me4-display', name:'Display Chaos Rising', nameFr:'Display Chaos Ascendant', type:'display', setId:'me4', setName:'Chaos Rising', series:'Mega Evolution', releaseDate:'2026/06/27', price:'158€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'me4-etb', name:'ETB Chaos Rising', nameFr:'ETB Chaos Ascendant', type:'etb', setId:'me4', setName:'Chaos Rising', series:'Mega Evolution', releaseDate:'2026/06/27', price:'60€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a1a3a' },

  // ─── me3 — Perfect Order / Ordre Parfait (2026) ───────────────
  { id:'me3-booster', name:'Booster Perfect Order', nameFr:'Booster Ordre Parfait', type:'booster', setId:'me3', setName:'Perfect Order', series:'Mega Evolution', releaseDate:'2026/03/27', price:'4.80€', image:PKM('2026','me03-booster-bundle'), contents:{packs:1,cardsPerPack:10}, description:'Booster 10 cartes du set Ordre Parfait.', color:'#1a3a5c' },
  { id:'me3-display', name:'Display Perfect Order', nameFr:'Display Ordre Parfait', type:'display', setId:'me3', setName:'Perfect Order', series:'Mega Evolution', releaseDate:'2026/03/27', price:'152€', image:PKM('2026','me03-booster-bundle'), contents:{packs:36,cardsPerPack:10}, color:'#1a3a5c' },
  { id:'me3-etb', name:'ETB Perfect Order', nameFr:'ETB Ordre Parfait', type:'etb', setId:'me3', setName:'Perfect Order', series:'Mega Evolution', releaseDate:'2026/03/27', price:'58€', image:PKM('2026','me03-elite-trainer-box'), contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires','1 boîte']}, color:'#1a3a5c' },

  // ─── me2 — Phantasmal Flames / Flammes Fantasmagoriques (2025) ─
  { id:'me2-booster', name:'Booster Phantasmal Flames', nameFr:'Booster Flammes Fantasmagoriques', type:'booster', setId:'me2', setName:'Phantasmal Flames', series:'Mega Evolution', releaseDate:'2025/11/14', price:'4.80€', image:PKM('2025','me02-booster-bundle'), contents:{packs:1,cardsPerPack:10}, color:'#3a1a1a' },
  { id:'me2-display', name:'Display Phantasmal Flames', nameFr:'Display Flammes Fantasmagoriques', type:'display', setId:'me2', setName:'Phantasmal Flames', series:'Mega Evolution', releaseDate:'2025/11/14', price:'148€', image:PKM('2025','me02-booster-bundle'), contents:{packs:36,cardsPerPack:10}, color:'#3a1a1a' },
  { id:'me2-etb', name:'ETB Phantasmal Flames', nameFr:'ETB Flammes Fantasmagoriques', type:'etb', setId:'me2', setName:'Phantasmal Flames', series:'Mega Evolution', releaseDate:'2025/11/14', price:'55€', image:PKM('2025','me02-elite-trainer-box'), contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#3a1a1a' },

  // ─── me1 — Ascended Heroes / Héros Ascendants (2025) ──────────
  { id:'me1-booster', name:'Booster Ascended Heroes', nameFr:'Booster Héros Ascendants', type:'booster', setId:'me1', setName:'Ascended Heroes', series:'Mega Evolution', releaseDate:'2025/07/25', price:'4.70€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'me1-display', name:'Display Ascended Heroes', nameFr:'Display Héros Ascendants', type:'display', setId:'me1', setName:'Ascended Heroes', series:'Mega Evolution', releaseDate:'2025/07/25', price:'145€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'me1-etb', name:'ETB Ascended Heroes', nameFr:'ETB Héros Ascendants', type:'etb', setId:'me1', setName:'Ascended Heroes', series:'Mega Evolution', releaseDate:'2025/07/25', price:'55€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a3a' },

  // ═══════════════════════════════════════════════════════════════
  // SCARLET & VIOLET (2023-2025)
  // ═══════════════════════════════════════════════════════════════

  // ─── sv10 — Destined Rivals / Rivaux du Destin (2025) ─────────
  { id:'sv10-booster', name:'Booster Destined Rivals', nameFr:'Booster Rivaux du Destin', type:'booster', setId:'sv10', setName:'Destined Rivals', series:'Scarlet & Violet', releaseDate:'2025/05/30', price:'4.60€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'sv10-display', name:'Display Destined Rivals', nameFr:'Display Rivaux du Destin', type:'display', setId:'sv10', setName:'Destined Rivals', series:'Scarlet & Violet', releaseDate:'2025/05/30', price:'145€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'sv10-etb', name:'ETB Destined Rivals', nameFr:'ETB Rivaux du Destin', type:'etb', setId:'sv10', setName:'Destined Rivals', series:'Scarlet & Violet', releaseDate:'2025/05/30', price:'57€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires','1 boîte']}, color:'#2a1a3a' },

  // ─── sv9 — Journey Together / Ensemble, on avance (2025) ──────
  { id:'sv9-booster', name:'Booster Journey Together', nameFr:"Booster Ensemble, on avance", type:'booster', setId:'sv9', setName:'Journey Together', series:'Scarlet & Violet', releaseDate:'2025/03/28', price:'4.70€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'sv9-display', name:'Display Journey Together', nameFr:"Display Ensemble, on avance", type:'display', setId:'sv9', setName:'Journey Together', series:'Scarlet & Violet', releaseDate:'2025/03/28', price:'148€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'sv9-etb', name:'ETB Journey Together', nameFr:"ETB Ensemble, on avance", type:'etb', setId:'sv9', setName:'Journey Together', series:'Scarlet & Violet', releaseDate:'2025/03/28', price:'58€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a2a3a' },

  // ─── sve — Prismatic Evolutions / Évolutions Prismatiques (2025)
  { id:'sve-booster', name:'Booster Prismatic Evolutions', nameFr:'Booster Évolutions Prismatiques', type:'booster', setId:'sve', setName:'Prismatic Evolutions', series:'Scarlet & Violet', releaseDate:'2025/01/17', price:'9.50€', image:null, contents:{packs:1,cardsPerPack:10}, description:"Booster dédié aux 151 formes d'Évoli.", color:'#2a1a4a' },
  { id:'sve-display', name:'Display Prismatic Evolutions', nameFr:'Display Évolutions Prismatiques', type:'display', setId:'sve', setName:'Prismatic Evolutions', series:'Scarlet & Violet', releaseDate:'2025/01/17', price:'295€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a4a' },
  { id:'sve-etb', name:'ETB Prismatic Evolutions', nameFr:'ETB Évolutions Prismatiques', type:'etb', setId:'sve', setName:'Prismatic Evolutions', series:'Scarlet & Violet', releaseDate:'2025/01/17', price:'95€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes prismatiques','45 cartes Énergie','1 boîte']}, color:'#2a1a4a' },
  { id:'sve-coffret-evoli', name:'Coffret Évoli Prismatic', nameFr:'Coffret Collection Évoli — Évolutions Prismatiques', type:'coffret', setId:'sve', setName:'Prismatic Evolutions', series:'Scarlet & Violet', releaseDate:'2025/01/17', price:'48€', image:null, contents:{packs:4,cardsPerPack:10,promoCards:1,extras:['1 carte promo Évoli']}, color:'#2a1a4a' },

  // ─── sv8 — Surging Sparks / Étincelles Déferlantes (2024) ─────
  { id:'sv8-booster', name:'Booster Surging Sparks', nameFr:'Booster Étincelles Déferlantes', type:'booster', setId:'sv8', setName:'Surging Sparks', series:'Scarlet & Violet', releaseDate:'2024/11/08', price:'5.20€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#3a2a1a' },
  { id:'sv8-display', name:'Display Surging Sparks', nameFr:'Display Étincelles Déferlantes', type:'display', setId:'sv8', setName:'Surging Sparks', series:'Scarlet & Violet', releaseDate:'2024/11/08', price:'168€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a2a1a' },
  { id:'sv8-etb', name:'ETB Surging Sparks', nameFr:'ETB Étincelles Déferlantes', type:'etb', setId:'sv8', setName:'Surging Sparks', series:'Scarlet & Violet', releaseDate:'2024/11/08', price:'58€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#3a2a1a' },
  { id:'sv8-tin-pikachu', name:'Tin Pikachu Surging Sparks', nameFr:'Boîte Métal Pikachu — Étincelles Déferlantes', type:'tin', setId:'sv8', setName:'Surging Sparks', series:'Scarlet & Violet', releaseDate:'2024/11/08', price:'28€', image:null, contents:{packs:3,cardsPerPack:10,promoCards:1,extras:['1 carte promo Pikachu ex']}, color:'#3a2a1a' },

  // ─── sv7pt5 — Shrouded Fable / La Fable Voilée (2024) ─────────
  { id:'sv6pt5-booster', name:'Booster Shrouded Fable', nameFr:'Booster La Fable Voilée', type:'booster', setId:'sv6pt5', setName:'Shrouded Fable', series:'Scarlet & Violet', releaseDate:'2024/08/02', price:'6.80€', image:null, contents:{packs:1,cardsPerPack:10}, description:"Set spécial mettant en avant Okidogi, Munkidori et Fezandipiti.", color:'#1a2a1a' },
  { id:'sv6pt5-display', name:'Display Shrouded Fable', nameFr:'Display La Fable Voilée', type:'display', setId:'sv6pt5', setName:'Shrouded Fable', series:'Scarlet & Violet', releaseDate:'2024/08/02', price:'195€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a1a' },

  // ─── sv7 — Stellar Crown / Couronne Stellaire (2024) ──────────
  { id:'sv7-booster', name:'Booster Stellar Crown', nameFr:'Booster Couronne Stellaire', type:'booster', setId:'sv7', setName:'Stellar Crown', series:'Scarlet & Violet', releaseDate:'2024/09/13', price:'4.20€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a4a' },
  { id:'sv7-display', name:'Display Stellar Crown', nameFr:'Display Couronne Stellaire', type:'display', setId:'sv7', setName:'Stellar Crown', series:'Scarlet & Violet', releaseDate:'2024/09/13', price:'128€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a4a' },
  { id:'sv7-etb', name:'ETB Stellar Crown', nameFr:'ETB Couronne Stellaire', type:'etb', setId:'sv7', setName:'Stellar Crown', series:'Scarlet & Violet', releaseDate:'2024/09/13', price:'52€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a2a4a' },

  // ─── sv6 — Twilight Masquerade / Mascarade Crépusculaire (2024)
  { id:'sv6-booster', name:'Booster Twilight Masquerade', nameFr:'Booster Mascarade Crépusculaire', type:'booster', setId:'sv6', setName:'Twilight Masquerade', series:'Scarlet & Violet', releaseDate:'2024/05/24', price:'4.30€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'sv6-display', name:'Display Twilight Masquerade', nameFr:'Display Mascarade Crépusculaire', type:'display', setId:'sv6', setName:'Twilight Masquerade', series:'Scarlet & Violet', releaseDate:'2024/05/24', price:'132€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'sv6-etb', name:'ETB Twilight Masquerade', nameFr:'ETB Mascarade Crépusculaire', type:'etb', setId:'sv6', setName:'Twilight Masquerade', series:'Scarlet & Violet', releaseDate:'2024/05/24', price:'52€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a3a' },

  // ─── sv5 — Temporal Forces / Forces Temporelles (2024) ────────
  { id:'sv5-booster', name:'Booster Temporal Forces', nameFr:'Booster Forces Temporelles', type:'booster', setId:'sv5', setName:'Temporal Forces', series:'Scarlet & Violet', releaseDate:'2024/03/22', price:'4.10€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a3a2a' },
  { id:'sv5-display', name:'Display Temporal Forces', nameFr:'Display Forces Temporelles', type:'display', setId:'sv5', setName:'Temporal Forces', series:'Scarlet & Violet', releaseDate:'2024/03/22', price:'122€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a3a2a' },
  { id:'sv5-etb', name:'ETB Temporal Forces', nameFr:'ETB Forces Temporelles', type:'etb', setId:'sv5', setName:'Temporal Forces', series:'Scarlet & Violet', releaseDate:'2024/03/22', price:'50€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a3a2a' },

  // ─── sv4pt5 — Paldean Fates / Destinées de Paldea (2024) ──────
  { id:'sv4pt5-booster', name:'Booster Paldean Fates', nameFr:'Booster Destinées de Paldea', type:'booster', setId:'sv4pt5', setName:'Paldean Fates', series:'Scarlet & Violet', releaseDate:'2024/01/26', price:'7.20€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Set spécial Destinées de Paldea avec des cartes Shiny Rare.', color:'#2a1a2a' },
  { id:'sv4pt5-display', name:'Display Paldean Fates', nameFr:'Display Destinées de Paldea', type:'display', setId:'sv4pt5', setName:'Paldean Fates', series:'Scarlet & Violet', releaseDate:'2024/01/26', price:'210€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a2a' },
  { id:'sv4pt5-etb', name:'ETB Paldean Fates', nameFr:'ETB Destinées de Paldea', type:'etb', setId:'sv4pt5', setName:'Paldean Fates', series:'Scarlet & Violet', releaseDate:'2024/01/26', price:'68€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a2a' },

  // ─── sv4 — Paradox Rift / Fissure Paradoxe (2023) ─────────────
  { id:'sv4-booster', name:'Booster Paradox Rift', nameFr:'Booster Fissure Paradoxe', type:'booster', setId:'sv4', setName:'Paradox Rift', series:'Scarlet & Violet', releaseDate:'2023/11/03', price:'4.00€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'sv4-display', name:'Display Paradox Rift', nameFr:'Display Fissure Paradoxe', type:'display', setId:'sv4', setName:'Paradox Rift', series:'Scarlet & Violet', releaseDate:'2023/11/03', price:'118€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'sv4-etb', name:'ETB Paradox Rift', nameFr:'ETB Fissure Paradoxe', type:'etb', setId:'sv4', setName:'Paradox Rift', series:'Scarlet & Violet', releaseDate:'2023/11/03', price:'50€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a1a3a' },

  // ─── sv3pt5 — 151 (2023) ──────────────────────────────────────
  { id:'sv3pt5-booster', name:'Booster 151', nameFr:'Booster 151', type:'booster', setId:'sv3pt5', setName:'151', series:'Scarlet & Violet', releaseDate:'2023/09/22', price:'7.50€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Booster dédié aux 151 Pokémon originaux de Kanto.', color:'#3a1a2a' },
  { id:'sv3pt5-display', name:'Display 151', nameFr:'Display 151', type:'display', setId:'sv3pt5', setName:'151', series:'Scarlet & Violet', releaseDate:'2023/09/22', price:'220€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a1a2a' },
  { id:'sv3pt5-etb', name:'ETB 151', nameFr:'ETB 151', type:'etb', setId:'sv3pt5', setName:'151', series:'Scarlet & Violet', releaseDate:'2023/09/22', price:'78€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','1 boîte numérotée']}, color:'#3a1a2a' },
  { id:'sv3pt5-coffret-mewtwo', name:'Coffret Mewtwo ex 151', nameFr:'Coffret Collection Mewtwo ex — 151', type:'coffret', setId:'sv3pt5', setName:'151', series:'Scarlet & Violet', releaseDate:'2023/09/22', price:'42€', image:null, contents:{packs:4,cardsPerPack:10,promoCards:2,extras:['2 cartes promo Mewtwo ex']}, color:'#3a1a2a' },

  // ─── sv3 — Obsidian Flames / Flammes Obsidiennes (2023) ───────
  { id:'sv3-booster', name:'Booster Obsidian Flames', nameFr:'Booster Flammes Obsidiennes', type:'booster', setId:'sv3', setName:'Obsidian Flames', series:'Scarlet & Violet', releaseDate:'2023/08/11', price:'3.90€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'sv3-display', name:'Display Obsidian Flames', nameFr:'Display Flammes Obsidiennes', type:'display', setId:'sv3', setName:'Obsidian Flames', series:'Scarlet & Violet', releaseDate:'2023/08/11', price:'115€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'sv3-etb', name:'ETB Obsidian Flames', nameFr:'ETB Flammes Obsidiennes', type:'etb', setId:'sv3', setName:'Obsidian Flames', series:'Scarlet & Violet', releaseDate:'2023/08/11', price:'48€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a1a' },

  // ─── sv2 — Paldea Evolved / Évolutions à Paldea (2023) ────────
  { id:'sv2-booster', name:'Booster Paldea Evolved', nameFr:'Booster Évolutions à Paldea', type:'booster', setId:'sv2', setName:'Paldea Evolved', series:'Scarlet & Violet', releaseDate:'2023/06/09', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a3a1a' },
  { id:'sv2-display', name:'Display Paldea Evolved', nameFr:'Display Évolutions à Paldea', type:'display', setId:'sv2', setName:'Paldea Evolved', series:'Scarlet & Violet', releaseDate:'2023/06/09', price:'112€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a3a1a' },
  { id:'sv2-etb', name:'ETB Paldea Evolved', nameFr:'ETB Évolutions à Paldea', type:'etb', setId:'sv2', setName:'Paldea Evolved', series:'Scarlet & Violet', releaseDate:'2023/06/09', price:'46€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a3a1a' },

  // ─── sv1 — Scarlet & Violet base / Écarlate et Violet (2023) ──
  { id:'sv1-booster', name:'Booster Scarlet & Violet', nameFr:'Booster Écarlate et Violet', type:'booster', setId:'sv1', setName:'Scarlet & Violet', series:'Scarlet & Violet', releaseDate:'2023/03/31', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a2a1a' },
  { id:'sv1-display', name:'Display Scarlet & Violet', nameFr:'Display Écarlate et Violet', type:'display', setId:'sv1', setName:'Scarlet & Violet', series:'Scarlet & Violet', releaseDate:'2023/03/31', price:'105€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a2a1a' },
  { id:'sv1-etb', name:'ETB Scarlet & Violet', nameFr:'ETB Écarlate et Violet', type:'etb', setId:'sv1', setName:'Scarlet & Violet', series:'Scarlet & Violet', releaseDate:'2023/03/31', price:'48€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a2a1a' },
  { id:'sv1-deck-koraidon', name:'Deck Koraidon ex', nameFr:'Deck de Combat Koraidon ex', type:'deck', setId:'sv1', setName:'Scarlet & Violet', series:'Scarlet & Violet', releaseDate:'2023/03/31', price:'13€', image:null, contents:{totalCards:60,extras:['guide','règle du jeu','accessoires']}, color:'#2a1a1a' },
  { id:'sv1-deck-miraidon', name:'Deck Miraidon ex', nameFr:'Deck de Combat Miraidon ex', type:'deck', setId:'sv1', setName:'Scarlet & Violet', series:'Scarlet & Violet', releaseDate:'2023/03/31', price:'13€', image:null, contents:{totalCards:60,extras:['guide','règle du jeu','accessoires']}, color:'#1a1a2a' },

  // ═══════════════════════════════════════════════════════════════
  // SWORD & SHIELD (2020-2023)
  // ═══════════════════════════════════════════════════════════════

  // ─── swsh12pt5 — Crown Zenith / Zénith Suprême (2023) ─────────
  { id:'swsh12pt5-booster', name:'Booster Crown Zenith', nameFr:'Booster Zénith Suprême', type:'booster', setId:'swsh12pt5', setName:'Crown Zenith', series:'Sword & Shield', releaseDate:'2023/01/20', price:'5.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a2a3a' },
  { id:'swsh12pt5-display', name:'Display Crown Zenith', nameFr:'Display Zénith Suprême', type:'display', setId:'swsh12pt5', setName:'Crown Zenith', series:'Sword & Shield', releaseDate:'2023/01/20', price:'180€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a2a3a' },
  { id:'swsh12pt5-etb', name:'ETB Crown Zenith', nameFr:'ETB Zénith Suprême', type:'etb', setId:'swsh12pt5', setName:'Crown Zenith', series:'Sword & Shield', releaseDate:'2023/01/20', price:'65€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a2a3a' },
  { id:'swsh12pt5-tin-regieleki', name:'Tin Regieleki Crown Zenith', nameFr:'Boîte Métal Regieleki VMAX', type:'tin', setId:'swsh12pt5', setName:'Crown Zenith', series:'Sword & Shield', releaseDate:'2023/01/20', price:'25€', image:null, contents:{packs:3,cardsPerPack:10,promoCards:1,extras:['1 carte Regieleki VMAX']}, color:'#2a2a3a' },

  // ─── swsh12 — Silver Tempest / Tempête Argentée (2022) ────────
  { id:'swsh12-booster', name:'Booster Silver Tempest', nameFr:'Booster Tempête Argentée', type:'booster', setId:'swsh12', setName:'Silver Tempest', series:'Sword & Shield', releaseDate:'2022/11/11', price:'4.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a3a3a' },
  { id:'swsh12-display', name:'Display Silver Tempest', nameFr:'Display Tempête Argentée', type:'display', setId:'swsh12', setName:'Silver Tempest', series:'Sword & Shield', releaseDate:'2022/11/11', price:'148€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a3a3a' },
  { id:'swsh12-etb', name:'ETB Silver Tempest', nameFr:'ETB Tempête Argentée', type:'etb', setId:'swsh12', setName:'Silver Tempest', series:'Sword & Shield', releaseDate:'2022/11/11', price:'52€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a3a3a' },

  // ─── swsh11 — Lost Origin / Origine Perdue (2022) ─────────────
  { id:'swsh11-booster', name:'Booster Lost Origin', nameFr:'Booster Origine Perdue', type:'booster', setId:'swsh11', setName:'Lost Origin', series:'Sword & Shield', releaseDate:'2022/09/09', price:'4.20€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'swsh11-display', name:'Display Lost Origin', nameFr:'Display Origine Perdue', type:'display', setId:'swsh11', setName:'Lost Origin', series:'Sword & Shield', releaseDate:'2022/09/09', price:'142€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'swsh11-etb', name:'ETB Lost Origin', nameFr:'ETB Origine Perdue', type:'etb', setId:'swsh11', setName:'Lost Origin', series:'Sword & Shield', releaseDate:'2022/09/09', price:'50€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a1a3a' },

  // ─── swsh10 — Astral Radiance / Radiance Astrale (2022) ───────
  { id:'swsh10-booster', name:'Booster Astral Radiance', nameFr:'Booster Radiance Astrale', type:'booster', setId:'swsh10', setName:'Astral Radiance', series:'Sword & Shield', releaseDate:'2022/05/27', price:'4.10€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'swsh10-display', name:'Display Astral Radiance', nameFr:'Display Radiance Astrale', type:'display', setId:'swsh10', setName:'Astral Radiance', series:'Sword & Shield', releaseDate:'2022/05/27', price:'140€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'swsh10-etb', name:'ETB Astral Radiance', nameFr:'ETB Radiance Astrale', type:'etb', setId:'swsh10', setName:'Astral Radiance', series:'Sword & Shield', releaseDate:'2022/05/27', price:'50€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a2a3a' },

  // ─── swsh9 — Brilliant Stars / Étoiles Brillantes (2022) ──────
  { id:'swsh9-booster', name:'Booster Brilliant Stars', nameFr:'Booster Étoiles Brillantes', type:'booster', setId:'swsh9', setName:'Brilliant Stars', series:'Sword & Shield', releaseDate:'2022/02/25', price:'4.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#3a3a1a' },
  { id:'swsh9-display', name:'Display Brilliant Stars', nameFr:'Display Étoiles Brillantes', type:'display', setId:'swsh9', setName:'Brilliant Stars', series:'Sword & Shield', releaseDate:'2022/02/25', price:'158€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a3a1a' },
  { id:'swsh9-etb', name:'ETB Brilliant Stars', nameFr:'ETB Étoiles Brillantes', type:'etb', setId:'swsh9', setName:'Brilliant Stars', series:'Sword & Shield', releaseDate:'2022/02/25', price:'55€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#3a3a1a' },
  { id:'swsh9-tin-arceus', name:'Tin Arceus Brilliant Stars', nameFr:'Boîte Métal Arceus VSTAR', type:'tin', setId:'swsh9', setName:'Brilliant Stars', series:'Sword & Shield', releaseDate:'2022/02/25', price:'30€', image:null, contents:{packs:3,cardsPerPack:10,promoCards:1,extras:['1 carte promo Arceus VSTAR']}, color:'#3a3a1a' },

  // ─── swsh8 — Fusion Strike / Poing de Fusion (2021) ───────────
  { id:'swsh8-booster', name:'Booster Fusion Strike', nameFr:'Booster Poing de Fusion', type:'booster', setId:'swsh8', setName:'Fusion Strike', series:'Sword & Shield', releaseDate:'2021/11/12', price:'4.00€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'swsh8-display', name:'Display Fusion Strike', nameFr:'Display Poing de Fusion', type:'display', setId:'swsh8', setName:'Fusion Strike', series:'Sword & Shield', releaseDate:'2021/11/12', price:'148€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'swsh8-etb', name:'ETB Fusion Strike', nameFr:'ETB Poing de Fusion', type:'etb', setId:'swsh8', setName:'Fusion Strike', series:'Sword & Shield', releaseDate:'2021/11/12', price:'52€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a3a' },
  { id:'swsh8-tin-mew', name:'Tin Mew Fusion Strike', nameFr:'Boîte Métal Mew VMAX', type:'tin', setId:'swsh8', setName:'Fusion Strike', series:'Sword & Shield', releaseDate:'2021/11/12', price:'35€', image:null, contents:{packs:3,cardsPerPack:10,promoCards:1,extras:['1 carte promo Mew VMAX']}, color:'#2a1a3a' },

  // ─── swsh7 — Evolving Skies / Ciel Évolutif (2021) ────────────
  { id:'swsh7-booster', name:'Booster Evolving Skies', nameFr:'Booster Ciel Évolutif', type:'booster', setId:'swsh7', setName:'Evolving Skies', series:'Sword & Shield', releaseDate:'2021/08/27', price:'5.80€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Set très populaire grâce aux cartes Draco et Évoli.', color:'#1a3a2a' },
  { id:'swsh7-display', name:'Display Evolving Skies', nameFr:'Display Ciel Évolutif', type:'display', setId:'swsh7', setName:'Evolving Skies', series:'Sword & Shield', releaseDate:'2021/08/27', price:'175€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a3a2a' },
  { id:'swsh7-etb', name:'ETB Evolving Skies', nameFr:'ETB Ciel Évolutif', type:'etb', setId:'swsh7', setName:'Evolving Skies', series:'Sword & Shield', releaseDate:'2021/08/27', price:'58€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a3a2a' },
  { id:'swsh7-tin-rayquaza', name:'Tin Rayquaza Evolving Skies', nameFr:'Boîte Métal Rayquaza VMAX', type:'tin', setId:'swsh7', setName:'Evolving Skies', series:'Sword & Shield', releaseDate:'2021/08/27', price:'45€', image:null, contents:{packs:3,cardsPerPack:10,promoCards:1,extras:['1 carte promo Rayquaza VMAX']}, color:'#1a3a2a' },

  // ─── swsh6 — Chilling Reign / Règne de Glace (2021) ───────────
  { id:'swsh6-booster', name:'Booster Chilling Reign', nameFr:'Booster Règne de Glace', type:'booster', setId:'swsh6', setName:'Chilling Reign', series:'Sword & Shield', releaseDate:'2021/06/18', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'swsh6-display', name:'Display Chilling Reign', nameFr:'Display Règne de Glace', type:'display', setId:'swsh6', setName:'Chilling Reign', series:'Sword & Shield', releaseDate:'2021/06/18', price:'145€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'swsh6-etb', name:'ETB Chilling Reign', nameFr:'ETB Règne de Glace', type:'etb', setId:'swsh6', setName:'Chilling Reign', series:'Sword & Shield', releaseDate:'2021/06/18', price:'50€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a2a3a' },

  // ─── swsh5 — Battle Styles / Styles de Combat (2021) ──────────
  { id:'swsh5-booster', name:'Booster Battle Styles', nameFr:'Booster Styles de Combat', type:'booster', setId:'swsh5', setName:'Battle Styles', series:'Sword & Shield', releaseDate:'2021/03/19', price:'3.60€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'swsh5-display', name:'Display Battle Styles', nameFr:'Display Styles de Combat', type:'display', setId:'swsh5', setName:'Battle Styles', series:'Sword & Shield', releaseDate:'2021/03/19', price:'135€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'swsh5-etb', name:'ETB Battle Styles', nameFr:'ETB Styles de Combat', type:'etb', setId:'swsh5', setName:'Battle Styles', series:'Sword & Shield', releaseDate:'2021/03/19', price:'48€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a1a' },

  // ─── swsh45 — Shining Fates / Destinées Radieuses (2021) ──────
  { id:'swsh45-booster', name:'Booster Shining Fates', nameFr:'Booster Destinées Radieuses', type:'booster', setId:'swsh45', setName:'Shining Fates', series:'Sword & Shield', releaseDate:'2021/02/19', price:'12€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Set spécial avec des cartes Shiny inédites. Très recherché pour les Charizard Shiny VMAX.', color:'#2a2a3a' },
  { id:'swsh45-display', name:'Display Shining Fates', nameFr:'Display Destinées Radieuses', type:'display', setId:'swsh45', setName:'Shining Fates', series:'Sword & Shield', releaseDate:'2021/02/19', price:'380€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a2a3a' },
  { id:'swsh45-etb', name:'ETB Shining Fates', nameFr:'ETB Destinées Radieuses', type:'etb', setId:'swsh45', setName:'Shining Fates', series:'Sword & Shield', releaseDate:'2021/02/19', price:'110€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, description:'ETB très prisé par les collectionneurs.', color:'#2a2a3a' },

  // ─── swsh4 — Vivid Voltage / Voltage Éclatant (2020) ──────────
  { id:'swsh4-booster', name:'Booster Vivid Voltage', nameFr:'Booster Voltage Éclatant', type:'booster', setId:'swsh4', setName:'Vivid Voltage', series:'Sword & Shield', releaseDate:'2020/11/13', price:'4.00€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#3a2a1a' },
  { id:'swsh4-display', name:'Display Vivid Voltage', nameFr:'Display Voltage Éclatant', type:'display', setId:'swsh4', setName:'Vivid Voltage', series:'Sword & Shield', releaseDate:'2020/11/13', price:'148€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a2a1a' },
  { id:'swsh4-etb', name:'ETB Vivid Voltage', nameFr:'ETB Voltage Éclatant', type:'etb', setId:'swsh4', setName:'Vivid Voltage', series:'Sword & Shield', releaseDate:'2020/11/13', price:'50€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#3a2a1a' },
  { id:'swsh4-tin-pikachu', name:'Tin Pikachu VMAX Vivid Voltage', nameFr:'Boîte Métal Pikachu VMAX', type:'tin', setId:'swsh4', setName:'Vivid Voltage', series:'Sword & Shield', releaseDate:'2020/11/13', price:'28€', image:null, contents:{packs:3,cardsPerPack:10,promoCards:1,extras:['1 carte promo Pikachu VMAX']}, color:'#3a2a1a' },

  // ─── swsh35 — Champion's Path / Parcours du Champion (2020) ───
  { id:'swsh35-booster', name:"Booster Champion's Path", nameFr:'Booster Parcours du Champion', type:'booster', setId:'swsh35', setName:"Champion's Path", series:'Sword & Shield', releaseDate:'2020/09/25', price:'14€', image:null, contents:{packs:1,cardsPerPack:10}, description:"Set spécial très rare, distribué uniquement en coffrets. Célèbre pour les cartes Stade et les cartes V/VMAX Shiny.", color:'#3a1a1a' },
  { id:'swsh35-coffret', name:"Coffret Champion's Path", nameFr:'Coffret Parcours du Champion', type:'coffret', setId:'swsh35', setName:"Champion's Path", series:'Sword & Shield', releaseDate:'2020/09/25', price:'48€', image:null, contents:{packs:4,cardsPerPack:10,promoCards:1,extras:["1 carte promo V ou VMAX"]}, description:'Coffret contenant 4 boosters Parcours du Champion et une carte exclusive.', color:'#3a1a1a' },

  // ─── swsh3 — Darkness Ablaze / Ténèbres Embrasées (2020) ──────
  { id:'swsh3-booster', name:'Booster Darkness Ablaze', nameFr:'Booster Ténèbres Embrasées', type:'booster', setId:'swsh3', setName:'Darkness Ablaze', series:'Sword & Shield', releaseDate:'2020/08/14', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a1a1a' },
  { id:'swsh3-display', name:'Display Darkness Ablaze', nameFr:'Display Ténèbres Embrasées', type:'display', setId:'swsh3', setName:'Darkness Ablaze', series:'Sword & Shield', releaseDate:'2020/08/14', price:'142€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a1a' },
  { id:'swsh3-etb', name:'ETB Darkness Ablaze', nameFr:'ETB Ténèbres Embrasées', type:'etb', setId:'swsh3', setName:'Darkness Ablaze', series:'Sword & Shield', releaseDate:'2020/08/14', price:'48€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a1a1a' },
  { id:'swsh3-tin-charizard', name:'Tin Charizard VMAX Darkness Ablaze', nameFr:'Boîte Métal Charizard VMAX', type:'tin', setId:'swsh3', setName:'Darkness Ablaze', series:'Sword & Shield', releaseDate:'2020/08/14', price:'55€', image:null, contents:{packs:3,cardsPerPack:10,promoCards:1,extras:['1 carte promo Charizard VMAX']}, color:'#1a1a1a' },

  // ─── swsh2 — Rebel Clash / Règne du Clash (2020) ──────────────
  { id:'swsh2-booster', name:'Booster Rebel Clash', nameFr:'Booster Règne du Clash', type:'booster', setId:'swsh2', setName:'Rebel Clash', series:'Sword & Shield', releaseDate:'2020/05/01', price:'3.60€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'swsh2-display', name:'Display Rebel Clash', nameFr:'Display Règne du Clash', type:'display', setId:'swsh2', setName:'Rebel Clash', series:'Sword & Shield', releaseDate:'2020/05/01', price:'140€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'swsh2-etb', name:'ETB Rebel Clash', nameFr:'ETB Règne du Clash', type:'etb', setId:'swsh2', setName:'Rebel Clash', series:'Sword & Shield', releaseDate:'2020/05/01', price:'45€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a3a' },

  // ─── swsh1 — Sword & Shield base / Épée et Bouclier (2020) ────
  { id:'swsh1-booster', name:'Booster Sword & Shield', nameFr:'Booster Épée et Bouclier', type:'booster', setId:'swsh1', setName:'Sword & Shield', series:'Sword & Shield', releaseDate:'2020/02/07', price:'3.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a2a' },
  { id:'swsh1-display', name:'Display Sword & Shield', nameFr:'Display Épée et Bouclier', type:'display', setId:'swsh1', setName:'Sword & Shield', series:'Sword & Shield', releaseDate:'2020/02/07', price:'138€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a2a' },
  { id:'swsh1-etb', name:'ETB Sword & Shield', nameFr:'ETB Épée et Bouclier', type:'etb', setId:'swsh1', setName:'Sword & Shield', series:'Sword & Shield', releaseDate:'2020/02/07', price:'45€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a2a2a' },

  // ═══════════════════════════════════════════════════════════════
  // SUN & MOON (2017-2019)
  // ═══════════════════════════════════════════════════════════════

  // ─── sm12 — Cosmic Eclipse / Éclipse Cosmique (2019) ──────────
  { id:'sm12-booster', name:'Booster Cosmic Eclipse', nameFr:'Booster Éclipse Cosmique', type:'booster', setId:'sm12', setName:'Cosmic Eclipse', series:'Sun & Moon', releaseDate:'2019/11/01', price:'4.20€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'sm12-display', name:'Display Cosmic Eclipse', nameFr:'Display Éclipse Cosmique', type:'display', setId:'sm12', setName:'Cosmic Eclipse', series:'Sun & Moon', releaseDate:'2019/11/01', price:'145€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'sm12-etb', name:'ETB Cosmic Eclipse', nameFr:'ETB Éclipse Cosmique', type:'etb', setId:'sm12', setName:'Cosmic Eclipse', series:'Sun & Moon', releaseDate:'2019/11/01', price:'48€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a1a3a' },

  // ─── sm115 — Hidden Fates / Destinées Cachées (2019) ──────────
  { id:'sm115-booster', name:'Booster Hidden Fates', nameFr:'Booster Destinées Cachées', type:'booster', setId:'sm115', setName:'Hidden Fates', series:'Sun & Moon', releaseDate:'2019/08/23', price:'18€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Set spécial très recherché pour ses cartes Shiny GX, notamment Charizard GX Shiny.', color:'#2a1a2a' },
  { id:'sm115-display', name:'Display Hidden Fates', nameFr:'Display Destinées Cachées', type:'display', setId:'sm115', setName:'Hidden Fates', series:'Sun & Moon', releaseDate:'2019/08/23', price:'580€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a2a' },
  { id:'sm115-etb', name:'ETB Hidden Fates', nameFr:'ETB Destinées Cachées', type:'etb', setId:'sm115', setName:'Hidden Fates', series:'Sun & Moon', releaseDate:'2019/08/23', price:'150€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a2a' },

  // ─── sm11 — Unified Minds / Connexion des Esprits (2019) ──────
  { id:'sm11-booster', name:'Booster Unified Minds', nameFr:'Booster Connexion des Esprits', type:'booster', setId:'sm11', setName:'Unified Minds', series:'Sun & Moon', releaseDate:'2019/08/02', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'sm11-display', name:'Display Unified Minds', nameFr:'Display Connexion des Esprits', type:'display', setId:'sm11', setName:'Unified Minds', series:'Sun & Moon', releaseDate:'2019/08/02', price:'138€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a3a' },

  // ─── sm10 — Unbroken Bonds / Liens Indéfectibles (2019) ───────
  { id:'sm10-booster', name:'Booster Unbroken Bonds', nameFr:'Booster Liens Indéfectibles', type:'booster', setId:'sm10', setName:'Unbroken Bonds', series:'Sun & Moon', releaseDate:'2019/05/03', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'sm10-display', name:'Display Unbroken Bonds', nameFr:'Display Liens Indéfectibles', type:'display', setId:'sm10', setName:'Unbroken Bonds', series:'Sun & Moon', releaseDate:'2019/05/03', price:'140€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'sm10-etb', name:'ETB Unbroken Bonds', nameFr:'ETB Liens Indéfectibles', type:'etb', setId:'sm10', setName:'Unbroken Bonds', series:'Sun & Moon', releaseDate:'2019/05/03', price:'45€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a1a1a' },

  // ─── sm9 — Team Up / Alliance Infaillible (2019) ──────────────
  { id:'sm9-booster', name:'Booster Team Up', nameFr:'Booster Alliance Infaillible', type:'booster', setId:'sm9', setName:'Team Up', series:'Sun & Moon', releaseDate:'2019/02/01', price:'4.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a3a2a' },
  { id:'sm9-display', name:'Display Team Up', nameFr:'Display Alliance Infaillible', type:'display', setId:'sm9', setName:'Team Up', series:'Sun & Moon', releaseDate:'2019/02/01', price:'155€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a3a2a' },

  // ─── sm8 — Lost Thunder / Tonnerre Perdu (2018) ───────────────
  { id:'sm8-booster', name:'Booster Lost Thunder', nameFr:'Booster Tonnerre Perdu', type:'booster', setId:'sm8', setName:'Lost Thunder', series:'Sun & Moon', releaseDate:'2018/11/02', price:'3.60€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a2a1a' },
  { id:'sm8-display', name:'Display Lost Thunder', nameFr:'Display Tonnerre Perdu', type:'display', setId:'sm8', setName:'Lost Thunder', series:'Sun & Moon', releaseDate:'2018/11/02', price:'135€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a2a1a' },

  // ─── sm75 — Dragon Majesty / Majesté des Dragons (2018) ───────
  { id:'sm75-booster', name:'Booster Dragon Majesty', nameFr:'Booster Majesté des Dragons', type:'booster', setId:'sm75', setName:'Dragon Majesty', series:'Sun & Moon', releaseDate:'2018/09/07', price:'5.50€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Mini-set spécial dédié aux Pokémon Dragon.', color:'#3a2a1a' },
  { id:'sm75-display', name:'Display Dragon Majesty', nameFr:'Display Majesté des Dragons', type:'display', setId:'sm75', setName:'Dragon Majesty', series:'Sun & Moon', releaseDate:'2018/09/07', price:'175€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a2a1a' },

  // ─── sm7 — Celestial Storm / Tempête Céleste (2018) ───────────
  { id:'sm7-booster', name:'Booster Celestial Storm', nameFr:'Booster Tempête Céleste', type:'booster', setId:'sm7', setName:'Celestial Storm', series:'Sun & Moon', releaseDate:'2018/08/03', price:'3.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'sm7-display', name:'Display Celestial Storm', nameFr:'Display Tempête Céleste', type:'display', setId:'sm7', setName:'Celestial Storm', series:'Sun & Moon', releaseDate:'2018/08/03', price:'132€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a3a' },

  // ─── sm6 — Forbidden Light / Lumière Interdite (2018) ─────────
  { id:'sm6-booster', name:'Booster Forbidden Light', nameFr:'Booster Lumière Interdite', type:'booster', setId:'sm6', setName:'Forbidden Light', series:'Sun & Moon', releaseDate:'2018/05/04', price:'3.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'sm6-display', name:'Display Forbidden Light', nameFr:'Display Lumière Interdite', type:'display', setId:'sm6', setName:'Forbidden Light', series:'Sun & Moon', releaseDate:'2018/05/04', price:'130€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a3a' },

  // ─── sm5 — Ultra Prism / Ultra-Prisme (2018) ──────────────────
  { id:'sm5-booster', name:'Booster Ultra Prism', nameFr:'Booster Ultra-Prisme', type:'booster', setId:'sm5', setName:'Ultra Prism', series:'Sun & Moon', releaseDate:'2018/02/02', price:'4.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a1a2a' },
  { id:'sm5-display', name:'Display Ultra Prism', nameFr:'Display Ultra-Prisme', type:'display', setId:'sm5', setName:'Ultra Prism', series:'Sun & Moon', releaseDate:'2018/02/02', price:'158€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a2a' },
  { id:'sm5-etb', name:'ETB Ultra Prism', nameFr:'ETB Ultra-Prisme', type:'etb', setId:'sm5', setName:'Ultra Prism', series:'Sun & Moon', releaseDate:'2018/02/02', price:'55€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a1a2a' },

  // ─── sm4 — Crimson Invasion / Invasion Carmin (2017) ──────────
  { id:'sm4-booster', name:'Booster Crimson Invasion', nameFr:'Booster Invasion Carmin', type:'booster', setId:'sm4', setName:'Crimson Invasion', series:'Sun & Moon', releaseDate:'2017/11/03', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'sm4-display', name:'Display Crimson Invasion', nameFr:'Display Invasion Carmin', type:'display', setId:'sm4', setName:'Crimson Invasion', series:'Sun & Moon', releaseDate:'2017/11/03', price:'138€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a1a' },

  // ─── sm35 — Shining Legends / Légendes Brillantes (2017) ──────
  { id:'sm35-booster', name:'Booster Shining Legends', nameFr:'Booster Légendes Brillantes', type:'booster', setId:'sm35', setName:'Shining Legends', series:'Sun & Moon', releaseDate:'2017/10/06', price:'12€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Mini-set spécial avec des cartes GX Shiny exclusives.', color:'#3a3a1a' },
  { id:'sm35-display', name:'Display Shining Legends', nameFr:'Display Légendes Brillantes', type:'display', setId:'sm35', setName:'Shining Legends', series:'Sun & Moon', releaseDate:'2017/10/06', price:'380€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a3a1a' },

  // ─── sm3 — Burning Shadows / Ombres Ardentes (2017) ───────────
  { id:'sm3-booster', name:'Booster Burning Shadows', nameFr:'Booster Ombres Ardentes', type:'booster', setId:'sm3', setName:'Burning Shadows', series:'Sun & Moon', releaseDate:'2017/08/04', price:'3.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a2a' },
  { id:'sm3-display', name:'Display Burning Shadows', nameFr:'Display Ombres Ardentes', type:'display', setId:'sm3', setName:'Burning Shadows', series:'Sun & Moon', releaseDate:'2017/08/04', price:'135€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a2a' },

  // ─── sm2 — Guardians Rising / Gardiens Ascendants (2017) ──────
  { id:'sm2-booster', name:'Booster Guardians Rising', nameFr:'Booster Gardiens Ascendants', type:'booster', setId:'sm2', setName:'Guardians Rising', series:'Sun & Moon', releaseDate:'2017/05/05', price:'3.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a3a1a' },
  { id:'sm2-display', name:'Display Guardians Rising', nameFr:'Display Gardiens Ascendants', type:'display', setId:'sm2', setName:'Guardians Rising', series:'Sun & Moon', releaseDate:'2017/05/05', price:'130€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a3a1a' },

  // ─── sm1 — Sun & Moon base / Soleil et Lune (2017) ────────────
  { id:'sm1-booster', name:'Booster Sun & Moon', nameFr:'Booster Soleil et Lune', type:'booster', setId:'sm1', setName:'Sun & Moon', series:'Sun & Moon', releaseDate:'2017/02/03', price:'4.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#3a2a1a' },
  { id:'sm1-display', name:'Display Sun & Moon', nameFr:'Display Soleil et Lune', type:'display', setId:'sm1', setName:'Sun & Moon', series:'Sun & Moon', releaseDate:'2017/02/03', price:'155€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a2a1a' },
  { id:'sm1-etb', name:'ETB Sun & Moon', nameFr:'ETB Soleil et Lune', type:'etb', setId:'sm1', setName:'Sun & Moon', series:'Sun & Moon', releaseDate:'2017/02/03', price:'60€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#3a2a1a' },

  // ═══════════════════════════════════════════════════════════════
  // XY (2014-2016)
  // ═══════════════════════════════════════════════════════════════

  // ─── xy12 — Evolutions (2016) ─────────────────────────────────
  { id:'xy12-booster', name:'Booster Evolutions', nameFr:'Booster Évolutions', type:'booster', setId:'xy12', setName:'Evolutions', series:'XY', releaseDate:'2016/11/02', price:'12€', image:null, contents:{packs:1,cardsPerPack:10}, description:"Réédition des cartes de la Base Set originale. Très recherché pour les cartes Charizard holo.", color:'#2a2a1a' },
  { id:'xy12-display', name:'Display Evolutions', nameFr:'Display Évolutions', type:'display', setId:'xy12', setName:'Evolutions', series:'XY', releaseDate:'2016/11/02', price:'350€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a2a1a' },
  { id:'xy12-etb', name:'ETB Evolutions', nameFr:'ETB Évolutions', type:'etb', setId:'xy12', setName:'Evolutions', series:'XY', releaseDate:'2016/11/02', price:'95€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#2a2a1a' },

  // ─── xy11 — Steam Siege / Offensive Vapeur (2016) ─────────────
  { id:'xy11-booster', name:'Booster Steam Siege', nameFr:'Booster Offensive Vapeur', type:'booster', setId:'xy11', setName:'Steam Siege', series:'XY', releaseDate:'2016/08/03', price:'4.00€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a2a3a' },
  { id:'xy11-display', name:'Display Steam Siege', nameFr:'Display Offensive Vapeur', type:'display', setId:'xy11', setName:'Steam Siege', series:'XY', releaseDate:'2016/08/03', price:'132€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a3a' },

  // ─── xy10 — Fates Collide / Feux Croisés (2016) ───────────────
  { id:'xy10-booster', name:'Booster Fates Collide', nameFr:'Booster Feux Croisés', type:'booster', setId:'xy10', setName:'Fates Collide', series:'XY', releaseDate:'2016/05/02', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a3a' },
  { id:'xy10-display', name:'Display Fates Collide', nameFr:'Display Feux Croisés', type:'display', setId:'xy10', setName:'Fates Collide', series:'XY', releaseDate:'2016/05/02', price:'128€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a3a' },

  // ─── xy9 — BREAKpoint / Point de BREAK (2016) ─────────────────
  { id:'xy9-booster', name:'Booster BREAKpoint', nameFr:'Booster Point de BREAK', type:'booster', setId:'xy9', setName:'BREAKpoint', series:'XY', releaseDate:'2016/02/03', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a1a2a' },
  { id:'xy9-display', name:'Display BREAKpoint', nameFr:'Display Point de BREAK', type:'display', setId:'xy9', setName:'BREAKpoint', series:'XY', releaseDate:'2016/02/03', price:'128€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a2a' },

  // ─── xy8 — BREAKthrough / BREAK Évolution (2015) ──────────────
  { id:'xy8-booster', name:'Booster BREAKthrough', nameFr:'Booster BREAK Évolution', type:'booster', setId:'xy8', setName:'BREAKthrough', series:'XY', releaseDate:'2015/11/04', price:'4.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a3a2a' },
  { id:'xy8-display', name:'Display BREAKthrough', nameFr:'Display BREAK Évolution', type:'display', setId:'xy8', setName:'BREAKthrough', series:'XY', releaseDate:'2015/11/04', price:'148€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a3a2a' },

  // ─── xy7 — Ancient Origins / Origines Antiques (2015) ─────────
  { id:'xy7-booster', name:'Booster Ancient Origins', nameFr:'Booster Origines Antiques', type:'booster', setId:'xy7', setName:'Ancient Origins', series:'XY', releaseDate:'2015/08/19', price:'4.00€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#3a2a1a' },
  { id:'xy7-display', name:'Display Ancient Origins', nameFr:'Display Origines Antiques', type:'display', setId:'xy7', setName:'Ancient Origins', series:'XY', releaseDate:'2015/08/19', price:'132€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a2a1a' },

  // ─── xy6 — Roaring Skies / Ciel Rugissant (2015) ──────────────
  { id:'xy6-booster', name:'Booster Roaring Skies', nameFr:'Booster Ciel Rugissant', type:'booster', setId:'xy6', setName:'Roaring Skies', series:'XY', releaseDate:'2015/05/06', price:'6.50€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Set très apprécié pour les Pokémon Dragon et les cartes Shaymin EX.', color:'#1a2a2a' },
  { id:'xy6-display', name:'Display Roaring Skies', nameFr:'Display Ciel Rugissant', type:'display', setId:'xy6', setName:'Roaring Skies', series:'XY', releaseDate:'2015/05/06', price:'195€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a2a' },

  // ─── xy5 — Primal Clash / Clash Primordial (2015) ─────────────
  { id:'xy5-booster', name:'Booster Primal Clash', nameFr:'Booster Clash Primordial', type:'booster', setId:'xy5', setName:'Primal Clash', series:'XY', releaseDate:'2015/02/04', price:'4.50€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a2a' },
  { id:'xy5-display', name:'Display Primal Clash', nameFr:'Display Clash Primordial', type:'display', setId:'xy5', setName:'Primal Clash', series:'XY', releaseDate:'2015/02/04', price:'148€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a2a' },

  // ─── xy4 — Phantom Forces / Forces Fantômes (2014) ────────────
  { id:'xy4-booster', name:'Booster Phantom Forces', nameFr:'Booster Forces Fantômes', type:'booster', setId:'xy4', setName:'Phantom Forces', series:'XY', releaseDate:'2014/11/05', price:'5.00€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#1a1a3a' },
  { id:'xy4-display', name:'Display Phantom Forces', nameFr:'Display Forces Fantômes', type:'display', setId:'xy4', setName:'Phantom Forces', series:'XY', releaseDate:'2014/11/05', price:'162€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a1a3a' },

  // ─── xy3 — Furious Fists / Poings Furieux (2014) ──────────────
  { id:'xy3-booster', name:'Booster Furious Fists', nameFr:'Booster Poings Furieux', type:'booster', setId:'xy3', setName:'Furious Fists', series:'XY', releaseDate:'2014/08/13', price:'3.80€', image:null, contents:{packs:1,cardsPerPack:10}, color:'#2a1a1a' },
  { id:'xy3-display', name:'Display Furious Fists', nameFr:'Display Poings Furieux', type:'display', setId:'xy3', setName:'Furious Fists', series:'XY', releaseDate:'2014/08/13', price:'128€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#2a1a1a' },

  // ─── xy2 — Flashfire / Torches Enflammées (2014) ──────────────
  { id:'xy2-booster', name:'Booster Flashfire', nameFr:'Booster Torches Enflammées', type:'booster', setId:'xy2', setName:'Flashfire', series:'XY', releaseDate:'2014/05/07', price:'5.00€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Set incluant le célèbre Charizard EX.', color:'#3a1a1a' },
  { id:'xy2-display', name:'Display Flashfire', nameFr:'Display Torches Enflammées', type:'display', setId:'xy2', setName:'Flashfire', series:'XY', releaseDate:'2014/05/07', price:'165€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#3a1a1a' },

  // ─── xy1 — XY base (2014) ─────────────────────────────────────
  { id:'xy1-booster', name:'Booster XY', nameFr:'Booster XY', type:'booster', setId:'xy1', setName:'XY', series:'XY', releaseDate:'2014/02/05', price:'5.50€', image:null, contents:{packs:1,cardsPerPack:10}, description:'Premier set de la génération XY. Introduit les cartes Mega EX.', color:'#1a2a1a' },
  { id:'xy1-display', name:'Display XY', nameFr:'Display XY', type:'display', setId:'xy1', setName:'XY', series:'XY', releaseDate:'2014/02/05', price:'172€', image:null, contents:{packs:36,cardsPerPack:10}, color:'#1a2a1a' },
  { id:'xy1-etb', name:'ETB XY', nameFr:'ETB XY', type:'etb', setId:'xy1', setName:'XY', series:'XY', releaseDate:'2014/02/05', price:'68€', image:null, contents:{packs:9,cardsPerPack:10,extras:['65 protège-cartes','45 cartes Énergie','accessoires']}, color:'#1a2a1a' },

];

export function getProductsByType(type) {
  if (type === 'all') return PRODUCTS;
  return PRODUCTS.filter((p) => p.type === type);
}

export function getProductsBySet(setId) {
  return PRODUCTS.filter((p) => p.setId === setId);
}
