import { useState, useMemo, useEffect } from 'react';
import type { Product, CategoryId, DIYSelection, Inquiry, InventoryItem, AuditLogEntry, StockMovement, Category } from '../models/MenuModel';
import { PRODUCTS, CATEGORIES } from '../data/menuData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export function useMenuController() {
  // --- Global Toast Notification State ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Global Maintenance Mode State ---
  const [maintenanceMode, setMaintenanceMode] = useState<{ active: boolean; message: string }>({
    active: false,
    message: 'We are currently updating our product catalog prices. Please check back shortly!'
  });

  const updateMaintenanceMode = async (active: boolean, message?: string) => {
    const updatedSettings = {
      active,
      message: message || maintenanceMode.message
    };
    setMaintenanceMode(updatedSettings);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('store_settings').upsert({
          key: 'maintenance_mode',
          value: updatedSettings
        });
        if (error) {
          console.error('Failed to update maintenance settings in Supabase:', error);
          showToast(`Database update failed: ${error.message}`, 'error');
        } else {
          showToast(`Catalog maintenance mode turned ${active ? 'ON' : 'OFF'}.`, 'success');
        }
      } catch (err) {
        console.error('Failed to update maintenance settings in Supabase:', err);
      }
    }
  };

  // --- Categories State ---
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('bbk_menu_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved categories:', e);
      }
    }
    return CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('bbk_menu_categories', JSON.stringify(categories));
  }, [categories]);

  // --- Products Catalog State ---
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

  useEffect(() => {
    localStorage.setItem('bbk_menu_products', JSON.stringify(products));
  }, [products]);

  // --- Menu Filtering & Search States ---
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- DIY Ramyeon Builder States ---
  const [diySelection, setDiySelection] = useState<DIYSelection>({
    ramyeon: null,
    toppings: [],
    drink: null
  });

  // --- Inventory & Auditing States ---
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

  // --- Customer Inquiries (Bookings) State ---
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

  // --- Supabase Live Load Effect ---
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const loadSupabaseData = async () => {
      try {
        // 1. Load categories
        const { data: dbCategories } = await client.from('categories').select('*').order('created_at', { ascending: true });
        if (dbCategories && dbCategories.length > 0) {
          const mappedCategories: Category[] = dbCategories.map((c: any) => ({
            id: c.id,
            name: c.name,
            iconName: c.icon_name || 'noodle'
          }));
          setCategories(mappedCategories);
        }

        // 2. Load products
        const { data: dbProducts } = await client.from('products').select('*');
        if (dbProducts) {
          const mappedProducts: Product[] = dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            description: p.description || '',
            category: p.category,
            image: p.image,
            isPopular: !!p.is_popular
          }));
          setProducts(mappedProducts);
        }

        // 3. Load inquiries
        const { data: dbInquiries } = await client.from('inquiries').select('*').order('created_at', { ascending: false });
        if (dbInquiries) {
          const mappedInquiries: Inquiry[] = dbInquiries.map((i: any) => ({
            id: i.id,
            name: i.name,
            phone: i.phone,
            email: i.email || undefined,
            message: i.message || '',
            status: i.status as 'pending' | 'completed',
            timestamp: i.timestamp
          }));
          setInquiries(mappedInquiries);
        }

        // 4. Load inventory
        const { data: dbInventory } = await client.from('inventory').select('*');
        if (dbInventory) {
          const mappedInventory: InventoryItem[] = dbInventory.map((i: any) => ({
            id: i.id,
            name: i.name,
            currentStock: i.current_stock,
            minStockLevel: i.min_stock_level,
            unit: i.unit,
            category: i.category,
            lastAudited: i.last_audited || undefined
          }));
          setInventory(mappedInventory);

          // 5. Load stock movements (depends on inventory item names)
          const { data: dbMovements } = await client.from('stock_movements').select('*').order('created_at', { ascending: false });
          if (dbMovements) {
            const mappedMovements: StockMovement[] = dbMovements.map((m: any) => {
              const invItem = dbInventory.find(i => i.id === m.item_id);
              return {
                id: m.id,
                itemId: m.item_id,
                itemName: invItem ? invItem.name : 'Unknown Item',
                date: m.date,
                displayedQty: m.displayed_qty,
                soldQty: m.sold_qty
              };
            });
            setStockMovements(mappedMovements);
          }

          // 6. Load audit logs (depends on inventory item names)
          const { data: dbLogs } = await client.from('audit_log_entries').select('*').order('created_at', { ascending: false });
          if (dbLogs) {
            const mappedLogs: AuditLogEntry[] = dbLogs.map((l: any) => {
              const invItem = dbInventory.find(i => i.id === l.item_id);
              return {
                id: l.id,
                itemId: l.item_id,
                itemName: invItem ? invItem.name : 'Unknown Item',
                auditDate: l.audit_date,
                physicalCount: l.physical_count,
                recordedCount: l.recorded_count,
                discrepancy: l.discrepancy,
                auditedBy: l.audited_by,
                notes: l.notes || undefined
              };
            });
            setAuditLogs(mappedLogs);
          }

          // 7. Load store settings (like maintenance mode)
          const { data: dbSettings } = await client.from('store_settings').select('*').eq('key', 'maintenance_mode').maybeSingle();
          if (dbSettings && dbSettings.value) {
            setMaintenanceMode(dbSettings.value as any);
          }
        }
      } catch (err) {
        console.error('Failed to sync databases from Supabase:', err);
      }
    };

    loadSupabaseData();
  }, []);

  // --- Filtered products list calculation ---
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
    setDiySelection(prev => ({ ...prev, ramyeon: product }));
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
    setDiySelection(prev => ({ ...prev, drink: product }));
  };

  const resetDiyBuilder = () => {
    setDiySelection({ ramyeon: null, toppings: [], drink: null });
  };

  const diyTotal = useMemo(() => {
    let total = 0;
    if (diySelection.ramyeon) total += diySelection.ramyeon.price;
    diySelection.toppings.forEach(t => {
      total += t.product.price * t.quantity;
    });
    if (diySelection.drink) total += diySelection.drink.price;
    return total;
  }, [diySelection]);

  // --- Category CRUD Actions ---
  const addCategory = async (newCat: Omit<Category, 'id'>) => {
    const nextId = newCat.name.toLowerCase().replace(/\s+/g, '-');
    const categoryWithId: Category = { ...newCat, id: nextId };
    
    setCategories(prev => [...prev, categoryWithId]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('categories').insert({
          id: categoryWithId.id,
          name: categoryWithId.name,
          icon_name: categoryWithId.iconName
        });
        if (error) {
          console.error('Failed to save category to Supabase:', error);
          alert(`Database save failed: ${error.message}`);
        }
      } catch (err) {
        console.error('Failed to save category to Supabase:', err);
      }
    }
    return categoryWithId;
  };

  const editCategory = async (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('categories').update({
          name: updatedCat.name,
          icon_name: updatedCat.iconName
        }).eq('id', updatedCat.id);
        
        if (error) {
          console.error('Failed to update category in Supabase:', error);
          alert(`Database update failed: ${error.message}`);
        }
      } catch (err) {
        console.error('Failed to update category in Supabase:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
          console.error('Failed to delete category in Supabase:', error);
          alert(`Database delete failed: ${error.message}`);
        }
      } catch (err) {
        console.error('Failed to delete category in Supabase:', err);
      }
    }
  };

  // --- Admin Catalog Management Actions ---
  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const nextId = `prod_${Date.now()}`;
    const productWithId: Product = { ...newProd, id: nextId };
    setProducts(prev => [...prev, productWithId]);

    // Automatically create matching inventory item with 0 stock
    const matchingInventory: InventoryItem = {
      id: nextId,
      name: productWithId.name,
      currentStock: 0,
      minStockLevel: 10,
      unit: 'pcs',
      category: productWithId.category
    };
    setInventory(prev => [...prev, matchingInventory]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').insert({
          id: productWithId.id,
          name: productWithId.name,
          price: productWithId.price,
          description: productWithId.description,
          category: productWithId.category,
          image: productWithId.image,
          is_popular: !!productWithId.isPopular
        });
        if (error) {
          console.error('Failed to save product to Supabase:', error);
          showToast(`Database save failed: ${error.message}`, 'error');
        }

        // Insert matching inventory item in Supabase
        const { error: invError } = await supabase.from('inventory').insert({
          id: matchingInventory.id,
          name: matchingInventory.name,
          current_stock: matchingInventory.currentStock,
          min_stock_level: matchingInventory.minStockLevel,
          unit: matchingInventory.unit,
          category: matchingInventory.category,
          last_audited: null
        });
        if (invError) {
          console.error('Failed to save matching inventory item:', invError);
        }
      } catch (err) {
        console.error('Failed to save product to Supabase:', err);
      }
    }
    return productWithId;
  };

  const editProduct = async (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));

    // Update matching inventory item details
    setInventory(prev => prev.map(item => 
      item.id === updatedProd.id ? { ...item, name: updatedProd.name, category: updatedProd.category } : item
    ));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').update({
          name: updatedProd.name,
          price: updatedProd.price,
          description: updatedProd.description,
          category: updatedProd.category,
          image: updatedProd.image,
          is_popular: !!updatedProd.isPopular
        }).eq('id', updatedProd.id);
        
        if (error) {
          console.error('Failed to update product in Supabase:', error);
          showToast(`Database update failed: ${error.message}`, 'error');
        }

        // Update matching inventory item in Supabase
        const { error: invError } = await supabase.from('inventory').update({
          name: updatedProd.name,
          category: updatedProd.category
        }).eq('id', updatedProd.id);
        if (invError) {
          console.error('Failed to update matching inventory details:', invError);
        }
      } catch (err) {
        console.error('Failed to update product in Supabase:', err);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setDiySelection(prev => {
      let ramyeon = prev.ramyeon;
      let drink = prev.drink;
      let toppings = prev.toppings;

      if (ramyeon?.id === id) ramyeon = null;
      if (drink?.id === id) drink = null;
      toppings = toppings.filter(t => t.product.id !== id);

      return { ramyeon, toppings, drink };
    });

    // Delete matching inventory item
    setInventory(prev => prev.filter(item => item.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Failed to delete product in Supabase:', error);
          showToast(`Database delete failed: ${error.message}`, 'error');
        }

        // Delete matching inventory item from Supabase
        const { error: invError } = await supabase.from('inventory').delete().eq('id', id);
        if (invError) {
          console.error('Failed to delete matching inventory item:', invError);
        }
      } catch (err) {
        console.error('Failed to delete product in Supabase:', err);
      }
    }
  };

  const resetProducts = async () => {
    if (window.confirm("Are you sure you want to reset all products back to default menu items? This will delete all custom edits/additions.")) {
      setProducts(PRODUCTS);
      resetDiyBuilder();

      if (isSupabaseConfigured && supabase) {
        try {
          const { error: delErr } = await supabase.from('products').delete().neq('id', 'dummy');
          if (delErr) throw delErr;

          const mappedProducts = PRODUCTS.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category,
            image: p.image,
            is_popular: !!p.isPopular
          }));

          const { error: insErr } = await supabase.from('products').insert(mappedProducts);
          if (insErr) throw insErr;
        } catch (err: any) {
          console.error('Failed to reset products in Supabase:', err);
          showToast(`Database reset failed: ${err.message}`, 'error');
        }
      }
    }
  };

  // --- Inventory & Auditing Actions ---
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'lastAudited'> & { id?: string }) => {
    const newItem: InventoryItem = {
      ...item,
      id: item.id || `inv_${Date.now()}`
    };
    setInventory(prev => [...prev, newItem]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inventory').insert({
          id: newItem.id,
          name: newItem.name,
          current_stock: newItem.currentStock,
          min_stock_level: newItem.minStockLevel,
          unit: newItem.unit,
          category: newItem.category,
          last_audited: newItem.lastAudited || null
        });
        if (error) {
          console.error('Failed to add inventory item in Supabase:', error);
          showToast(`Database save failed: ${error.message}`, 'error');
        }
      } catch (err) {
        console.error('Failed to add inventory item in Supabase:', err);
      }
    }
    return newItem;
  };

  const adjustStock = async (itemId: string, newCount: number) => {
    setInventory(prev => {
      const exists = prev.some(item => item.id === itemId);
      if (exists) {
        return prev.map(item => 
          item.id === itemId ? { ...item, currentStock: newCount, lastAudited: new Date().toLocaleString() } : item
        );
      } else {
        const prod = products.find(p => p.id === itemId);
        return [...prev, {
          id: itemId,
          name: prod ? prod.name : 'Unknown Product',
          currentStock: newCount,
          minStockLevel: 5,
          unit: 'pcs',
          category: prod ? prod.category : 'toppings',
          lastAudited: new Date().toLocaleString()
        }];
      }
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const prod = products.find(p => p.id === itemId);
        const { error } = await supabase.from('inventory').upsert({ 
          id: itemId,
          name: prod ? prod.name : 'Unknown Product',
          current_stock: newCount,
          min_stock_level: 5,
          unit: 'pcs',
          category: prod ? prod.category : 'toppings',
          last_audited: new Date().toLocaleString()
        });
        if (error) {
          console.error('Failed to adjust inventory stock in Supabase:', error);
          showToast(`Database update failed: ${error.message}`, 'error');
        }
      } catch (err) {
        console.error('Failed to adjust inventory stock in Supabase:', err);
      }
    }
  };

  const logAuditRecord = async (entry: Omit<AuditLogEntry, 'id' | 'itemName' | 'recordedCount' | 'discrepancy'>) => {
    const targetItem = inventory.find(item => item.id === entry.itemId);
    const targetProduct = products.find(p => p.id === entry.itemId);
    if (!targetItem && !targetProduct) return;

    const recorded = targetItem ? targetItem.currentStock : 0;
    const diff = entry.physicalCount - recorded;
    const itemName = targetItem ? targetItem.name : (targetProduct ? targetProduct.name : 'Unknown');
    const newId = `audit_${Date.now()}`;

    const newAuditLog: AuditLogEntry = {
      ...entry,
      id: newId,
      itemName: itemName,
      recordedCount: recorded,
      discrepancy: diff
    };

    setAuditLogs(prev => [newAuditLog, ...prev]);
    
    setInventory(prev => {
      const exists = prev.some(item => item.id === entry.itemId);
      if (exists) {
        return prev.map(item => 
          item.id === entry.itemId 
            ? { ...item, currentStock: entry.physicalCount, lastAudited: entry.auditDate } 
            : item
        );
      } else {
        return [...prev, {
          id: entry.itemId,
          name: itemName,
          currentStock: entry.physicalCount,
          minStockLevel: 5,
          unit: 'pcs',
          category: targetProduct ? targetProduct.category : 'toppings',
          lastAudited: entry.auditDate
        }];
      }
    });

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Upsert inventory item stock levels first to satisfy foreign key constraint
        const { error: invError } = await supabase.from('inventory').upsert({
          id: entry.itemId,
          name: itemName,
          current_stock: entry.physicalCount,
          min_stock_level: 5,
          unit: 'pcs',
          category: targetProduct ? targetProduct.category : 'toppings',
          last_audited: entry.auditDate
        });

        if (invError) {
          console.error('Failed to update inventory in Supabase:', invError);
          showToast(`Database update failed: ${invError.message}`, 'error');
          return;
        }

        // 2. Insert audit log second
        const { error: logError } = await supabase.from('audit_log_entries').insert({
          item_id: entry.itemId,
          audit_date: entry.auditDate,
          physical_count: entry.physicalCount,
          recorded_count: recorded,
          discrepancy: diff,
          audited_by: entry.auditedBy,
          notes: entry.notes
        });

        if (logError) {
          console.error('Failed to log audit record in Supabase:', logError);
          showToast(`Database save failed: ${logError.message}`, 'error');
        }
      } catch (err) {
        console.error('Failed to log audit record in Supabase:', err);
      }
    }
  };

  const resetInventory = async () => {
    if (window.confirm("Are you sure you want to reset inventory and audit logs? This will restore original stock levels and wipe audit history.")) {
      setInventory(DEFAULT_INVENTORY);
      setAuditLogs([]);
      setStockMovements([]);

      if (isSupabaseConfigured && supabase) {
        try {
          const { error: delLogsErr } = await supabase.from('audit_log_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (delLogsErr) throw delLogsErr;

          const { error: delMoveErr } = await supabase.from('stock_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (delMoveErr) throw delMoveErr;

          const { error: delInvErr } = await supabase.from('inventory').delete().neq('id', 'dummy');
          if (delInvErr) throw delInvErr;

          const mappedInventory = DEFAULT_INVENTORY.map(i => ({
            id: i.id,
            name: i.name,
            current_stock: i.currentStock,
            min_stock_level: i.minStockLevel,
            unit: i.unit,
            category: i.category,
            last_audited: i.lastAudited || null
          }));

          const { error: insInvErr } = await supabase.from('inventory').insert(mappedInventory);
          if (insInvErr) throw insInvErr;
        } catch (err: any) {
          console.error('Failed to reset inventory in Supabase:', err);
          alert(`Database reset failed: ${err.message}`);
        }
      }
    }
  };

  // --- Daily Stock Movements Actions ---
  const logStockMovement = async (entry: Omit<StockMovement, 'id' | 'itemName'>) => {
    const targetItem = inventory.find(item => item.id === entry.itemId);
    if (!targetItem) return;

    const newId = `mov_${Date.now()}`;
    const newMovement: StockMovement = {
      ...entry,
      id: newId,
      itemName: targetItem.name
    };

    const updatedStock = Math.max(0, targetItem.currentStock + entry.displayedQty - entry.soldQty);
    const nowTimestamp = new Date().toLocaleString();

    setStockMovements(prev => [newMovement, ...prev]);
    setInventory(prev => prev.map(item => 
      item.id === entry.itemId 
        ? { ...item, currentStock: updatedStock, lastAudited: nowTimestamp } 
        : item
    ));

    if (isSupabaseConfigured && supabase) {
      try {
        // Insert stock movement ledger row
        const { error: moveError } = await supabase.from('stock_movements').insert({
          item_id: entry.itemId,
          date: entry.date,
          displayed_qty: entry.displayedQty,
          sold_qty: entry.soldQty
        });

        if (moveError) {
          console.error('Failed to log stock movement in Supabase:', moveError);
          alert(`Database save failed: ${moveError.message}`);
          return;
        }

        // Update inventory current stock values
        const { error: invError } = await supabase.from('inventory').update({
          current_stock: updatedStock,
          last_audited: nowTimestamp
        }).eq('id', entry.itemId);

        if (invError) {
          console.error('Failed to update inventory in Supabase:', invError);
          alert(`Database update failed: ${invError.message}`);
        }
      } catch (err) {
        console.error('Failed to log stock movement in Supabase:', err);
      }
    }
  };

  const resetStockMovements = async () => {
    setStockMovements([]);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('stock_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.error('Failed to reset stock movements in Supabase:', error);
          alert(`Database reset failed: ${error.message}`);
        }
      } catch (err) {
        console.error('Failed to reset stock movements in Supabase:', err);
      }
    }
  };

  // --- Customer Inquiries Actions ---
  const submitInquiry = async (newInq: Omit<Inquiry, 'id' | 'status' | 'timestamp'>) => {
    const timestamp = new Date().toLocaleString();
    const newInquiryEntry: Inquiry = {
      ...newInq,
      id: `inq_${Date.now()}`,
      status: 'pending',
      timestamp
    };

    setInquiries(prev => [newInquiryEntry, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inquiries').insert({
          name: newInq.name,
          phone: newInq.phone,
          email: newInq.email,
          message: newInq.message,
          status: 'pending',
          timestamp
        });
        if (error) {
          console.error('Failed to save inquiry to Supabase:', error);
          alert(`Database save failed: ${error.message}`);
        }
      } catch (err) {
        console.error('Failed to save inquiry to Supabase:', err);
      }
    }
    return newInquiryEntry;
  };

  const resolveInquiry = async (id: string) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'completed' } : inq));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inquiries').update({ status: 'completed' }).eq('id', id);
        if (error) {
          console.error('Failed to resolve inquiry in Supabase:', error);
          alert(`Database resolve failed: ${error.message}`);
        }
      } catch (err) {
        console.error('Failed to resolve inquiry in Supabase:', err);
      }
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries(prev => prev.filter(inq => inq.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inquiries').delete().eq('id', id);
        if (error) {
          console.error('Failed to delete inquiry in Supabase:', error);
          alert(`Database delete failed: ${error.message}`);
        }
      } catch (err) {
        console.error('Failed to delete inquiry in Supabase:', err);
      }
    }
  };

  return {
    categories,
    addCategory,
    editCategory,
    deleteCategory,

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
    diyTotal,

    // Global Toast Notification State
    toast,
    showToast,

    // Maintenance Mode State & Action
    maintenanceMode,
    updateMaintenanceMode
  };
}
