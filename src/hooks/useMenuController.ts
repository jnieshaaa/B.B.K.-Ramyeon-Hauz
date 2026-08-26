import { useState, useMemo, useEffect } from 'react';
import type { Product, CategoryId, DIYSelection, Inquiry, InventoryItem, AuditLogEntry, StockMovement } from '../models/MenuModel';
import { PRODUCTS } from '../data/menuData';

export function useMenuController() {
  // Products Catalog State (seeded from localStorage or default DB)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bbk_menu_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved products:', e);
      }
    }
    return PRODUCTS;
  });

  // Sync products state with localStorage
  useEffect(() => {
    localStorage.setItem('bbk_menu_products', JSON.stringify(products));
  }, [products]);

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
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

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

  // --- Admin Catalog Management Actions ---

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const nextId = `prod_${Date.now()}`;
    const productWithId: Product = { ...newProd, id: nextId };
    setProducts(prev => [...prev, productWithId]);
    return productWithId;
  };

  const editProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    // If the deleted item is currently selected in DIY selection, clear it
    setDiySelection(prev => {
      let ramyeon = prev.ramyeon;
      let drink = prev.drink;
      let toppings = prev.toppings;

      if (ramyeon?.id === id) ramyeon = null;
      if (drink?.id === id) drink = null;
      toppings = toppings.filter(t => t.product.id !== id);

      return { ramyeon, toppings, drink };
    });
  };

  const resetProducts = () => {
    if (window.confirm("Are you sure you want to reset all products back to default menu items? This will delete all custom edits/additions.")) {
      setProducts(PRODUCTS);
      resetDiyBuilder();
    }
  };

  // --- Inventory & Auditing Management States & Actions ---

  const DEFAULT_INVENTORY: InventoryItem[] = [
    { id: 'inv_1', name: 'Jin Ramen Packs', currentStock: 120, minStockLevel: 30, unit: 'packs', category: 'ramyeon' },
    { id: 'inv_2', name: 'Shin Ramen Packs', currentStock: 95, minStockLevel: 25, unit: 'packs', category: 'ramyeon' },
    { id: 'inv_3', name: 'Mozzarella Cheese', currentStock: 45, minStockLevel: 15, unit: 'blocks', category: 'toppings' },
    { id: 'inv_4', name: 'Authentic Kimchi', currentStock: 15, minStockLevel: 5, unit: 'kg', category: 'toppings' },
    { id: 'inv_5', name: 'Raw Eggs', currentStock: 180, minStockLevel: 40, unit: 'pcs', category: 'toppings' },
    { id: 'inv_6', name: 'Mini Korean Sausage', currentStock: 50, minStockLevel: 15, unit: 'packs', category: 'toppings' },
    { id: 'inv_7', name: 'Milkis Cans', currentStock: 85, minStockLevel: 20, unit: 'cans', category: 'drinks' },
    { id: 'inv_8', name: 'Tteok Rice Cakes', currentStock: 20, minStockLevel: 8, unit: 'kg', category: 'toppings' },
    { id: 'inv_9', name: 'Soju Bottles', currentStock: 60, minStockLevel: 12, unit: 'bottles', category: 'drinks' },
    { id: 'inv_10', name: 'Garlic Rice', currentStock: 12, minStockLevel: 4, unit: 'kg', category: 'drinks' },
    { id: 'inv_11', name: 'Spam Cans', currentStock: 40, minStockLevel: 10, unit: 'cans', category: 'silog' }
  ];

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('bbk_menu_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved inventory:', e);
      }
    }
    return DEFAULT_INVENTORY;
  });

  useEffect(() => {
    localStorage.setItem('bbk_menu_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('bbk_menu_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved audit logs:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bbk_menu_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastAudited'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}`
    };
    setInventory(prev => [...prev, newItem]);
    return newItem;
  };

  const adjustStock = (itemId: string, newCount: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, currentStock: newCount } : item
    ));
  };

  const logAuditRecord = (entry: Omit<AuditLogEntry, 'id' | 'itemName' | 'recordedCount' | 'discrepancy'>) => {
    const targetItem = inventory.find(item => item.id === entry.itemId);
    if (!targetItem) return;

    const recorded = targetItem.currentStock;
    const diff = entry.physicalCount - recorded;

    const newAuditLog: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}`,
      itemName: targetItem.name,
      recordedCount: recorded,
      discrepancy: diff
    };

    // Update audit logs
    setAuditLogs(prev => [newAuditLog, ...prev]);

    // Update item stock & last audited timestamp
    setInventory(prev => prev.map(item => 
      item.id === entry.itemId 
        ? { ...item, currentStock: entry.physicalCount, lastAudited: entry.auditDate } 
        : item
    ));
  };

  const resetInventory = () => {
    if (window.confirm("Are you sure you want to reset inventory and audit logs? This will restore original stock levels and wipe audit history.")) {
      setInventory(DEFAULT_INVENTORY);
      setAuditLogs([]);
      setStockMovements([]);
    }
  };

  // --- Daily Stock Movements (Displayed vs Sold) ---

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('bbk_menu_stock_movements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved stock movements:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bbk_menu_stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  const logStockMovement = (entry: Omit<StockMovement, 'id' | 'itemName'>) => {
    const targetItem = inventory.find(item => item.id === entry.itemId);
    if (!targetItem) return;

    const newMovement: StockMovement = {
      ...entry,
      id: `mov_${Date.now()}`,
      itemName: targetItem.name
    };

    setStockMovements(prev => [newMovement, ...prev]);

    // Update the inventory levels: currentStock = currentStock + displayed - sold
    setInventory(prev => prev.map(item => {
      if (item.id === entry.itemId) {
        const updatedStock = item.currentStock + entry.displayedQty - entry.soldQty;
        return { 
          ...item, 
          currentStock: Math.max(0, updatedStock),
          lastAudited: new Date().toLocaleString()
        };
      }
      return item;
    }));
  };

  const resetStockMovements = () => {
    setStockMovements([]);
  };

  // --- Customer Inquiries Management Actions ---

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('bbk_menu_inquiries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved inquiries:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bbk_menu_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  const submitInquiry = (newInq: Omit<Inquiry, 'id' | 'status' | 'timestamp'>) => {
    const newInquiryEntry: Inquiry = {
      ...newInq,
      id: `inq_${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };
    setInquiries(prev => [newInquiryEntry, ...prev]);
    return newInquiryEntry;
  };

  const resolveInquiry = (id: string) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'completed' } : inq));
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(inq => inq.id !== id));
  };

  return {
    // Products Catalog State & Admin Actions
    products,
    addProduct,
    editProduct,
    deleteProduct,
    resetProducts,

    // Inquiries State & Actions
    inquiries,
    submitInquiry,
    resolveInquiry,
    deleteInquiry,

    // Inventory State & Actions
    inventory,
    auditLogs,
    addInventoryItem,
    adjustStock,
    logAuditRecord,
    resetInventory,
    stockMovements,
    logStockMovement,
    resetStockMovements,

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
