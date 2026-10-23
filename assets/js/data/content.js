/**
 * ATELIER ARCHIVE — editorial, commerce config and seeded account content.
 * Tunisia only: domestic delivery, 19% TVA, prices in dinars.
 */
import { img, SOURCES, EDITORIAL } from './catalog.js';

export { img, SOURCES, EDITORIAL };

export const BRAND = {
  name: 'Atelier Archive',
  mark: 'A/A',
  tagline: 'The considered second life of clothing — Tunisia.',
  established: 2019,
  city: 'La Marsa, Tunis',
  email: 'studio@atelierarchive.tn',
  phone: '+216 71 774 220',
};

/* ------------------------------------------------------------------ *
 * Lookbooks
 * ------------------------------------------------------------------ */
export const LOOKBOOKS = [
  {
    id: 'lb-01',
    kicker: 'Lookbook 01',
    title: 'Faded Utility',
    subtitle: 'Canvas, duck cloth and the honest wear of a working decade.',
    note: '12 pieces · shot in La Marsa',
    image: img(SOURCES.utilityJacket),
    accent: 'from-stone-900/70',
  },
  {
    id: 'lb-02',
    kicker: 'Lookbook 02',
    title: 'Lambskin & Ink',
    subtitle: 'A single blazer, cut long and square, worn three ways.',
    note: '9 pieces · shot at dusk, Sidi Bou Saïd',
    image: img(SOURCES.leatherJacketMan),
    accent: 'from-zinc-900/70',
  },
  {
    id: 'lb-03',
    kicker: 'Lookbook 03',
    title: 'The Neutral Rail',
    subtitle: 'Oat, ecru, bone — a rail that refuses a wrong pairing.',
    note: '16 pieces · studio archive',
    image: img(SOURCES.creamRack),
    accent: 'from-amber-950/60',
  },
  {
    id: 'lb-04',
    kicker: 'Lookbook 04',
    title: 'Rust Season',
    subtitle: 'Seventies sienna against a colder palette.',
    note: '7 pieces · one of one',
    image: img(SOURCES.rustBomber),
    accent: 'from-orange-950/60',
  },
];

/* ------------------------------------------------------------------ *
 * Domestic delivery only — 24 governorates, grouped into six zones.
 * ------------------------------------------------------------------ */
export const VAT_RATE = 0.19;
export const FREE_SHIPPING_THRESHOLD = 250;
export const EXPRESS_SURCHARGE = 12;

export const SHIPPING_TIERS = {
  'grand-tunis': { label: 'Grand Tunis', rate: 7, min: 1, max: 2, courier: 'Aramex Tunisie', note: 'Same-day dispatch before 14:00.' },
  'north-east': { label: 'North-East', rate: 8, min: 2, max: 3, courier: 'First Delivery', note: 'Tracked, signature on delivery.' },
  'north-west': { label: 'North-West', rate: 9, min: 3, max: 4, courier: 'First Delivery', note: 'Tracked door-to-door.' },
  'centre-east': { label: 'Centre-East', rate: 8, min: 2, max: 3, courier: 'Aramex Tunisie', note: 'Tracked, signature on delivery.' },
  'centre-west': { label: 'Centre-West', rate: 9, min: 3, max: 4, courier: 'Rapid-Poste', note: 'Collected at your local post office if preferred.' },
  south: { label: 'South', rate: 11, min: 4, max: 6, courier: 'Rapid-Poste', note: 'Tracked; allow an extra day for Médenine and Tataouine.' },
};

export const GOVERNORATES = [
  { code: 'tunis', name: 'Tunis', tier: 'grand-tunis' },
  { code: 'ariana', name: 'Ariana', tier: 'grand-tunis' },
  { code: 'ben-arous', name: 'Ben Arous', tier: 'grand-tunis' },
  { code: 'manouba', name: 'Manouba', tier: 'grand-tunis' },
  { code: 'nabeul', name: 'Nabeul', tier: 'north-east' },
  { code: 'bizerte', name: 'Bizerte', tier: 'north-east' },
  { code: 'zaghouan', name: 'Zaghouan', tier: 'north-east' },
  { code: 'beja', name: 'Béja', tier: 'north-west' },
  { code: 'jendouba', name: 'Jendouba', tier: 'north-west' },
  { code: 'kef', name: 'Le Kef', tier: 'north-west' },
  { code: 'siliana', name: 'Siliana', tier: 'north-west' },
  { code: 'sousse', name: 'Sousse', tier: 'centre-east' },
  { code: 'monastir', name: 'Monastir', tier: 'centre-east' },
  { code: 'mahdia', name: 'Mahdia', tier: 'centre-east' },
  { code: 'sfax', name: 'Sfax', tier: 'centre-east' },
  { code: 'kairouan', name: 'Kairouan', tier: 'centre-west' },
  { code: 'kasserine', name: 'Kasserine', tier: 'centre-west' },
  { code: 'sidi-bouzid', name: 'Sidi Bouzid', tier: 'centre-west' },
  { code: 'gabes', name: 'Gabès', tier: 'south' },
  { code: 'medenine', name: 'Médenine', tier: 'south' },
  { code: 'tataouine', name: 'Tataouine', tier: 'south' },
  { code: 'gafsa', name: 'Gafsa', tier: 'south' },
  { code: 'tozeur', name: 'Tozeur', tier: 'south' },
  { code: 'kebili', name: 'Kébili', tier: 'south' },
];

export const SHIPPING_ZONES = Object.entries(SHIPPING_TIERS).map(([id, tier]) => ({
  id,
  country: `${tier.label} (${GOVERNORATES.filter((g) => g.tier === id).map((g) => g.name).join(', ')})`,
  ...tier,
}));

/* ------------------------------------------------------------------ *
 * Coupons — dinars
 * ------------------------------------------------------------------ */
export const COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, min: 0, blurb: '10% off your first order', expires: '2026-12-31' },
  { code: 'VAULT25', type: 'fixed', value: 25, min: 100, blurb: '25 DT off orders over 100 DT', expires: '2026-12-31' },
  { code: 'FREESHIP', type: 'shipping', value: 0, min: 0, blurb: 'Free delivery anywhere in Tunisia', expires: '2026-12-31' },
  { code: 'ARCHIVE15', type: 'percent', value: 15, min: 140, blurb: '15% off archive orders over 140 DT', expires: '2027-03-31' },
  { code: 'STUDENT12', type: 'percent', value: 12, min: 40, blurb: '12% student discount', expires: '2027-06-30' },
];

/* ------------------------------------------------------------------ *
 * Wallet
 * ------------------------------------------------------------------ */
export const VOUCHERS = [
  { id: 'v-1', code: 'WELCOME10', title: '10% welcome discount', detail: 'Applied to any first purchase.', value: '10%', expires: '31 Dec 2026', tone: 'amber' },
  { id: 'v-2', code: 'VAULT25', title: 'Vault access — 25 DT', detail: 'Unlocks on orders above 100 DT.', value: '25 DT', expires: '31 Dec 2026', tone: 'emerald' },
  { id: 'v-3', code: 'FREESHIP', title: 'Free delivery', detail: 'One use, any governorate, no minimum.', value: '1×', expires: '31 Dec 2026', tone: 'stone' },
  { id: 'v-4', code: 'STUDENT12', title: 'Student archive rate', detail: '12% off with a valid student card.', value: '12%', expires: '30 Jun 2027', tone: 'sky' },
];

export const REWARD_TIERS = [
  { name: 'Archive Circle', spend: 0, perks: ['Early access to every sale', 'Free delivery in Grand Tunis'] },
  { name: 'Atelier Member', spend: 300, perks: ['48h pre-launch windows', 'Annual repair credit'] },
  { name: 'Vault Keeper', spend: 900, perks: ['One held piece per drop', 'Private styling call'] },
];

/* ------------------------------------------------------------------ *
 * Seeded order history
 * ------------------------------------------------------------------ */
const isoDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const TUNIS_ADDRESS = {
  name: 'Amira Ben Salah',
  line1: '14 Rue de Marseille',
  line2: 'Appartement 3B',
  city: 'Tunis',
  region: 'Tunis',
  postal: '1000',
  gov: 'tunis',
};

export const SEED_ORDERS = [
  {
    id: 'AA-90412',
    placedAt: isoDaysAgo(32),
    status: 'Delivered',
    stage: 4,
    items: [
      { productId: 'aa-1780', qty: 1, price: 75 },
      { productId: 'aa-6610', qty: 1, price: 55 },
    ],
    shipping: { ...TUNIS_ADDRESS },
    courier: 'Aramex Tunisie',
    tracking: 'ARX-TN-4471820',
    totals: { subtotal: 130, shipping: 7, discount: 0, tax: 24.7, total: 161.7 },
    steps: [
      { label: 'Order placed', at: isoDaysAgo(32), done: true },
      { label: 'Checked in studio', at: isoDaysAgo(31), done: true },
      { label: 'In transit', at: isoDaysAgo(30), done: true },
      { label: 'Delivered', at: isoDaysAgo(29), done: true },
    ],
  },
  {
    id: 'AA-90877',
    placedAt: isoDaysAgo(15),
    status: 'In transit',
    stage: 2,
    items: [
      { productId: 'aa-4402', qty: 1, price: 115 },
      { productId: 'aa-8823', qty: 1, price: 65 },
    ],
    shipping: {
      name: 'Amira Ben Salah',
      line1: 'Résidence Les Palmiers, Bloc B',
      line2: '',
      city: 'Sousse',
      region: 'Sousse',
      postal: '4000',
      gov: 'sousse',
    },
    courier: 'First Delivery',
    tracking: 'FD-TN-918273645',
    totals: { subtotal: 180, shipping: 8, discount: 25, tax: 29.45, total: 192.45 },
    steps: [
      { label: 'Order placed', at: isoDaysAgo(15), done: true },
      { label: 'Checked in studio', at: isoDaysAgo(14), done: true },
      { label: 'In transit', at: isoDaysAgo(13), done: true },
      { label: 'Out for delivery', at: null, done: false },
    ],
  },
  {
    id: 'AA-91304',
    placedAt: isoDaysAgo(4),
    status: 'Processing',
    stage: 1,
    items: [{ productId: 'aa-2244', qty: 1, price: 110 }],
    shipping: { ...TUNIS_ADDRESS },
    courier: 'Aramex Tunisie',
    tracking: 'Pending assignment',
    totals: { subtotal: 110, shipping: 7, discount: 0, tax: 20.9, total: 137.9 },
    steps: [
      { label: 'Order placed', at: isoDaysAgo(4), done: true },
      { label: 'Checked in studio', at: null, done: false },
      { label: 'In transit', at: null, done: false },
      { label: 'Out for delivery', at: null, done: false },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Local store sales — high discounts, fixed dates, no tickets.
 * ------------------------------------------------------------------ */
const isoInDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const STORE_SALES = [
  {
    id: 'sale-1',
    store: 'Dar El Vintage',
    city: 'La Marsa',
    governorate: 'Tunis',
    address: '22 Avenue Habib Bourguiba, La Marsa',
    discount: 50,
    from: isoInDays(6),
    to: isoInDays(8),
    hours: '10:00 — 19:00',
    categories: ['Outerwear', 'Denim'],
    note: 'The whole winter rail at half price. Coats, truckers and workwear jackets only — no exclusions, no minimum.',
    image: img(EDITORIAL.boutiqueInterior),
    tier: 'flagship',
    phone: '+216 71 748 190',
  },
  {
    id: 'sale-2',
    store: 'Le Grenier de Sfax',
    city: 'Sfax',
    governorate: 'Sfax',
    address: 'Rue Habib Maazoun, Sfax Médina',
    discount: 45,
    from: isoInDays(13),
    to: isoInDays(15),
    hours: '09:30 — 18:30',
    categories: ['Knitwear', 'Shirts'],
    note: 'Archive knitwear and Japanese shirting, all single pieces. Bring cash — the card machine is unreliable.',
    image: img(EDITORIAL.creamRack),
    tier: 'flagship',
    phone: '+216 74 401 552',
  },
  {
    id: 'sale-3',
    store: 'Fripe & Co',
    city: 'Sousse',
    governorate: 'Sousse',
    address: 'Avenue Léopold Sénghor, Sousse 4000',
    discount: 35,
    from: isoInDays(20),
    to: isoInDays(22),
    hours: '10:00 — 20:00',
    categories: ['Denim', 'Trousers'],
    note: 'Denim wall rebuilt for the sale — 200+ pairs sorted by EU size, 28 to 46.',
    image: img(EDITORIAL.jeansWall),
    tier: 'partner',
    phone: '+216 73 220 884',
  },
  {
    id: 'sale-4',
    store: 'Maison Seconde',
    city: 'Tunis',
    governorate: 'Tunis',
    address: '6 Rue Sidi Ben Arous, Tunis Médina',
    discount: 40,
    from: isoInDays(27),
    to: isoInDays(29),
    hours: '11:00 — 19:00',
    categories: ['Knitwear', 'Accessories'],
    note: 'Mohair, lambswool and the good kind of pilling. Tea on the terrace while you try things on.',
    image: img(EDITORIAL.neutralRack),
    tier: 'partner',
    phone: '+216 71 562 043',
  },
  {
    id: 'sale-5',
    store: 'Atelier Nabeul',
    city: 'Nabeul',
    governorate: 'Nabeul',
    address: 'Rue Farhat Hached, Nabeul 8000',
    discount: 30,
    from: isoInDays(34),
    to: isoInDays(36),
    hours: '09:00 — 18:00',
    categories: ['Shirts', 'Trousers'],
    note: 'Everything in the shop, including the linen rail they usually refuse to discount.',
    image: img(EDITORIAL.warmStore),
    tier: 'partner',
    phone: '+216 72 285 661',
  },
  {
    id: 'sale-6',
    store: 'Souk Vintage Bizerte',
    city: 'Bizerte',
    governorate: 'Bizerte',
    address: '12 Rue d’Alger, Bizerte 7000',
    discount: 55,
    from: isoInDays(41),
    to: isoInDays(43),
    hours: '10:00 — 19:30',
    categories: ['Footwear', 'Accessories'],
    note: 'Sneakers and boots at more than half off. Sizes EU 36 to 46, cleaned and re-laced.',
    image: img(EDITORIAL.tanAf1),
    tier: 'flagship',
    phone: '+216 72 431 907',
  },
];

/* ------------------------------------------------------------------ *
 * Support
 * ------------------------------------------------------------------ */
export const FAQS = [
  {
    q: 'How is condition graded?',
    a: 'Every piece is inspected by two people against a 40-point rubric. <strong>Vault</strong> means archive-grade and effectively unworn. <strong>Excellent</strong> means light wear with no structural issues. <strong>Good</strong> means honest, visible wear that is fully wearable and photographed in detail. Anything below our Good standard never reaches the floor.',
    tag: 'Grading',
  },
  {
    q: 'Do you use European sizes?',
    a: 'Yes — every listing is in EU sizing (36 to 56, plus taille unique). Measurements are taken flat, by hand, in centimetres: chest pit-to-pit, length from high point shoulder, sleeve from shoulder seam. Expect ±1 cm of tolerance. Vintage cuts run smaller than modern ones, so if you are between sizes, size up.',
    tag: 'Sizing',
  },
  {
    q: 'Where do you deliver?',
    a: 'Everywhere in Tunisia — all 24 governorates. Grand Tunis arrives in 1–2 working days, the coast in 2–3, inland in 3–4, and the south in 4–6. Delivery is 7 to 11 DT depending on the zone, and free above 250 DT. We do not ship abroad.',
    tag: 'Delivery',
  },
  {
    q: 'Can I pay cash on delivery?',
    a: 'Yes. Cash on delivery is available in every governorate and is what most of our buyers use. You can also pay by card at checkout. Nothing is charged until the piece is picked and checked in the studio.',
    tag: 'Payment',
  },
  {
    q: 'How do returns work?',
    a: 'Fourteen days, free return via Aramex or Rapid-Poste, and exchanges are free. The piece must come back in the condition it arrived, with its authentication card. Vault pieces are final sale but can be exchanged within 7 days.',
    tag: 'Returns',
  },
  {
    q: 'What are the store sales?',
    a: 'Six times a season, partner shops across Tunisia run deep discounts for a fixed set of dates — 30% to 55% off. We list them here with the address, the hours and exactly what is included. No tickets, no RSVP: you simply walk in during the dates.',
    tag: 'Sales',
  },
  {
    q: 'Do you hold items in my bag?',
    a: 'Bag items are reserved for 30 minutes once you begin checkout. Because most pieces are one of one, we cannot extend holds — but we will call or message you if a piece you were viewing sells.',
    tag: 'Checkout',
  },
  {
    q: 'How should I care for vintage knitwear?',
    a: 'Cold hand-wash with a pH-neutral soap, never wring, and dry flat on a towel away from direct sun. Store folded with cedar. Every order includes our care card with fibre-specific notes in French and Arabic.',
    tag: 'Care',
  },
];

export const SUPPORT_CHANNELS = [
  { title: 'Live chat', detail: 'Average reply under 2 minutes', action: 'chat', meta: 'Mon–Sat, 9:00–20:00' },
  { title: 'Email the studio', detail: BRAND.email, action: 'email', meta: 'Replies within one business day' },
  { title: 'Call us', detail: BRAND.phone, action: 'phone', meta: 'Mon–Fri, 10:00–18:00' },
];

/* ------------------------------------------------------------------ *
 * Social proof
 * ------------------------------------------------------------------ */
export const TESTIMONIALS = [
  {
    quote: 'The jacket arrived with a card noting the exact stitch repair they made. Nobody does that here.',
    name: 'Nour B.',
    role: 'Collector, La Marsa',
    avatar: img(SOURCES.portraitCurly),
    rating: 5,
  },
  {
    quote: 'I have bought eleven pieces. The measurements in centimetres have been wrong exactly zero times.',
    name: 'Yassine T.',
    role: 'Stylist, Sousse',
    avatar: img(SOURCES.portraitHoodie),
    rating: 5,
  },
  {
    quote: 'Cash on delivery, delivered to Sfax in two days, exactly as photographed. That is the whole review.',
    name: 'Amira K.',
    role: 'Designer, Sfax',
    avatar: img(SOURCES.portraitCurly),
    rating: 5,
  },
];

export const TRUST_MARKS = [
  { label: 'Delivery across Tunisia', detail: 'All 24 governorates, 1–6 days' },
  { label: 'Cash on delivery', detail: 'Pay the courier, not in advance' },
  { label: '14-day free returns', detail: 'Aramex or Rapid-Poste pickup' },
  { label: 'One of one, always', detail: 'Nothing is re-listed twice' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'New arrivals', href: '#/catalog?sort=new' },
      { label: 'Individual sellers', href: '#/catalog?soldBy=individual' },
      { label: 'Outerwear', href: '#/catalog?category=Outerwear' },
      { label: 'Denim', href: '#/catalog?category=Denim' },
      { label: 'The Vault', href: '#/catalog?condition=Vault' },
    ],
  },
  {
    title: 'Atelier',
    links: [
      { label: 'Our sourcing', href: '#/support' },
      { label: 'Sell a piece', href: '#/support' },
      { label: 'Condition guide', href: '#/support' },
      { label: 'Store sales', href: '#/sales' },
    ],
  },
  {
    title: 'Care',
    links: [
      { label: 'Delivery in Tunisia', href: '#/support' },
      { label: 'Returns & exchanges', href: '#/support' },
      { label: 'Sizes & measurements', href: '#/support' },
      { label: 'Contact the studio', href: '#/support' },
    ],
  },
];

export const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', handle: '@atelierarchive.tn' },
  { label: 'Facebook', href: 'https://facebook.com', handle: '/atelierarchive.tn' },
  { label: 'Pinterest', href: 'https://pinterest.com', handle: '/atelierarchive' },
];

/** Chat assistant canned intelligence. */
export const CHAT_SCRIPT = [
  { match: /livraison|deliver|ship|arrive|track|gouvernorat|sfax|sousse/i, reply: 'We deliver to all 24 governorates: 1–2 days in Grand Tunis, 2–3 on the coast, 3–4 inland, 4–6 in the south. Delivery is 7–11 DT and free above 250 DT. I can check your governorate exactly if you tell me which one.' },
  { match: /cash|paiement|pay|dinar|card|checkout/i, reply: 'Cash on delivery is available everywhere in Tunisia — you pay the courier. Card payment works at checkout too. Nothing is charged before the piece is checked in the studio.' },
  { match: /size|taille|fit|measure|cm|europe/i, reply: 'Everything is EU sizing, 36 to 56 plus taille unique, with flat measurements in centimetres. Tell me your usual EU size and the piece you are eyeing, and I will tell you how it sits — vintage cuts run small.' },
  { match: /return|refund|exchange|retour/i, reply: 'Fourteen days, free return, and exchanges are free too. Vault pieces are final sale but exchangeable within 7 days. I can arrange a pickup with Aramex or Rapid-Poste.' },
  { match: /condition|grade|vault|excellent|good|état/i, reply: 'Vault is unworn archive-grade. Excellent is light wear, structurally perfect. Good is honest visible wear, photographed in detail. Nothing below Good makes it to the floor.' },
  { match: /coupon|discount|code|promo|promo|solde/i, reply: 'Try WELCOME10 for 10% off your first order, or VAULT25 for 25 DT off over 200 DT. FREESHIP removes delivery anywhere in Tunisia. All of them validate live in the checkout field.' },
  { match: /sale|store|shop|magasin|solde|boutique/i, reply: 'Store sales are our local partners running 30–55% off for fixed dates. The Store Sales tab has the address, hours and exactly what is included — no ticket needed, you just walk in.' },
  { match: /hello|hi\b|hey|bonjour|salut|salam/i, reply: 'Ahla — I am Wren, the studio assistant. Ask me about sizing, condition grades, delivery times, store sales or an order you are waiting on.' },
  { match: /price|prix|cost|how much|dinar/i, reply: 'Pieces run from 45 DT to 150 DT. Retail comparisons are on every card — the average saving across the current floor is 47%.' },
];

export const CHAT_FALLBACK =
  'I have noted that for the studio team. In the meantime: sizing in EU, delivery times, cash on delivery, coupons and returns are all things I can answer instantly — and a human replies within two minutes during studio hours.';
