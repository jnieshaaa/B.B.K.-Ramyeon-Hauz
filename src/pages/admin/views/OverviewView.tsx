import { useMemo } from 'react';
import type { InventoryItem, Inquiry } from '../../../models/MenuModel';

interface DashboardOverviewProps {
  stats: {
    totalProducts: number;
    totalInquiries: number;
    pendingInquiries: number;
    lowStockCount: number;
    totalAuditLogs: number;
  };
  inventory: InventoryItem[];
  inquiries: Inquiry[];
  onViewInventory: () => void;
  onViewBookings: () => void;
  onOpenPos?: () => void;
}

export default function DashboardOverview({
  stats,
  inventory,
  inquiries,
  onViewInventory,
  onViewBookings,
  onOpenPos
}: DashboardOverviewProps) {
  // Low stock inventory subset
  const lowStockInventory = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.minStockLevel);
  }, [inventory]);

  return (
    <div className="flex flex-col gap-8 font-sans">
      
      {/* Quick POS Launch Banner */}
      {onOpenPos && (
        <div className="bg-gradient-to-r from-[#5B240B] to-[#7B3311] rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D65113] flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold m-0 text-white">POS Cashier Terminal</h3>
              <p className="text-xs text-[#FAF1D6]/80 m-0 mt-0.5">Take in-store dine-in or takeout orders, tender payments, and print thermal slips.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPos}
            className="px-5 py-3 rounded-xl bg-[#D65113] hover:bg-white hover:text-[#5B240B] text-white font-black text-xs transition-all border-none cursor-pointer shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Open POS Cashier</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 box-border flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl text-xs flex items-center justify-center font-bold bg-blue-50 text-blue-600">
            CAT
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900 m-0">{stats.totalProducts}</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 m-0">Total Products</p>
          </div>
        </div>

        <div className={`bg-white rounded-2xl border shadow-sm p-6 box-border flex items-center gap-5 ${
          stats.pendingInquiries > 0 ? 'border-blue-200' : 'border-slate-200'
        }`}>
          <div className="w-12 h-12 rounded-xl text-xs flex items-center justify-center font-bold bg-blue-50 text-blue-600">
            RES
          </div>
          <div>
            <h4 className={`text-2xl font-extrabold m-0 ${stats.pendingInquiries > 0 ? 'text-blue-600' : 'text-slate-900'}`}>
              {stats.pendingInquiries}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 m-0">Pending Reservations</p>
          </div>
        </div>

        <div className={`bg-white rounded-2xl border shadow-sm p-6 box-border flex items-center gap-5 ${
          stats.lowStockCount > 0 ? 'border-red-200' : 'border-slate-200'
        }`}>
          <div className="w-12 h-12 rounded-xl text-xs flex items-center justify-center font-bold bg-red-50 text-red-600">
            STK
          </div>
          <div>
            <h4 className={`text-2xl font-extrabold m-0 ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {stats.lowStockCount}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 m-0">Low Stock Items</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 box-border flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl text-xs flex items-center justify-center font-bold bg-green-50 text-green-600">
            AUD
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900 m-0">{stats.totalAuditLogs}</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 m-0">Audits Completed</p>
          </div>
        </div>
      </div>

      {/* Main Info Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alerts & Performance */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Stock Alert Summary list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 box-border">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">Safety Stock Warning Alerts</h3>
              <button 
                type="button" 
                className="bg-transparent border-none text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer outline-none"
                onClick={onViewInventory}
              >
                Audit Stock
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {lowStockInventory.length > 0 ? (
                lowStockInventory.map(item => (
                  <div key={item.id} className="bg-red-50/30 border border-red-100 rounded-xl p-3.5 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <strong className="text-slate-900 text-sm">{item.name}</strong>
                      <span className="text-slate-400 text-xs">({item.category})</span>
                    </div>
                    <div className="text-sm text-red-600 font-bold">
                      Stock: {item.currentStock} {item.unit} <span className="text-slate-400 font-normal text-xs">(Min: {item.minStockLevel})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-green-500/5 text-green-600 border border-dashed border-green-500/30 rounded-xl p-5 text-center font-bold text-sm">
                  All inventory levels are currently above minimum safety thresholds!
                </div>
              )}
            </div>
          </div>

          {/* Quick Audit Performance Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 box-border">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">Stock Level Audited Breakdown</h3>
            </div>
            <div className="flex flex-col gap-4">
              {inventory.slice(0, 5).map((item) => {
                const percent = Math.min(100, Math.max(10, (item.currentStock / 150) * 100));
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <span className="w-36 text-xs font-bold text-slate-900 truncate">{item.name}</span>
                    <div className="grow h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.currentStock <= item.minStockLevel ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="w-20 text-right text-xs font-bold text-slate-500">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 box-border">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">Recent Booking Requests</h3>
              <button 
                type="button" 
                className="bg-transparent border-none text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer outline-none"
                onClick={onViewBookings}
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {inquiries.slice(0, 4).length > 0 ? (
                inquiries.slice(0, 4).map(inq => (
                  <div key={inq.id} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 relative">
                    <div className="flex justify-between items-center mb-1.5">
                      <strong className="text-sm text-slate-900">{inq.name}</strong>
                      <span className={`w-2 h-2 rounded-full ${
                        inq.status === 'pending' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 leading-relaxed m-0">{inq.message.substring(0, 80)}...</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold inline-block mt-2">{inq.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  No bookings or contact messages received.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
