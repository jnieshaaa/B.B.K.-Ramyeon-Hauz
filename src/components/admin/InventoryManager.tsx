import { useState, useMemo } from 'react';
import type { InventoryItem, AuditLogEntry, StockMovement } from '../../models/MenuModel';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastAudited'>) => void;
  logAuditRecord: (entry: Omit<AuditLogEntry, 'id' | 'itemName' | 'recordedCount' | 'discrepancy'>) => void;
  resetInventory: () => void;
  stockMovements: StockMovement[];
  logStockMovement: (entry: Omit<StockMovement, 'id' | 'itemName'>) => void;
  resetStockMovements: () => void;
}

export default function InventoryManager({
  inventory,
  addInventoryItem,
  logAuditRecord,
  resetInventory,
  stockMovements,
  logStockMovement,
  resetStockMovements
}: InventoryManagerProps) {
  // Navigation Tabs for Sub-views
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');

  // Search & Categories for Stock tab
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');

  // Modal Dialog states for Inventory Audit
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState<InventoryItem | null>(null);
  
  // Form states for Inventory Audit entry
  const [auditPhysicalCount, setAuditPhysicalCount] = useState(0);
  const [auditAuditorName, setAuditAuditorName] = useState('');
  const [auditNotes, setAuditNotes] = useState('');

  // Modal Dialog states for Add Inventory Item
  const [isAddInvModalOpen, setIsAddInvModalOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invStock, setInvStock] = useState(10);
  const [invMin, setInvMin] = useState(5);
  const [invUnit, setInvUnit] = useState('pcs');
  const [invCategory, setInvCategory] = useState('toppings');

  // Modal Dialog states for Daily Movement entry
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveItemId, setMoveItemId] = useState(inventory[0]?.id || '');
  const [moveDate, setMoveDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [moveDisplayed, setMoveDisplayed] = useState(0);
  const [moveSold, setMoveSold] = useState(0);

  // Filters stock inventory list
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesCategory = inventoryCategory === 'all' || item.category === inventoryCategory;
      const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [inventory, inventoryCategory, inventorySearch]);

  // Handlers for manual audit checks
  const handleOpenAuditModal = (item: InventoryItem) => {
    setSelectedAuditItem(item);
    setAuditPhysicalCount(item.currentStock);
    setAuditAuditorName('');
    setAuditNotes('');
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

    alert(`Audit entry saved! Stock for "${selectedAuditItem.name}" updated to ${auditPhysicalCount}.`);
    setIsAuditModalOpen(false);
  };

  const handleAddInvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || invStock < 0 || invMin < 0) {
      alert('Please fill out all fields with non-negative numbers.');
      return;
    }
    addInventoryItem({
      name: invName,
      currentStock: Number(invStock),
      minStockLevel: Number(invMin),
      unit: invUnit,
      category: invCategory
    });
    alert(`Inventory item "${invName}" created.`);
    setInvName('');
    setIsAddInvModalOpen(false);
  };

  // Handlers for daily displayed vs sold movement logs
  const handleOpenMoveModal = () => {
    if (inventory.length === 0) {
      alert('Please add inventory items first before logging movements.');
      return;
    }
    setMoveItemId(inventory[0].id);
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

    const targetItem = inventory.find(item => item.id === moveItemId);
    alert(`Movement logged! Adjusted "${targetItem?.name}" stock level: +${moveDisplayed} displayed, -${moveSold} sold.`);
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
                <button 
                  type="button" 
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all outline-none"
                  onClick={resetInventory}
                >
                  Reset Stocks
                </button>
                <button 
                  type="button" 
                  className="bg-blue-600 hover:bg-slate-900 text-white border-none px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/15 hover:shadow-lg transition-all outline-none"
                  onClick={() => setIsAddInvModalOpen(true)}
                >
                  Add Stock Item
                </button>
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
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const isLow = item.currentStock <= item.minStockLevel;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${
                        isLow ? 'bg-red-50/5' : ''
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
                          <strong className={`text-[15px] font-extrabold ${isLow ? 'text-red-600' : 'text-slate-950'}`}>
                            {item.currentStock} {item.unit}
                          </strong>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          <span className="text-xs text-slate-500 font-semibold">
                            {item.minStockLevel} {item.unit}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-slate-100 align-middle text-sm text-slate-600">
                          {isLow ? (
                            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">Low Stock Alert</span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">Healthy Stock</span>
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
                              className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200/50 hover:border-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                              onClick={() => handleOpenAuditModal(item)}
                            >
                              Log Audit
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
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all outline-none"
                  onClick={resetStockMovements}
                >
                  Reset Ledger
                </button>
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

      {/* Modal: Log Audit */}
      {isAuditModalOpen && selectedAuditItem && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-6 box-border">
          <div className="bg-white rounded-3xl w-full max-w-[540px] shadow-2xl overflow-hidden font-sans">
            <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold m-0">Log Manual Physical Audit Count</h3>
              <button 
                type="button" 
                className="text-2xl text-white bg-transparent border-none cursor-pointer opacity-80 hover:opacity-100 outline-none"
                onClick={() => setIsAuditModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="p-6 flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded-xl mb-1">
                <h4 className="color-slate-950 font-bold text-sm m-0">{selectedAuditItem.name}</h4>
                <p className="text-xs text-slate-500 mt-1 m-0">
                  Current System Stock Level: <strong>{selectedAuditItem.currentStock} {selectedAuditItem.unit}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="audit-phys-count" className="text-xs font-bold uppercase tracking-wider text-slate-700">Actual Physical Count ({selectedAuditItem.unit}) *</label>
                  <input
                    type="number"
                    id="audit-phys-count"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    placeholder="Enter physical counted stock"
                    value={auditPhysicalCount}
                    onChange={(e) => setAuditPhysicalCount(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="audit-auditor" className="text-xs font-bold uppercase tracking-wider text-slate-700">Auditor Name *</label>
                  <input
                    type="text"
                    id="audit-auditor"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    placeholder="e.g. Maria Clara"
                    value={auditAuditorName}
                    onChange={(e) => setAuditAuditorName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="audit-notes" className="text-xs font-bold uppercase tracking-wider text-slate-700">Adjustment Notes / Remarks</label>
                <textarea
                  id="audit-notes"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans resize-y"
                  placeholder="Explain discrepancies or count logs..."
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  rows={3}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none transition-all"
                  onClick={() => setIsAuditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none shadow-md shadow-blue-500/15 hover:shadow-lg transition-all"
                >
                  Save Audit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Inventory Item */}
      {isAddInvModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-6 box-border">
          <div className="bg-white rounded-3xl w-full max-w-[540px] shadow-2xl overflow-hidden font-sans">
            <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold m-0">Add New Inventory Stock Item</h3>
              <button 
                type="button" 
                className="text-2xl text-white bg-transparent border-none cursor-pointer opacity-80 hover:opacity-100 outline-none"
                onClick={() => setIsAddInvModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddInvSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-name" className="text-xs font-bold uppercase tracking-wider text-slate-700">Item Name *</label>
                <input
                  type="text"
                  id="inv-name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  placeholder="e.g. Carbonara Powder Bags"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inv-stock" className="text-xs font-bold uppercase tracking-wider text-slate-700">Initial Stock Level *</label>
                  <input
                    type="number"
                    id="inv-stock"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    value={invStock}
                    onChange={(e) => setInvStock(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inv-min" className="text-xs font-bold uppercase tracking-wider text-slate-700">Safety Stock (Min Level) *</label>
                  <input
                    type="number"
                    id="inv-min"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    value={invMin}
                    onChange={(e) => setInvMin(Number(e.target.value))}
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inv-unit" className="text-xs font-bold uppercase tracking-wider text-slate-700">Unit Type *</label>
                  <select
                    id="inv-unit"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                  >
                    <option value="pcs">pcs (individual)</option>
                    <option value="packs">packs (bags)</option>
                    <option value="blocks">blocks (cheese)</option>
                    <option value="kg">kg (weight)</option>
                    <option value="cans">cans (beverages/spam)</option>
                    <option value="bottles">bottles (soju)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inv-cat" className="text-xs font-bold uppercase tracking-wider text-slate-700">Category *</label>
                  <select
                    id="inv-cat"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                    value={invCategory}
                    onChange={(e) => setInvCategory(e.target.value)}
                  >
                    <option value="ramyeon">Korean Ramyeon</option>
                    <option value="toppings">Ramyeon Toppings</option>
                    <option value="drinks">Drinks & Sides</option>
                    <option value="silog">All-Day Silog</option>
                    <option value="combos">Combo Meals</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none transition-all"
                  onClick={() => setIsAddInvModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border-none shadow-md shadow-blue-500/15 hover:shadow-lg transition-all"
                >
                  Add Item to Stock
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
                <label htmlFor="move-item" className="text-xs font-bold uppercase tracking-wider text-slate-700">Select Inventory Item *</label>
                <select
                  id="move-item"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 text-xs font-semibold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all box-border font-sans"
                  value={moveItemId}
                  onChange={(e) => setMoveItemId(e.target.value)}
                  required
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.currentStock} {item.unit} in stock)
                    </option>
                  ))}
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
