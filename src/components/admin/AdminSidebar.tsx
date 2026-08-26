interface AdminSidebarProps {
  currentPage: 'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs';
  setCurrentPage: (page: 'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs') => void;
  pendingInquiriesCount: number;
  lowStockCount: number;
  onLogout: () => void;
}

export default function AdminSidebar({
  currentPage,
  setCurrentPage,
  pendingInquiriesCount,
  lowStockCount,
  onLogout
}: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0 border-r border-white/5 font-sans box-border h-full">
      {/* Brand logo details header */}
      <div className="p-6 border-b border-white/10">
        <h4 className="text-base font-extrabold text-white m-0">B.B.K. Ramyeon</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 m-0">
          Admin Dashboard
        </p>
      </div>

      {/* Sidebar Nav Buttons */}
      <nav className="py-6 px-4 flex flex-col gap-1.5 grow">
        <button
          type="button"
          className={`flex items-center justify-between w-full px-4 py-3 border-none rounded-xl font-bold text-sm text-left cursor-pointer transition-all outline-none ${
            currentPage === 'overview'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          onClick={() => setCurrentPage('overview')}
        >
          Portal Overview
        </button>

        <button
          type="button"
          className={`flex items-center justify-between w-full px-4 py-3 border-none rounded-xl font-bold text-sm text-left cursor-pointer transition-all outline-none ${
            currentPage === 'products'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          onClick={() => setCurrentPage('products')}
        >
          Product Catalog
        </button>

        <button
          type="button"
          className={`flex items-center justify-between w-full px-4 py-3 border-none rounded-xl font-bold text-sm text-left cursor-pointer transition-all outline-none ${
            currentPage === 'bookings'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          onClick={() => setCurrentPage('bookings')}
        >
          <span>Dine-In Bookings</span>
          {pendingInquiriesCount > 0 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg text-white ${
              currentPage === 'bookings' ? 'bg-white/20' : 'bg-slate-800'
            }`}>
              {pendingInquiriesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`flex items-center justify-between w-full px-4 py-3 border-none rounded-xl font-bold text-sm text-left cursor-pointer transition-all outline-none ${
            currentPage === 'inventory'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          onClick={() => setCurrentPage('inventory')}
        >
          <span>Inventory Stock</span>
          {lowStockCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg text-white bg-red-500">
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`flex items-center justify-between w-full px-4 py-3 border-none rounded-xl font-bold text-sm text-left cursor-pointer transition-all outline-none ${
            currentPage === 'audit-logs'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          onClick={() => setCurrentPage('audit-logs')}
        >
          Manual Audit Logs
        </button>
      </nav>

      {/* Footer Profile Section */}
      <div className="p-5 border-t border-white/10 flex flex-col gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
            AD
          </div>
          <div>
            <h6 className="text-sm font-bold text-white m-0">Store Manager</h6>
            <p className="text-[11px] text-slate-500 m-0">bbkramyeonhauz@gmail.com</p>
          </div>
        </div>
        <button
          type="button"
          className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center transition-all box-border"
          onClick={onLogout}
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
