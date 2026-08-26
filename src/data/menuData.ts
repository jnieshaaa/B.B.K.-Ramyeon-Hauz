import type { Product, Category } from '../models/MenuModel';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Menu', iconName: 'menu' },
  { id: 'ramyeon', name: 'Korean Ramyeon', iconName: 'ramen' },
  { id: 'toppings', name: 'Ramyeon Toppings', iconName: 'topping' },
  { id: 'silog', name: 'All-Day Silog', iconName: 'rice' },
  { id: 'combos', name: 'Combo Meals', iconName: 'combo' },
  { id: 'drinks', name: 'Drinks & Sides', iconName: 'drink' }
];

export const PRODUCTS: Product[] = [
  // --- KOREAN RAMYEON BASES (Soup Based & Stir Fry) ---
  {
    id: 'r1',
    name: 'Jin Ramen (Spicy)',
    price: 50,
    description: 'Hot and spicy beef broth instant noodles, loaded with rich flavor.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg',
    isPopular: true
  },
  {
    id: 'r2',
    name: 'Jin Ramen (Mild)',
    price: 50,
    description: 'Comforting, mild beef bone broth instant noodles with savory vegetables.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r3',
    name: 'Kimchi Shin Ramen',
    price: 60,
    description: 'Flavorful Shin noodles infused with sour, spicy fermented cabbage kimchi flavor.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r4',
    name: 'Shin Ramen (Pouch)',
    price: 60,
    description: 'The legendary premium hot spicy beef noodle soup in a convenient cooking pack.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg',
    isPopular: true
  },
  {
    id: 'r5',
    name: 'Neoguri (Mild)',
    price: 60,
    description: 'Chewy, thick udon-style noodles cooked in a warm, mild kelp and seafood broth.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r6',
    name: 'Ansungtangmyun',
    price: 60,
    description: 'Noodles in a savory deep beef brisket broth with rich, traditional Korean soybean paste seasoning.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r7',
    name: 'Cheese Ramen',
    price: 65,
    description: 'Instant ramen served in a savory broth, finished with a rich, melted cheese essence.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg',
    isPopular: true
  },
  {
    id: 'r8',
    name: 'Chapaghetti Olive',
    price: 70,
    description: 'Delicious Korean black bean noodles (Jajangmyeon style) with savory olive oil infusion.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r9',
    name: 'Beef Bulgogi Noodles',
    price: 70,
    description: 'Savory stir-fry noodles glazed in a sweet soy buldak beef sauce.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r10',
    name: 'Cheese Stir Fry',
    price: 70,
    description: 'Pan-fried dry noodles coated in a rich, creamy, melted cheese sauce.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r11',
    name: 'Samyang Buldak (Hot Spicy)',
    price: 80,
    description: 'The legendary dry fire-chicken noodles. Extremely spicy and super addictive.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r12',
    name: 'Samyang Buldak Carbonara',
    price: 80,
    description: 'Creamy milk and carbonara cheese blended beautifully with hot spicy Buldak sauce.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg',
    isPopular: true
  },
  {
    id: 'r13',
    name: 'Samyang Buldak Cheese',
    price: 80,
    description: 'Spicy stir-fry Buldak fire-chicken noodles topped with melted cheese powder.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },

  // --- RAMYEON TOPPINGS ---
  {
    id: 't1',
    name: 'Sliced Cheese',
    price: 15,
    description: 'Rich, melting processed cheese slice to add silkiness to the broth.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't2',
    name: 'Authentic Kimchi',
    price: 25,
    description: 'Tangy, spicy, fermented Napa cabbage - the ultimate ramyeon companion.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg',
    isPopular: true
  },
  {
    id: 't3',
    name: 'Seaweeds',
    price: 15,
    description: 'Crispy, roasted nori sheets to wrap around your savory noodles.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't4',
    name: 'Raw Egg',
    price: 20,
    description: 'A fresh, raw egg cracked straight into the hot boiling ramyeon pot.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't5',
    name: 'Boiled Egg',
    price: 25,
    description: 'A classic, comforting hard-boiled egg cut in half for topping.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't6',
    name: 'Mini Korean Sausage',
    price: 30,
    description: 'Juicy, bite-sized mini sausages to make your bowl extra meaty.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't7',
    name: 'Fish Tofu',
    price: 30,
    description: 'Square-cut, tender fish cakes with a tofu-like soft texture.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't8',
    name: 'Rice Cakes (Tteok)',
    price: 30,
    description: 'Chewy, cylinder-shaped traditional Korean rice cakes.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't9',
    name: 'Fishcake Slices',
    price: 30,
    description: 'Authentic sliced Korean fishcake (Odeng) to enrich soup flavors.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't10',
    name: 'Crabsticks',
    price: 30,
    description: 'Sweet, pulled surimi crabstick strips that cook beautifully.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't11',
    name: 'Fish Roebun',
    price: 30,
    description: 'Dumpling-style fish balls filled with savory, textured fish roe.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't12',
    name: 'Lobster Ball',
    price: 30,
    description: 'Savory, bouncy fish balls cooked with authentic lobster seasoning.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't13',
    name: 'Mozzarella Cheese',
    price: 25,
    description: 'Shredded premium Mozzarella cheese for a stretchy, gooey cheese pull.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg',
    isPopular: true
  },
  {
    id: 't14',
    name: 'Cheese ball',
    price: 30,
    description: 'Bouncy fish balls stuffed with creamy, warm cheese fillings.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't15',
    name: 'Fishball',
    price: 25,
    description: 'Standard, savory street food style boiled fish balls.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't16',
    name: 'Enoki Mushroom',
    price: 30,
    description: 'Fresh, delicate enoki mushroom clusters for a delicious crunch.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },

  // --- ALL-DAY SILOG MEALS ---
  {
    id: 's1',
    name: 'Spamsilog',
    price: 80,
    description: 'Thick, pan-fried premium Spam slices served with garlic rice and fried egg.',
    category: 'silog',
    image: '/assets/silog_meal.jpg',
    isPopular: true
  },
  {
    id: 's2',
    name: 'Hotsilog',
    price: 80,
    description: 'Juicy, pan-fried red hotdog served with garlic rice and fried egg.',
    category: 'silog',
    image: '/assets/silog_meal.jpg'
  },
  {
    id: 's3',
    name: 'Bacsilog',
    price: 80,
    description: 'Crispy, honey-cured smoked bacon strips served with garlic rice and fried egg.',
    category: 'silog',
    image: '/assets/silog_meal.jpg',
    isPopular: true
  },
  {
    id: 's4',
    name: 'Hamsilog',
    price: 80,
    description: 'Pan-fried sweet, savory ham slices served with garlic rice and fried egg.',
    category: 'silog',
    image: '/assets/silog_meal.jpg'
  },
  {
    id: 's5',
    name: 'Sausagesilog',
    price: 80,
    description: 'Juicy, pan-fried smoked sausages served with garlic rice and fried egg.',
    category: 'silog',
    image: '/assets/silog_meal.jpg'
  },
  {
    id: 's6',
    name: 'Silog (Egg & Rice)',
    price: 50,
    description: 'A comforting, simple meal of fragrant garlic rice and a perfect fried egg.',
    category: 'silog',
    image: '/assets/silog_meal.jpg'
  },

  // --- COMBO MEALS & OMELETTE ---
  {
    id: 'c1',
    name: 'Buldak Carbonara Overload (w/ Drink)',
    price: 195,
    description: 'Samyang Carbonara noodles served with Korean Spam, fried egg, cheese sauce, seaweed, and iced tea.',
    category: 'combos',
    image: '/assets/combo_meal.jpg',
    isPopular: true
  },
  {
    id: 'c2',
    name: 'Buldak Carbonara Overload (w/o Drink)',
    price: 185,
    description: 'Samyang Carbonara noodles served with Korean Spam, fried egg, cheese sauce, and seaweed (no drink).',
    category: 'combos',
    image: '/assets/combo_meal.jpg'
  },
  {
    id: 'c3',
    name: 'Buldak Omelette',
    price: 199,
    description: 'Your choice of stir-fry noodles wrapped in a fluffy omelette with spam, hotdog, sausage, ham, or bacon.',
    category: 'combos',
    image: '/assets/combo_meal.jpg',
    isPopular: true
  },

  // --- DRINKS & SIDES ---
  {
    id: 'd1',
    name: 'Pouch Drinks',
    price: 75,
    description: 'Classic Korean convenience store style fruit drink pouches served with an ice cup.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg',
    isPopular: true
  },
  {
    id: 'd2',
    name: 'Soju',
    price: 120,
    description: 'Traditional Korean distilled spirit. Clean, smooth, and perfect pairing for ramyeon.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  },
  {
    id: 'd3',
    name: 'Bottled Water',
    price: 15,
    description: 'Chilled, pure mineral drinking water.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  },
  {
    id: 'd4',
    name: 'Soft Drinks',
    price: 25,
    description: 'Chilled canned carbonated soda beverages (Coke, Sprite, Royal, etc.).',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  },
  {
    id: 'd5',
    name: 'Tteok-bokki (Cheese)',
    price: 90,
    description: 'Chewy Korean rice cakes simmered in sweet spicy gochujang sauce and topped with rich cheese.',
    category: 'drinks',
    image: '/assets/topping_kimchi.jpg',
    isPopular: true
  },
  {
    id: 'd6',
    name: 'Tteok-bokki (Hot & Spicy)',
    price: 90,
    description: 'Chewy Korean rice cakes simmered in an authentic, fire spicy gochujang pepper sauce.',
    category: 'drinks',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 'd7',
    name: 'Garlic Rice',
    price: 20,
    description: 'Fried rice seasoned with toasted, fragrant garlic bits.',
    category: 'drinks',
    image: '/assets/silog_meal.jpg'
  },
  {
    id: 'd8',
    name: 'Plain Rice',
    price: 15,
    description: 'A hot bowl of freshly steamed white jasmine rice.',
    category: 'drinks',
    image: '/assets/silog_meal.jpg'
  },
  {
    id: 'd9',
    name: 'Hot Choco',
    price: 15,
    description: 'A warm, comforting cup of rich milk chocolate.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  },
  {
    id: 'd10',
    name: 'Brewed Coffee',
    price: 15,
    description: 'A warm cup of classic, rich brewed coffee.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  },
  {
    id: 'd11',
    name: 'Iced Tea',
    price: 15,
    description: 'A sweet, refreshing glass of chilled lemon iced tea.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  }
];
