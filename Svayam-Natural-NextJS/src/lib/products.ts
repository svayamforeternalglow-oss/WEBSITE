export type ProductTheme = 'herbal' | 'skincare' | 'beauty' | 'food' | 'wellness' | 'moon' | 'sun';

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  category: string;
  theme: ProductTheme;
  price: number;
  originalPrice: number;
  weight: string;
  sku: string;
  image: string;
  images?: string[];
  badges: string[];
  concerns?: string[];
  ingredients: { name: string; icon: string; description: string }[];
  benefits: { title: string; description: string; icon: string }[];
  howToUse?: string;
}

export const CATEGORY_THEMES: Record<string, ProductTheme> = {
  'hair-care': 'herbal',
  'skin-care': 'skincare',
  'body-care': 'skincare',
  'beauty-products': 'beauty',
  'natural-food': 'food',
  'wellness': 'wellness',
};

export const products: Product[] = [
  {
    slug: 'kesh-samraksha',
    name: 'Kesh Samraksha',
    tagline: 'Unlock The Secret to Luscious Locks',
    description: 'Nourishing hair pack enriched with 5 potent Ayurvedic herbs to promote hair growth, reduce hair fall, and add salon-worthy shine naturally.',
    story: 'Born from generations of Ayurvedic wisdom, each herb in Kesh Samraksha is hand-selected from organic farms across India. Our master herbalist spent two years perfecting the sacred ratio of Amla to Bhringraj — the same formula that once graced the royal courts of ancient India. Every application is a ritual that reconnects you with nature\'s deepest healing traditions.',
    category: 'hair-care',
    theme: 'herbal',
    price: 399,
    originalPrice: 699,
    weight: '100g',
    sku: 'SN-HC-KSH-100',
    image: '/images/kesh-samraksha/1.jpeg',
    images: ['/images/kesh-samraksha/1.jpeg', '/images/kesh-samraksha/2.jpeg', '/images/kesh-samraksha/3.jpeg'],
    badges: ['5 Potent Herbs', 'All Hair Types', 'Salon Shine', 'No Chemicals'],
    concerns: ['dry-skin'],
    ingredients: [
      { name: 'Amla', icon: '🌿', description: 'The ultimate hair rejuvenator from ancient Ayurveda, rich in Vitamin C for strength and shine.' },
      { name: 'Hibiscus', icon: '🌺', description: 'Nature\'s conditioner that prevents premature greying and adds silky smoothness.' },
      { name: 'Bhringraj', icon: '🍃', description: 'The "King of Herbs" for hair — revitalizes dormant follicles and promotes dense growth.' },
      { name: 'Nagarmotha', icon: '🌾', description: 'An earthy root that deeply cleanses the scalp and removes toxins naturally.' },
      { name: 'Shikakai', icon: '🌱', description: 'Nature\'s gentle cleanser, used for centuries to wash hair without stripping natural oils.' },
    ],
    benefits: [
      { title: 'Silky Smoothness', description: 'Transform rough, dry hair into touchably smooth strands.', icon: '✨' },
      { title: 'Brilliant Shine', description: 'Restore natural lustre that rivals professional salon treatments.', icon: '💫' },
      { title: 'Root Strength', description: 'Fortify hair from root to tip, reducing breakage by up to 40%.', icon: '💪' },
      { title: 'All-in-One Care', description: 'Addresses hair fall, dandruff, dryness, and dullness in one formula.', icon: '🌿' },
      { title: 'Easy to Use', description: 'Simple application ritual that fits seamlessly into your routine.', icon: '⏱️' },
      { title: '100% Natural', description: 'Free from sulfates, parabens, silicones, and artificial fragrances.', icon: '🍃' },
    ],
    howToUse: 'Mix the powder with water or curd to form a smooth paste. Apply evenly from roots to tips. Leave for 20-30 minutes. Rinse with lukewarm water and a mild shampoo.',
  },
  {
    slug: 'hibiscus-hair-gel',
    name: 'Hibiscus Hair Gel',
    tagline: 'Style Naturally, Shine Brilliantly',
    description: 'Natural hair styling gel infused with hibiscus extract. Strong hold without stiffness, conditions while styling.',
    story: 'In the misty gardens of Kerala, hibiscus flowers bloom in wild abundance — each petal a reservoir of natural conditioning proteins. We harvest at dawn when the flowers hold maximum potency, cold-pressing them into a gel that styles your hair while treating it. This is not just a product; it\'s a morning ritual that transforms your day.',
    category: 'hair-care',
    theme: 'herbal',
    price: 259,
    originalPrice: 449,
    weight: '150g',
    sku: 'SN-HC-HBG-150',
    image: '/images/hibiscus-gel-marketing.png',
    badges: ['Strong Hold', 'Non-Sticky', 'No Alcohol', 'Conditions Hair'],
    concerns: [],
    ingredients: [
      { name: 'Hibiscus Extract', icon: '🌺', description: 'Rich in amino acids and vitamins that nourish hair while providing natural hold.' },
      { name: 'Aloe Vera', icon: '🌿', description: 'Hydrates and soothes the scalp, preventing dryness and flaking.' },
      { name: 'Glycerin', icon: '💧', description: 'Natural humectant that locks in moisture for all-day softness.' },
    ],
    benefits: [
      { title: 'Define Curls', description: 'Shape and define curls naturally without crunchiness.', icon: '🌀' },
      { title: 'Add Volume', description: 'Lift flat hair with lightweight, buildable hold.', icon: '✨' },
      { title: 'Control Frizz', description: 'Tame flyaways and keep your style smooth all day.', icon: '💫' },
      { title: 'Deep Moisture', description: 'Hydrate while you style — no drying alcohols.', icon: '💧' },
    ],
    howToUse: 'Apply a small amount to damp or dry hair. Style as desired. Build hold by layering.',
  },
  {
    slug: 'lavanyam-facepack',
    name: 'Lavanyam Face Pack',
    tagline: 'Discover The Power of Nature',
    description: 'Traditional Ayurvedic face pack for radiant, glowing skin. Combines turmeric, sandalwood, and multani mitti to cleanse, brighten, and rejuvenate.',
    story: 'Lavanyam — Sanskrit for "radiance" — draws from a 500-year-old family recipe passed down through generations of Ayurvedic practitioners. Each ingredient is sourced from trusted growers: turmeric from the hills of Erode, sandalwood from the forests of Mysore, multani mitti from the riverbeds of Rajasthan. Together, they create a mask that doesn\'t just clean your skin — it transforms it.',
    category: 'skin-care',
    theme: 'skincare',
    price: 499,
    originalPrice: 699,
    weight: '100g',
    sku: 'SN-SC-LAV-100',
    image: '/images/lavanyam/1.jpeg',
    images: ['/images/lavanyam/1.jpeg', '/images/lavanyam/2.jpeg', '/images/lavanyam/3.jpeg'],
    badges: ['Pure Organic', 'Radiant Glow', 'All Skin Types', 'No Chemicals'],
    concerns: ['pigmentation', 'glow-radiance'],
    ingredients: [
      { name: 'Multani Mitti', icon: '🏔️', description: 'Nature\'s clay that draws out impurities and excess oil, leaving skin fresh and balanced.' },
      { name: 'Chandan', icon: '🪵', description: 'Revered for centuries for its cooling, anti-inflammatory, and complexion-brightening properties.' },
      { name: 'Haldi', icon: '🌼', description: 'The golden spice of Ayurveda — fights bacteria, reduces scars, and brings natural glow.' },
      { name: 'Rose Petals', icon: '🌹', description: 'Gentle astringent that tones pores and infuses skin with a delicate fragrance.' },
      { name: 'Orange Peel', icon: '🍊', description: 'Rich in Vitamin C, it brightens dull skin and promotes cell renewal.' },
    ],
    benefits: [
      { title: 'Deep Cleanse', description: 'Removes impurities from deep within pores for truly clean skin.', icon: '✨' },
      { title: 'Radiant Glow', description: 'Unveil your natural luminosity after just one application.', icon: '💫' },
      { title: 'Even Tone', description: 'Reduce pigmentation and dark spots for a balanced complexion.', icon: '🌟' },
      { title: 'Anti-Aging', description: 'Tighten pores and improve elasticity for youthful-looking skin.', icon: '⏳' },
      { title: 'All Skin Types', description: 'Gentle enough for sensitive skin, effective on oily skin.', icon: '🌿' },
      { title: 'Easy Application', description: 'Mix with water or rose water for a spa experience at home.', icon: '🧖' },
    ],
    howToUse: 'Mix powder with water or rose water to form a smooth paste. Apply evenly on face and neck. Leave for 15-20 minutes. Rinse with lukewarm water.',
  },
  {
    slug: 'suryakanti-day-cream',
    name: 'Suryakanti Day Cream',
    tagline: 'Awaken your skin with the brilliance of the sun.',
    description: 'Rise and glow with Suryakanti Day Cream, a luxurious daytime formulation that nourishes, protects, and illuminates your skin with the power of ancient botanicals. This radiant blend is infused with Ashwagandha extract, a revered adaptogen known to combat environmental stress, boost collagen, and restore youthful firmness back to the skin; it acts as a natural shield against fatigue and pollution.',
    story: 'Suryakanti — "the radiance of the sun" — is more than a day cream. It is a sacred offering to your skin, prepared with the powerful chants of Aditya Hridayam and Surya Sahastranamavali, the ancient hymns that invoke the healing brilliance of Surya. As Kashmiri saffron meets the Golden Nalapamaradi Infusion, the preparation is suffused with mantras that capture the sun\'s vital energy in every jar. This is not mere skincare — it is a daily ritual of radiance, designed to combat pigmentation and dullness by channelling the sun\'s life-giving warmth through centuries of Vedic wisdom.',
    category: 'skin-care',
    theme: 'sun',
    price: 999,
    originalPrice: 1299,
    weight: '50g',
    sku: 'SN-SC-SRK-050',
    image: '/images/suryakanti-day-creme.png',
    badges: ['Light Weight, Non Greasy with Intense Hydration', 'Saffron Infused – Soothes Inflammation', '12 hour moisture – effectively reduces tanning and pigmentation'],
    concerns: ['pigmentation', 'anti-ageing', 'glow-radiance', 'sun-protection'],
    ingredients: [
      { name: 'Golden Nalapamaradi infusion', icon: '🌿', description: 'Rich in turmeric and vetiver; natural brightener and complexion enhancer.' },
      { name: 'Manjishtha concentrate', icon: '🌸', description: 'Celebrated in Ayurveda for detoxifying properties; helps purify the skin from within.' },
      { name: 'Aloe Vera', icon: '🌿', description: 'Soothes your skin, cool and balanced throughout the day.' },
      { name: 'Ashwagandha extract', icon: '🌱', description: 'Revered adaptogen; combats environmental stress, boosts collagen, restores youthful firmness; natural shield against fatigue and pollution.' },
    ],
    benefits: [
      { title: 'Sun Protection', description: 'Effectively reduces pigmentation and tanning.', icon: '☀️' },
      { title: 'Bright Skin Tone', description: 'Saffron works to even out complexion over time.', icon: '✨' },
      { title: 'Anti-Aging', description: 'Reduces fine lines with powerful antioxidant protection.', icon: '⏳' },
      { title: 'Lightweight Feel', description: 'Non-greasy formula absorbs instantly — perfect under makeup.', icon: '🪶' },
      { title: 'Zero chemicals and Synthetic Fragrance', description: 'Pure, natural formulation free from harsh chemicals and artificial fragrances.', icon: '🌿' },
    ],
    howToUse: 'Apply to clean face and neck every morning. Best results after Tarunya Rose.',
  },
  {
    slug: 'chandraprabha-night-nectar',
    name: 'Chandraprabha Night Nectar',
    tagline: 'Awaken to Renewed Radiance',
    description: 'Intensive night repair cream that is crafted to restore, illuminate and rejuvenate your skin while you sleep. Indulge in the celestial luxury of Chandraprabha Night Nectar that melts into your skin, leaving it plump, dewy, and visibly renewed by morning.',
    story: 'Chandraprabha — "the glow of the moon" — captures the celestial beauty of moonlight in a jar. Prepared exclusively on the night of the full moon, this sacred night nectar is crafted under the soothing resonance of ancient mantra chants. As the moonflower blooms only in the silver light of Purnima, our artisans blend its precious extract with modern peptides, creating a cream that carries the moon\'s regenerative energy. Each application is a midnight ritual — your skin heals, renews, and awakens with the luminous radiance of Moon.',
    category: 'skin-care',
    theme: 'moon',
    price: 999,
    originalPrice: 1299,
    weight: '50g',
    sku: 'SN-SC-CHP-050',
    image: '/images/chandraprabha-night-necter.png',
    badges: ['Overnight Repair', 'Soften Fine Lines', 'Deep Nourishment', 'Removes Pigmentation', 'Radiant Even Toned Complexion'],
    concerns: ['anti-ageing', 'night-care'],
    ingredients: [
      { name: 'Kumkumadi elixir', icon: '🌙', description: 'A golden ayurvedic blend revered for its transformative powers.' },
      { name: 'Aloe Vera', icon: '🌿', description: 'The Cooling Touch – Calms Inflammation.' },
      { name: 'Saffron', icon: '🌸', description: 'The golden treasure of Kashmir that brightens skin tone and fights oxidative damage.' },
    ],
    benefits: [
      { title: 'Wrinkle Repair', description: 'Visibly reduces fine lines and wrinkles overnight.', icon: '✨' },
      { title: 'Firm & Lift', description: 'Peptides boost collagen for tighter, more elastic skin.', icon: '💫' },
      { title: 'Intense Hydration', description: 'Hyaluronic acid delivers deep, lasting moisture.', icon: '💧' },
      { title: 'Morning Radiance', description: 'Wake up to visibly brighter, refreshed skin.', icon: '🌅' },
    ],
    howToUse: 'Apply generously on clean face and neck before bed. Massage gently until absorbed.',
  },
  {
    slug: 'glowup-night-gel',
    name: 'Soumya - The touch of silk Body lotion',
    tagline: 'Lightweight Care for Luminous Mornings',
    description: 'Lightweight body lotion that hydrates without clogging pores. Contains niacinamide and tea tree oil.',
    story: 'Created specifically for India\'s humid climate, GlowUp is the answer for those who want nighttime skincare without the heaviness. We combined niacinamide — the scientifically proven pore minimizer — with tea tree oil from the organic plantations of Nilgiris. It\'s the gel that works while you sleep, so oily skin finally gets the care it deserves.',
    category: 'body-care',
    theme: 'skincare',
    price: 595,
    originalPrice: 595,
    weight: '50g',
    sku: 'SN-SC-GLU-050',
    image: '/images/glowup-night-gel.jpeg',
    badges: ['Oil-Free', 'Non-Comedogenic', 'Niacinamide', 'Lightweight'],
    concerns: ['dry-skin', 'night-care'],
    ingredients: [
      { name: 'Niacinamide', icon: '🧪', description: 'Vitamin B3 that minimizes pores, controls oil, and evens skin tone.' },
      { name: 'Tea Tree Oil', icon: '🌿', description: 'Natural antibacterial that prevents breakouts without irritation.' },
      { name: 'Green Tea Extract', icon: '🍵', description: 'Antioxidant powerhouse that protects skin from environmental damage.' },
    ],
    benefits: [
      { title: 'Oil Control', description: 'Regulates sebum production for a matte, fresh look.', icon: '✨' },
      { title: 'Pore Minimizer', description: 'Niacinamide visibly tightens and refines pores.', icon: '🔍' },
      { title: 'Breakout Prevention', description: 'Tea tree oil keeps acne-causing bacteria at bay.', icon: '🛡️' },
      { title: 'Soothing Hydration', description: 'Lightweight gel that hydrates without any greasy residue.', icon: '💧' },
    ],
    howToUse: 'Apply on clean face every night. Let it absorb completely before sleeping.',
  },
  {
    slug: 'rose-lip-balm',
    name: 'Rose Lip Balm',
    tagline: 'Soft Petals for Softer Lips',
    description: 'Nourishing lip balm with natural rose extract. Moisturizes and protects lips from dryness with a natural tint.',
    story: 'From the rose gardens of Pushkar comes this delicate balm — crafted from petals harvested at first light when their oil content peaks. We blend them with beeswax and shea butter using a slow-infusion process that preserves every drop of nature\'s moisture. The result is a balm that doesn\'t just protect your lips — it adorns them with a whisper of natural rose.',
    category: 'beauty-products',
    theme: 'beauty',
    price: 370,
    originalPrice: 499,
    weight: '10g',
    sku: 'SN-BP-RLB-010',
    image: '/images/rose-lip-balm.jpeg',
    badges: ['Natural Rose', 'SPF 15', 'Tinted', 'Long-Lasting'],
    concerns: ['dry-skin'],
    ingredients: [
      { name: 'Rose Extract', icon: '🌹', description: 'Natural moisturizer with a delicate fragrance and gentle pink tint.' },
      { name: 'Beeswax', icon: '🐝', description: 'Creates a breathable protective barrier against harsh weather.' },
      { name: 'Shea Butter', icon: '🌿', description: 'Ultra-rich emollient that heals and softens chapped lips.' },
      { name: 'Vitamin E', icon: '💛', description: 'Antioxidant that protects delicate lip skin from aging.' },
    ],
    benefits: [
      { title: 'Prevents Chapping', description: 'Beeswax barrier keeps lips soft even in harsh weather.', icon: '🛡️' },
      { title: 'Natural Tint', description: 'A subtle rose pink that enhances your natural lip color.', icon: '🌹' },
      { title: 'Silky Soft', description: 'Shea butter deeply conditions for pillow-soft lips.', icon: '✨' },
      { title: 'Sun Protection', description: 'SPF 15 shields lips from UV damage.', icon: '☀️' },
    ],
    howToUse: 'Apply directly to lips as needed throughout the day.',
  },
  {
    slug: 'tejasamrit',
    name: 'Tejasamrit Golden Night Ritual',
    tagline: 'Seven Sacred Ingredients, One Radiant You',
    description: 'Multi-purpose beauty formulation for face, hair, and body. Enriched with 7 precious ingredients for deep nourishment and radiance.',
    story: 'Tejasamrit — "the essence of radiance" — is a modern take on the ancient practice of Abhyanga, the Ayurvedic oil ritual. We blend seven of the world\'s most precious oils: argan from Morocco, jojoba from Arizona, rosehip from Chile, combined with Indian sesame, coconut, almond, and Vitamin E. Each drop carries the wisdom of multiple healing traditions, unified into one luxurious oil.',
    category: 'beauty-products',
    theme: 'beauty',
    price: 299,
    originalPrice: 999,
    weight: '30ml',
    sku: 'SN-BP-TJA-030',
    image: '/images/tejasamrit.png',
    badges: ['7 Precious Oils', 'Multi-Purpose', 'Fast-Absorbing', 'Anti-Aging'],
    concerns: ['glow-radiance'],
    ingredients: [
      { name: 'Argan Oil', icon: '🌰', description: 'Moroccan liquid gold rich in fatty acids and Vitamin E.' },
      { name: 'Jojoba Oil', icon: '🌿', description: 'Mimics skin\'s natural sebum for perfect, balanced hydration.' },
      { name: 'Rosehip Oil', icon: '🌹', description: 'Powerhouse of Vitamin A and C for scar healing and brightening.' },
      { name: 'Almond Oil', icon: '🥜', description: 'Lightweight emollient that improves skin elasticity.' },
    ],
    benefits: [
      { title: 'Deep Nourishment', description: 'Penetrates all skin layers for complete hydration.', icon: '💧' },
      { title: 'Improved Elasticity', description: 'Restores skin\'s bounce and firmness over time.', icon: '✨' },
      { title: 'Natural Glow', description: 'Imparts a healthy, dewy radiance from within.', icon: '💫' },
      { title: 'Scar Reduction', description: 'Rosehip and Vitamin E work together to fade marks.', icon: '🌿' },
    ],
    howToUse: 'Apply a few drops on face, hair, or body. Massage gently until absorbed. Use morning or night.',
  },
  {
    slug: 'triphala-detox',
    name: 'Triphala Detox Tea',
    tagline: 'Cleanse From Within and Glow Outside',
    description: 'Ayurvedic herbal tea blend for natural detoxification. Combines triphala with ginger and tulsi for digestive health.',
    story: 'Triphala — the "three fruits" — has been the cornerstone of Ayurvedic medicine for over 2,000 years. Our blend honors this tradition while making it accessible for modern life. We source Amalaki from Madhya Pradesh, Bibhitaki from Chhattisgarh, and Haritaki from the Himalayan foothills. A morning cup is not just tea; it\'s a 2,000-year-old cleansing ritual in your hands.',
    category: 'natural-food',
    theme: 'food',
    price: 250,
    originalPrice: 399,
    weight: '100g',
    sku: 'SN-NF-TDT-100',
    image: '/images/triphala-detox-powder.png',
    badges: ['Natural Detox', 'Triphala Blend', 'No Caffeine', '30 Servings'],
    concerns: [],
    ingredients: [
      { name: 'Amalaki', icon: '🟢', description: 'Indian gooseberry packed with Vitamin C for immunity and digestion.' },
      { name: 'Bibhitaki', icon: '🟤', description: 'Rejuvenative fruit that cleanses and nourishes simultaneously.' },
      { name: 'Haritaki', icon: '🌿', description: 'The "King of Medicines" in Ayurveda — promotes complete digestive health.' },
      { name: 'Ginger', icon: '🫚', description: 'Warming root that ignites digestive fire and soothes the stomach.' },
      { name: 'Tulsi', icon: '🌱', description: 'Sacred basil that boosts immunity and calms the mind.' },
    ],
    benefits: [
      { title: 'Natural Cleanse', description: 'Gently detoxifies the digestive system without harsh effects.', icon: '🌿' },
      { title: 'Better Digestion', description: 'Improves gut health and nutrient absorption.', icon: '💫' },
      { title: 'Immunity Boost', description: 'Rich in antioxidants that strengthen your natural defenses.', icon: '🛡️' },
      { title: 'Inner Balance', description: 'Balances all three doshas for holistic well-being.', icon: '☯️' },
    ],
    howToUse: 'Add 1 teaspoon to a cup of hot water. Steep for 5 minutes. Drink warm, preferably in the morning.',
  },
  {
    slug: 'gulkand',
    name: 'Gulkand Rose Preserve',
    tagline: 'A Jar of Ancient Sweetness',
    description: 'Traditional sweet rose petal preserve. Natural coolant with digestive benefits. Made from organic rose petals and sugar.',
    story: 'Gulkand — from the Persian "gul" (flower) and "qand" (sweet) — was once the prized delicacy of Mughal emperors. Our recipe follows the traditional sun-curing method: organic Damask rose petals are layered with sugar in glass jars and left to mature under the Indian sun for 30 days. This slow alchemy transforms petals into a preserve that cools the body, aids digestion, and tastes like bottled happiness.',
    category: 'natural-food',
    theme: 'food',
    price: 450,
    originalPrice: 599,
    weight: '200g',
    sku: 'SN-NF-GKD-200',
    image: '/images/gulkand/1.jpeg',
    images: ['/images/gulkand/1.jpeg', '/images/gulkand/2.jpeg'],
    badges: ['Sun-Cured', 'Natural Coolant', 'No Preservatives', 'Traditional Recipe'],
    concerns: [],
    ingredients: [
      { name: 'Organic Rose Petals', icon: '🌹', description: 'Damask roses, handpicked at dawn for maximum fragrance and potency.' },
      { name: 'Sugar', icon: '🍬', description: 'Natural cane sugar that preserves and enhances the rose essence.' },
      { name: 'Cardamom', icon: '🌿', description: 'The queen of spices adds a subtle warmth and aids digestion.' },
    ],
    benefits: [
      { title: 'Natural Coolant', description: 'Reduces body heat — perfect for Indian summers.', icon: '❄️' },
      { title: 'Digestive Aid', description: 'Soothes the stomach and improves gut function.', icon: '💫' },
      { title: 'Refreshing Taste', description: 'Delicate rose flavor that delights with every spoonful.', icon: '🌹' },
      { title: 'Antioxidant Rich', description: 'Rose petals are packed with skin and health-boosting antioxidants.', icon: '✨' },
    ],
    howToUse: 'Consume 1-2 teaspoons with milk or water. Can be added to desserts, paan, or smoothies.',
  },
  {
    slug: 'abhyanga-udvartana',
    name: 'Abhyanga Udvartana Oil',
    tagline: 'The Ancient Art of Self-Massage',
    description: 'Traditional Ayurvedic massage oil for body detoxification. Warming blend of herbs to improve circulation and skin texture.',
    story: 'Abhyanga — the Ayurvedic practice of warm oil massage — is described in the Charaka Samhita as "the most nourishing ritual one can offer the body." Our Udvartana oil is formulated for this sacred practice. Warming sesame oil is infused with detoxifying herbs over a slow 72-hour process, creating an oil that doesn\'t just massage — it heals. Each session is a conversation between your hands and your body\'s deepest tissues.',
    category: 'wellness',
    theme: 'wellness',
    price: 370,
    originalPrice: 849,
    weight: '200ml',
    sku: 'SN-WL-ABH-200',
    image: '/images/abhyanga/1.jpeg',
    images: ['/images/abhyanga/1.jpeg', '/images/abhyanga/2.jpeg', '/images/abhyanga/3.jpeg'],
    badges: ['Ayurvedic Formula', 'Warming', 'Detoxifying', 'Improves Circulation'],
    concerns: ['dry-skin'],
    ingredients: [
      { name: 'Sesame Oil', icon: '🫒', description: 'The traditional Ayurvedic base oil — warming, nourishing, deeply penetrating.' },
      { name: 'Mustard Oil', icon: '🌻', description: 'Stimulates blood flow and warms muscles for effective massage.' },
      { name: 'Triphala', icon: '🌿', description: 'Three-fruit blend that detoxifies through the skin.' },
      { name: 'Turmeric', icon: '🌼', description: 'Anti-inflammatory golden spice that soothes joints and skin.' },
    ],
    benefits: [
      { title: 'Skin Toning', description: 'Improves skin texture and reduces the appearance of cellulite.', icon: '✨' },
      { title: 'Circulation Boost', description: 'Warming herbs improve blood flow and lymphatic drainage.', icon: '💫' },
      { title: 'Muscle Relief', description: 'Relaxes tight muscles and eases daily tension.', icon: '💪' },
      { title: 'Deep Detox', description: 'Herbs draw toxins out through the skin during massage.', icon: '🌿' },
    ],
    howToUse: 'Warm oil slightly. Massage vigorously in upward strokes over the entire body. Leave for 15-20 minutes. Shower with warm water.',
  },
  // Placeholder products (mock images) from client catalog
  { slug: 'complete-radiance-kit', name: 'The Complete Radiance Kit', tagline: 'Your complete skincare ritual', description: 'A curated kit for radiant skin.', story: '', category: 'beauty-products', theme: 'beauty', price: 0, originalPrice: 0, weight: '', sku: 'SN-KIT-CRK', image: '/images/lifestyle-pamper.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'hair-care-kit', name: 'Hair care kit', tagline: 'Complete hair care solution', description: 'Everything you need for healthy hair.', story: '', category: 'hair-care', theme: 'herbal', price: 0, originalPrice: 0, weight: '', sku: 'SN-KIT-HC', image: '/images/hibiscus-gel-marketing.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'tejasamrit-golden-latte-family-pack', name: 'Tejasamrit Golden latte family pack', tagline: 'Share the ritual', description: 'Family pack of Tejasamrit Golden latte.', story: '', category: 'beauty-products', theme: 'beauty', price: 0, originalPrice: 0, weight: '', sku: 'SN-KIT-TGL', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'royal-bathing-kit', name: 'Royal bathing kit', tagline: 'Luxury bath ritual', description: 'Premium bathing essentials.', story: '', category: 'wellness', theme: 'wellness', price: 0, originalPrice: 0, weight: '', sku: 'SN-KIT-RB', image: '/images/abhyanga-udvartana-new.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'autea', name: 'Autea', tagline: 'Ayurvedic wellness tea', description: 'Natural wellness tea blend.', story: '', category: 'natural-food', theme: 'food', price: 0, originalPrice: 0, weight: '', sku: 'SN-NF-AUT', image: '/images/autea/1.jpeg', images: ['/images/autea/1.jpeg', '/images/autea/2.jpeg'], badges: [], ingredients: [], benefits: [] },
  { slug: 'face-polishing-scrub', name: 'Face polishing scrub', tagline: 'Gentle exfoliation', description: 'Face scrub for smooth, glowing skin.', story: '', category: 'skin-care', theme: 'skincare', price: 0, originalPrice: 0, weight: '', sku: 'SN-SC-FPS', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'tarunya-rose-toner', name: 'Tarunya Rose Toner', tagline: 'Refreshing rose toner', description: 'Gentle rose toner for balanced skin.', story: '', category: 'skin-care', theme: 'skincare', price: 0, originalPrice: 0, weight: '', sku: 'SN-SC-TRT', image: '/images/tarunya-toner.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'kumkumadi-lip-balm', name: 'Kumkumadi lip balm', tagline: 'Luxury lip care', description: 'Nourishing lip balm with Kumkumadi.', story: '', category: 'beauty-products', theme: 'beauty', price: 0, originalPrice: 0, weight: '', sku: 'SN-BP-KLB', image: '/images/kumkumadi-lip-balm.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'abhyanga-natural-soap', name: 'Abhyanga Natural soap', tagline: 'Traditional cleansing', description: 'Natural soap for body care.', story: '', category: 'wellness', theme: 'wellness', price: 0, originalPrice: 0, weight: '', sku: 'SN-WL-ANS', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'snehchandan-natural-soap', name: 'Snehchandan natural soap', tagline: 'Sandalwood luxury', description: 'Sandalwood-infused natural soap.', story: '', category: 'wellness', theme: 'wellness', price: 0, originalPrice: 0, weight: '', sku: 'SN-WL-SNS', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'soumya-touch-of-silk', name: 'Soumya – The touch of silk', tagline: 'Silky body care', description: 'Luxurious body care formulation.', story: '', category: 'wellness', theme: 'wellness', price: 0, originalPrice: 0, weight: '', sku: 'SN-WL-STS', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'mango-body-butter', name: 'Mango body butter', tagline: 'Tropical nourishment', description: 'Rich mango body butter.', story: '', category: 'wellness', theme: 'wellness', price: 0, originalPrice: 0, weight: '', sku: 'SN-WL-MBB', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'kayashuddhi-abhyanga-body-oil', name: 'Kayashuddhi abhyanga body oil', tagline: 'Purifying body oil', description: 'Detoxifying body massage oil.', story: '', category: 'wellness', theme: 'wellness', price: 0, originalPrice: 0, weight: '', sku: 'SN-WL-KAB', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'triphala-natural-soap', name: 'Triphala Natural Soap', tagline: 'Purifying cleanse', description: 'Triphala-infused natural soap.', story: '', category: 'wellness', theme: 'wellness', price: 0, originalPrice: 0, weight: '', sku: 'SN-WL-TNS', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'keshvardhini-hair-oil', name: 'Keshvardhini hair oil', tagline: 'Hair growth elixir', description: 'Traditional hair oil for growth.', story: '', category: 'hair-care', theme: 'herbal', price: 0, originalPrice: 0, weight: '', sku: 'SN-HC-KVO', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'bhruhshakti-roll-on', name: 'Bhruhshakti roll on', tagline: 'Eyebrow care', description: 'Natural eyebrow roll-on.', story: '', category: 'hair-care', theme: 'herbal', price: 0, originalPrice: 0, weight: '', sku: 'SN-HC-BSR', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'kesh-shuddhi', name: 'Kesh shuddhi', tagline: 'Scalp cleansing', description: 'Scalp cleansing formulation.', story: '', category: 'hair-care', theme: 'herbal', price: 0, originalPrice: 0, weight: '', sku: 'SN-HC-KSH', image: '/images/shudhi/1.jpeg', images: ['/images/shudhi/1.jpeg', '/images/shudhi/2.jpeg', '/images/shudhi/3.jpeg'], badges: [], ingredients: [], benefits: [] },
  { slug: 'swarnahairdra-turmeric', name: 'Swarnahairdra Stone grounded 100% pure turmeric', tagline: 'Pure turmeric', description: 'Stone-ground pure turmeric powder.', story: '', category: 'natural-food', theme: 'food', price: 0, originalPrice: 0, weight: '', sku: 'SN-NF-SHT', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
  { slug: 'sonamoti-wheat', name: "Sonamoti Wheat – Nature's Gift", tagline: 'Natural wheat', description: 'Premium wheat product.', story: '', category: 'natural-food', theme: 'food', price: 0, originalPrice: 0, weight: '', sku: 'SN-NF-SMW', image: '/images/tejasamrit.png', badges: [], ingredients: [], benefits: [] },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsBySlugs(slugs: string[] | readonly string[]): Product[] {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);
}

export function getThemeForCategory(category: string): ProductTheme {
  return CATEGORY_THEMES[category] || 'herbal';
}

/** Category filter options for All Products page. */
export const PRODUCTS_PAGE_CATEGORIES = [
  { id: "all", label: "All Products", slugs: [] },
  { id: "kits", label: "Best selling kits", slugs: ["complete-radiance-kit", "hair-care-kit", "tejasamrit-golden-latte-family-pack", "royal-bathing-kit", "autea", "tejasamrit"] },
  { id: "face", label: "Face", slugs: ["chandraprabha-night-nectar", "suryakanti-day-cream", "lavanyam-facepack", "face-polishing-scrub", "tarunya-rose-toner"] },
  { id: "lip-balm", label: "Lip Balm", slugs: ["kumkumadi-lip-balm", "rose-lip-balm"] },
  { id: "body-care", label: "Body Care", slugs: ["abhyanga-natural-soap", "snehchandan-natural-soap", "abhyanga-udvartana", "soumya-touch-of-silk", "mango-body-butter", "kayashuddhi-abhyanga-body-oil", "triphala-natural-soap", "glowup-night-gel"] },
  { id: "hair-care", label: "Hair care", slugs: ["keshvardhini-hair-oil", "hibiscus-hair-gel", "bhruhshakti-roll-on", "kesh-shuddhi", "kesh-samraksha"] },
  { id: "food", label: "Food", slugs: ["swarnahairdra-turmeric", "gulkand", "sonamoti-wheat", "autea", "tejasamrit"] },
  { id: "detox", label: "Detox", slugs: ["triphala-detox", "autea", "tejasamrit"] },
] as const;

/** Slug → editorial data map for merge with backend commerce data */
export const editorialBySlug: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.slug, p])
);
