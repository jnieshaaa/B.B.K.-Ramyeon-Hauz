export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'ramyeon' | 'toppings' | 'drinks';
  image: string;
  isPopular?: boolean;
}

export type CategoryId = 'all' | 'ramyeon' | 'toppings' | 'drinks';

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string; // Used to display matching food icons
}

export interface DIYSelection {
  ramyeon: Product | null;
  toppings: { product: Product; quantity: number }[];
  drink: Product | null;
}
