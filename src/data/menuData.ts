import type { Product, Category } from '../models/MenuModel';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Menu', iconName: 'menu' },
  { id: 'ramyeon', name: 'Korean Ramyeon', iconName: 'ramen' },
  { id: 'toppings', name: 'Ramyeon Toppings', iconName: 'topping' },
  { id: 'drinks', name: 'Korean Drinks', iconName: 'drink' }
];

export const PRODUCTS: Product[] = [
  // --- KOREAN RAMYEON BASES ---
  {
    id: 'r1',
    name: 'Shin Ramyun (Classic Spicy)',
    price: 90,
    description: 'The legendary spicy beef broth ramyeon. Rich, deep, and satisfyingly hot.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg',
    isPopular: true
  },
  {
    id: 'r2',
    name: 'Buldak Carbonara (Spicy Chicken)',
    price: 110,
    description: 'Creamy carbonara combined with the iconic spicy Buldak fire chicken sauce.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg',
    isPopular: true
  },
  {
    id: 'r3',
    name: 'Jin Ramyun (Mild / Savory)',
    price: 85,
    description: 'A comforting, rich beef bone broth with savory vegetables. Mild and child-friendly.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r4',
    name: 'Neoguri (Spicy Seafood)',
    price: 95,
    description: 'Thick, chewy udon-style noodles in a spicy, rich kelp and seafood broth.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },
  {
    id: 'r5',
    name: 'Chapaghetti (Black Bean Noodles)',
    price: 90,
    description: 'A delicious Korean-style Jajangmyeon black bean sauce noodle with savory olive oil.',
    category: 'ramyeon',
    image: '/assets/ramyeon_base.jpg'
  },

  // --- KOREAN TOPPINGS ---
  {
    id: 't1',
    name: 'Authentic Cabbage Kimchi',
    price: 25,
    description: 'Tangy, spicy, fermented Napa cabbage. A must-have side dish for any ramyeon.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg',
    isPopular: true
  },
  {
    id: 't2',
    name: 'Soft Boiled Egg',
    price: 15,
    description: 'A perfectly soft-boiled egg with a jammy yolk, cooked to absorb the soup flavors.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg',
    isPopular: true
  },
  {
    id: 't3',
    name: 'Melted American Sliced Cheese',
    price: 15,
    description: 'A creamy slice of cheddar cheese that melts into the broth for a silky texture.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg',
    isPopular: true
  },
  {
    id: 't4',
    name: 'Spam Slices (2 pcs)',
    price: 35,
    description: 'Thick, savory pan-fried premium Spam slices. The ultimate savory pairing.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't5',
    name: 'Korean Rice Cakes (Tteokbokki - 5 pcs)',
    price: 30,
    description: 'Chewy, cylinder-shaped rice cakes that cook beautifully inside the ramyeon broth.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't6',
    name: 'Frankfurter Sausage Slices',
    price: 25,
    description: 'Juicy, sliced smoked sausages to add a meaty punch to your custom bowl.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't7',
    name: 'Mandu Dumplings (2 pcs)',
    price: 30,
    description: 'Tasty steamed Korean vegetable and pork dumplings steeped in warm broth.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },
  {
    id: 't8',
    name: 'Fresh Chopped Scallions & Sesame',
    price: 10,
    description: 'A fresh, aromatic topping of finely chopped green onions and roasted sesame seeds.',
    category: 'toppings',
    image: '/assets/topping_kimchi.jpg'
  },

  // --- KOREAN DRINKS ---
  {
    id: 'd1',
    name: 'Milkis Soda Beverage',
    price: 65,
    description: 'The classic fizzy milk soda. Creamy, carbonated, and incredibly refreshing.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg',
    isPopular: true
  },
  {
    id: 'd2',
    name: 'Binggrae Banana Milk',
    price: 80,
    description: 'Creamy, sweet, and legendary Korean banana-flavored milk drink.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg',
    isPopular: true
  },
  {
    id: 'd3',
    name: 'Lotte Korean Pear Juice',
    price: 60,
    description: 'Sweet, chilled fruit juice with real crushed pear pulp. Incredibly hydrating.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  },
  {
    id: 'd4',
    name: 'Korean Aloe Vera Drink',
    price: 55,
    description: 'Sweet and refreshing beverage loaded with soft, real aloe vera gel pieces.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  },
  {
    id: 'd5',
    name: 'Iced Sweet Potato Latte',
    price: 90,
    description: 'A sweet, comforting, nutty beverage styled like a traditional cafe Goguma latte.',
    category: 'drinks',
    image: '/assets/drink_milkis.jpg'
  }
];
