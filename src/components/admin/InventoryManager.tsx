import React, { useState, useMemo } from 'react';
import type { InventoryItem, AuditLogEntry, StockMovement, Product } from '../../models/MenuModel';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastAudited'> & { id?: string }) => void;
  logAuditRecord: (entry: Omit<AuditLogEntry, 'id' | 'itemName' | 'recordedCount' | 'discrepancy'>) => void;
  resetInventory: () => void;
  stockMovements: StockMovement[];
  logStockMovement: (entry: Omit<StockMovement, 'id' | 'itemName'>) => void;
  resetStockMovements: () => void;
  products: Product[];
}

export default function InventoryManager({
  inventory,
  logAuditRecord,
  stockMovements,
  logStockMovement,
  products
}: InventoryManagerProps) {
  // Navigation Tabs for Sub-views
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');

  // Search & Categories for Stock tab
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');

  // Modal Dialog states for Inventory Adjustment
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState<{
    id: string;
    name: string;
    currentStock: number;
    unit: string;
  } | null>(null);

  // Form states for Stock Adjust
  const [auditPhysicalCount, setAuditPhysicalCount] = useState(0);
  const [auditAuditorName, setAuditAuditorName] = useState('Admin');
  const [auditNotes, setAuditNotes] = useState('');

  // Modal Dialog states for Daily Movement entry
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveItemId, setMoveItemId] = useState(products[0]?.id || '');
  const [moveDate, setMoveDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [moveDisplayed, setMoveDisplayed] = useState(0);
  const [moveSold, setMoveSold] = useState(0);

  // Resolves stock levels for all products, filters, and sorts 0-stock to top
  const resolvedInventory = useMemo(() => {
    return products
      .map((product) => {
        const invItem = inventory.find(i => i.id === product.id || i.name.toLowerCase() === product.name.toLowerCase());
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          currentStock: invItem ? invItem.currentStock : 0,
          minStockLevel: invItem ? invItem.minStockLevel : 5,
          unit: invItem ? invItem.unit : 'pcs',
          lastAudited: invItem ? invItem.lastAudited : null
        };
      })
      .filter((item) => {
        const matchesCategory = inventoryCategory === 'all' || item.category === inventoryCategory;
        const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        // Items with 0 stock always go to the top
        if (a.currentStock === 0 && b.currentStock > 0) return -1;
        if (a.currentStock > 0 && b.currentStock === 0) return 1;
        // Otherwise, sort by stock level ascending
        return a.currentStock - b.currentStock;
      });
  }, [products, inventory, inventoryCategory, inventorySearch]);

  // Handlers for stock adjustments
  const handleOpenAuditModal = (item: { id: string; name: string; currentStock: number; unit: string }) => {
    setSelectedAuditItem(item);
    setAuditPhysicalCount(item.currentStock);
    setAuditAuditorName('Admin');
    setAuditNotes('Manual stock adjustment');
    setIsAuditModalOpen(true);
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuditItem) return;
    if (!auditAuditorName.trim()) {
      alert('Please enter the name of the auditor doing the manual check.');
      return;
    }

    logAuditRecord({
      itemId: selectedAuditItem.id,
      auditDate: new Date().toLocaleString(),
      physicalCount: Number(auditPhysicalCount),
      auditedBy: auditAuditorName,
      notes: auditNotes
    });

    alert(`Stock level for "${selectedAuditItem.name}" updated to ${auditPhysicalCount} ${selectedAuditItem.unit}.`);
    setIsAuditModalOpen(false);
  };

  // Handlers for daily displayed vs sold movement logs
  const handleOpenMoveModal = () => {
    if (products.length === 0) {
      alert('Please add products to your catalog first before logging movements.');
      return;
    }
    setMoveItemId(products[0].id);
    setMoveDate(new Date().toISOString().substring(0, 10));
    setMoveDisplayed(0);
    setMoveSold(0);
    setIsMoveModalOpen(true);
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveItemId) return;
    if (moveDisplayed < 0 || moveSold < 0) {
      alert('Quantities cannot be negative.');
      return;
    }

    logStockMovement({
      itemId: moveItemId,
      date: moveDate,
      displayedQty: Number(moveDisplayed),
      soldQty: Number(moveSold)
    });

    const targetProduct = products.find(p => p.id === moveItemId);
    alert(`Movement logged for "${targetProduct?.name}": +${moveDisplayed} displayed, -${moveSold} sold.`);
    setIsMoveModalOpen(false);
  };

  return (
    <div className="inventory-page-container">
      {/* Sub-tab view buttons selection */}
      <div className="flex gap-3 mb-6 border-b border-slate-200 pb-3 font-sans">
        <button
          type="button"
          className={activeTab === 'stock'
            ? 'bg-blue-600 text-white border-none px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
            : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-none px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all outline-none'
          }
          onClick={() => setActiveTab('stock')}
        >
          Active Inventory Stock List
        </button>
        <button
          type="button"
          className={activeTab === 'movements'
            ? 'bg-blue-600 text-white border-none px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
            : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-none px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all outline-none'
          }
          onClick={() => setActiveTab('movements')}
        >
          Daily Stock & Sales Movement Ledger
        </button>
      </div>

      {/* Tab 1: Stock list */}
      {activeTab === 'stock' && (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6 box-border font-sans">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  className={inventoryCategory === 'all'
                    ? 'bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none'
                  }
                  onClick={() => setInventoryCategory('all')}
                >
                  All Inventory
                </button>
                <button
                  type="button"
                  className={inventoryCategory === 'ramyeon'
                    ? 'bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none'
                  }
                  onClick={() => setInventoryCategory('ramyeon')}
                >
                  Ramen Noodles
                </button>
                <button
                  type="button"
                  className={inventoryCategory === 'toppings'
                    ? 'bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none'
                  }
                  onClick={() => setInventoryCategory('toppings')}
                >
                  Fresh Toppings
                </button>
                <button
                  type="button"
                  className={inventoryCategory === 'drinks'
                    ? 'bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none'
                  }
                  onClick={() => setInventoryCategory('drinks')}
                >
                  Drinks & Beverages
                </button>
                <button
                  type="button"
                  className={inventoryCategory === 'silog'
                    ? 'bg-blue-600 text-white border border-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all outline-none'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none'
                  }
                  onClick={() => setInventoryCategory('silog')}
                >
                  Silog Items
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-60">
                  <input
                    type="text"
                    placeholder="Search stock..."
                    className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-955 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                  {inventorySearch && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 bg-none border-none cursor-pointer outline-none"
                      onClick={() => setInventorySearch('')}
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white font-sans">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Stock ID</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Item Name</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Category</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Current Stock</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Min Safety Stock</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Status Indicators</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Last Physical Audit</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resolvedInventory.length > 0 ? (
                  resolvedInventory.map((item) => {
                    const isOutOfStock = item.currentStock <= 0;
                    const isLow = item.currentStock <= item.minStockLevel;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${
                        isOutOfStock 
                          ? 'bg-rose-50/30' 
                          : isLow 
                            ? 'bg-amber-50/15' 
                            : ''
                      }`}>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="font-mono text-xs text-slate-500">{item.id}</span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <strong className="text-slate-950 font-bold text-[15px]">{item.name}</strong>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <strong className={`text-[15px] font-extrabold ${isOutOfStock ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-950'}`}>
                            {item.currentStock} {item.unit}
                          </strong>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="text-xs text-slate-500 font-semibold">
                            {item.minStockLevel} {item.unit}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          {isOutOfStock ? (
                            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">OUT OF STOCK</span>
                          ) : isLow ? (
                            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">Low Stock Alert</span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">Healthy Stock</span>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="text-xs text-slate-500 font-semibold">
                            {item.lastAudited || <span className="italic opacity-50">Never Audited</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200/50 hover:border-blue-600 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                              onClick={() => handleOpenAuditModal(item)}
                            >
                              Adjust Stock
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 border-b border-slate-100 text-center text-sm text-slate-500 italic">
                      No stock items found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab 2: Daily movement ledger */}
      {activeTab === 'movements' && (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6 box-border font-sans">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 flex-wrap">
              <div className="flex items-center m-0">
                <h3 className="text-sm font-extrabold text-slate-900 m-0">Daily Stocks Displayed & Sold Tracker Ledger</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-slate-900 text-white border-none px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/15 hover:shadow-lg transition-all outline-none"
                  onClick={handleOpenMoveModal}
                >
                  Log Daily Stock/Sales Movement
                </button>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white font-sans">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Date</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Item Name</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Displayed (Stocks Added)</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Sold Today</th>
                  <th className="bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-4 border-b-2 border-slate-200">Net Daily Stock Delta</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.length > 0 ? (
                  stockMovements.map((move) => {
                    const delta = move.displayedQty - move.soldQty;
                    return (
                      <tr key={move.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="text-xs text-slate-500 font-semibold">
                            {move.date}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <strong className="text-slate-950 font-bold text-[14.5px]">{move.itemName}</strong>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="text-xs text-green-600 font-bold">
                            +{move.displayedQty}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="text-xs text-red-600 font-bold">
                            -{move.soldQty}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          {delta > 0 && (
                            <strong className="text-green-600 text-xs font-bold">+{delta} (Surplus)</strong>
                          )}
                          {delta < 0 && (
                            <strong className="text-red-600 text-xs font-bold">{delta} (Deficit)</strong>
                          )}
                          {delta === 0 && (
                            <span className="text-slate-500 text-xs">Balanced (0)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 border-b border-slate-100 text-center text-sm text-slate-500 italic">
                      No stock movement logs found. Add a movement entry to start tracking displayed and sold items by date!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal: Adjust Stock Level */}
      {isAuditModalOpen && selectedAuditItem && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-6 box-border">
          <div className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden font-sans">
            <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold m-0">Adjust Stock: {selectedAuditItem.name}</h3>
              <button
                type="button"
                className="text-2xl text-white bg-transparent border-none cursor-pointer opacity-80 hover:opacity-100 outline-none"
                onClick={() => setIsAuditModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="p-6 flex flex-col gap-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Inventory Stock</span>
                <strong className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {selectedAuditItem.currentStock} {selectedAuditItem.unit}
                </strong>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="audit-phys-count" className="text-xs font-bold uppercase tracking-wider text-slate-700">New Total Stock Level ({selectedAuditItem.unit}) *</label>
                <input
                  type="number"
                  id="audit-phys-count"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-sm font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  placeholder="Enter new stock count"
                  value={auditPhysicalCount}
                  onChange={(e) => setAuditPhysicalCount(Number(e.target.value))}
                  min={0}
                  required
                />
                
                {/* Increment helper buttons */}
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    onClick={() => setAuditPhysicalCount(prev => prev + 1)}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    onClick={() => setAuditPhysicalCount(prev => prev + 5)}
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    onClick={() => setAuditPhysicalCount(prev => prev + 10)}
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    onClick={() => setAuditPhysicalCount(prev => prev + 25)}
                  >
                    +25
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="audit-auditor" className="text-xs font-bold uppercase tracking-wider text-slate-700">Auditor Name *</label>
                <input
                  type="text"
                  id="audit-auditor"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  placeholder="Enter auditor name"
                  value={auditAuditorName}
                  onChange={(e) => setAuditAuditorName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="audit-notes" className="text-xs font-bold uppercase tracking-wider text-slate-700">Adjustment Notes</label>
                <input
                  type="text"
                  id="audit-notes"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  placeholder="e.g. Restock shipment / physical correction"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none transition-all"
                  onClick={() => setIsAuditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none shadow-md shadow-blue-500/15 hover:shadow-lg transition-all"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Daily Stock/Sales Movement */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-6 box-border">
          <div className="bg-white rounded-3xl w-full max-w-[540px] shadow-2xl overflow-hidden font-sans">
            <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold m-0">Log Daily Displayed & Sold Counts</h3>
              <button
                type="button"
                className="text-2xl text-white bg-transparent border-none cursor-pointer opacity-80 hover:opacity-100 outline-none"
                onClick={() => setIsMoveModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleMoveSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="move-item" className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">Select Inventory Item *</label>
                <select
                  id="move-item"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans cursor-pointer"
                  value={moveItemId}
                  onChange={(e) => setMoveItemId(e.target.value)}
                  required
                >
                  {products.map(p => {
                    const invItem = inventory.find(i => i.id === p.id);
                    const stock = invItem ? invItem.currentStock : 0;
                    const unit = invItem ? invItem.unit : 'pcs';
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({stock} {unit} in stock)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="move-date" className="text-xs font-bold uppercase tracking-wider text-slate-700">Audit Date *</label>
                <input
                  type="date"
                  id="move-date"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="move-displayed" className="text-xs font-bold uppercase tracking-wider text-slate-700">Qty Displayed Today *</label>
                  <input
                    type="number"
                    id="move-displayed"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    placeholder="Stocks added to shelf"
                    value={moveDisplayed}
                    onChange={(e) => setMoveDisplayed(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="move-sold" className="text-xs font-bold uppercase tracking-wider text-slate-700">Qty Sold Today *</label>
                  <input
                    type="number"
                    id="move-sold"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    placeholder="Stocks sold to customers"
                    value={moveSold}
                    onChange={(e) => setMoveSold(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-100 p-3.5 rounded-xl text-xs text-slate-600 font-semibold">
                Calculated Stock Impact: This will change current stock level by:
                <strong className={`ml-1 ${moveDisplayed - moveSold >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {moveDisplayed - moveSold >= 0 ? `+${moveDisplayed - moveSold}` : `${moveDisplayed - moveSold}`} items
                </strong>.
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none transition-all"
                  onClick={() => setIsMoveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none shadow-md shadow-blue-500/15 hover:shadow-lg transition-all"
                >
                  Submit Movement Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
