interface AdminSidebarProps {
  currentPage: 'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs' | 'settings';
  setCurrentPage: (page: 'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs' | 'settings') => void;
  pendingInquiriesCount: number;
  lowStockCount: number;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: 'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs' | 'settings';
  label: string;
  badge?: number;
  badgeClass?: string;
}

export default function AdminSidebar({
  currentPage,
  setCurrentPage,
  pendingInquiriesCount,
  lowStockCount,
  onLogout,
  isOpen,
  onClose
}: AdminSidebarProps) {
  const handleNavClick = (page: 'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs' | 'settings') => {
    setCurrentPage(page);
    onClose();
  };

  // Define sidebar navigation options dynamically to prevent repetitive markup
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Portal Overview' },
    { id: 'products', label: 'Product Catalog' },
    {
      id: 'bookings',
      label: 'Dine-In Bookings',
      badge: pendingInquiriesCount,
      badgeClass: currentPage === 'bookings' ? 'bg-white/20 text-white' : 'bg-[#5B240B]/10 text-[#5B240B]'
    },
    {
      id: 'inventory',
      label: 'Inventory Stock',
      badge: lowStockCount,
      badgeClass: 'text-white bg-red-500'
    },
    { id: 'audit-logs', label: 'Manual Audit Logs' },
    { id: 'settings', label: 'Store Settings' }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[2040]"
          onClick={onClose}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-[2050] w-64 bg-[#FAF1D6] text-[#5B240B] flex flex-col shrink-0 border-r border-[#5B240B]/10 font-sans box-border h-full transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        {/* Brand logo details header (Dark Top Section) */}
        <div className="p-6 bg-[#5B240B] text-white border-b border-[#FAF1D6]/10 relative">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="B.B.K. Logo" className="w-8 h-8 object-contain rounded-full bg-white/10 p-0.5" />
            <div className="flex flex-col">
              <h4 className="text-sm font-extrabold text-white m-0 leading-tight">B.B.K. Ramyeon</h4>
              <p className="text-[9px] text-[#FAF1D6]/70 font-bold uppercase tracking-wider mt-0.5 m-0">
                Admin Dashboard
              </p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            type="button"
            className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-transparent border-none outline-none cursor-pointer p-1"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="py-6 px-4 flex flex-col gap-1.5 grow">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center justify-between w-full px-4 py-3 border-none rounded-xl font-bold text-sm text-left cursor-pointer transition-all outline-none ${currentPage === item.id
                  ? 'bg-[#D65113] text-white shadow-sm shadow-[#D65113]/25'
                  : 'bg-transparent text-[#5B240B]/85 hover:text-[#D65113] hover:bg-[#5B240B]/5'
                }`}
              onClick={() => handleNavClick(item.id)}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${item.badgeClass}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer Profile Section */}
        <div className="p-5 border-t border-[#5B240B]/10 flex flex-col gap-4 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D65113] text-white font-extrabold text-xs flex items-center justify-center">
              AD
            </div>
            <div>
              <h6 className="text-sm font-bold text-[#5B240B] m-0">Store Manager</h6>
              <p className="text-[11px] text-[#5B240B]/70 m-0">bbkramyeonhauz@gmail.com</p>
            </div>
          </div>
          <button
            type="button"
            className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center transition-all box-border"
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
