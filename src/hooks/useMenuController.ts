import { useState, useMemo } from 'react';
import type { Product, CategoryId, DIYSelection } from '../models/MenuModel';
import { PRODUCTS } from '../data/menuData';

export function useMenuController() {
  // Menu Filtering & Search States
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // DIY Ramyeon Builder States
  const [diySelection, setDiySelection] = useState<DIYSelection>({
    ramyeon: null,
    toppings: [],
    drink: null
  });

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // --- DIY Builder Controller Actions ---
  
  const setDiyRamyeon = (product: Product | null) => {
    if (product && product.category !== 'ramyeon') return;
    setDiySelection(prev => ({
      ...prev,
      ramyeon: product
    }));
  };

  const addTopping = (product: Product) => {
    if (product.category !== 'toppings') return;
    setDiySelection(prev => {
      const existing = prev.toppings.find(t => t.product.id === product.id);
      if (existing) {
        return {
          ...prev,
          toppings: prev.toppings.map(t => 
            t.product.id === product.id ? { ...t, quantity: t.quantity + 1 } : t
          )
        };
      } else {
        return {
          ...prev,
          toppings: [...prev.toppings, { product, quantity: 1 }]
        };
      }
    });
  };

  const removeTopping = (product: Product) => {
    if (product.category !== 'toppings') return;
    setDiySelection(prev => {
      const existing = prev.toppings.find(t => t.product.id === product.id);
      if (!existing) return prev;
      
      if (existing.quantity <= 1) {
        return {
          ...prev,
          toppings: prev.toppings.filter(t => t.product.id !== product.id)
        };
      } else {
        return {
          ...prev,
          toppings: prev.toppings.map(t => 
            t.product.id === product.id ? { ...t, quantity: t.quantity - 1 } : t
          )
        };
      }
    });
  };

  const setDiyDrink = (product: Product | null) => {
    if (product && product.category !== 'drinks') return;
    setDiySelection(prev => ({
      ...prev,
      drink: product
    }));
  };

  const resetDiyBuilder = () => {
    setDiySelection({
      ramyeon: null,
      toppings: [],
      drink: null
    });
  };

  // Calculate live DIY subtotal
  const diyTotal = useMemo(() => {
    let total = 0;
    if (diySelection.ramyeon) {
      total += diySelection.ramyeon.price;
    }
    diySelection.toppings.forEach(t => {
      total += t.product.price * t.quantity;
    });
    if (diySelection.drink) {
      total += diySelection.drink.price;
    }
    return total;
  }, [diySelection]);

  return {
    // Menu States & Actions
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    
    // DIY Builder States & Actions
    diySelection,
    setDiyRamyeon,
    addTopping,
    removeTopping,
    setDiyDrink,
    resetDiyBuilder,
    diyTotal
  };
}
