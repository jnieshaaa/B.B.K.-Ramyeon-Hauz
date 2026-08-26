import React, { useState, useMemo } from 'react';
import type { Product, Inquiry, InventoryItem, AuditLogEntry, StockMovement } from '../../models/MenuModel';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import DashboardOverview from './DashboardOverview';
import CatalogManager from './CatalogManager';
import BookingsManager from './BookingsManager';
import InventoryManager from './InventoryManager';
import AuditLogsManager from './AuditLogsManager';

interface AdminDashboardProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;

  // Inquiry management props
  inquiries: Inquiry[];
  resolveInquiry: (id: string) => void;
  deleteInquiry: (id: string) => void;

  // Inventory management props
  inventory: InventoryItem[];
  auditLogs: AuditLogEntry[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastAudited'>) => void;
  logAuditRecord: (entry: Omit<AuditLogEntry, 'id' | 'itemName' | 'recordedCount' | 'discrepancy'>) => void;
  resetInventory: () => void;
  stockMovements: StockMovement[];
  logStockMovement: (entry: Omit<StockMovement, 'id' | 'itemName'>) => void;
  resetStockMovements: () => void;
}

export default function AdminDashboard({
  products,
  addProduct,
  editProduct,
  deleteProduct,
  resetProducts,
  inquiries,
  resolveInquiry,
  deleteInquiry,
  inventory,
  auditLogs,
  addInventoryItem,
  logAuditRecord,
  resetInventory,
  stockMovements,
  logStockMovement,
  resetStockMovements
}: AdminDashboardProps) {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('bbk_admin_auth') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  // Tab navigation page state
  const [currentPage, setCurrentPage] = useState<'overview' | 'products' | 'bookings' | 'inventory' | 'audit-logs'>('overview');

  // Calculates quick statistics counts
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalInquiries = inquiries.length;
    const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
    const lowStockCount = inventory.filter(item => item.currentStock <= item.minStockLevel).length;
    const totalAuditLogs = auditLogs.length;

    return {
      totalProducts,
      totalInquiries,
      pendingInquiries,
      lowStockCount,
      totalAuditLogs
    };
  }, [products, inquiries, inventory, auditLogs]);

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('bbk_admin_auth', 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid administrative username or password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bbk_admin_auth');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // Render Login wall
  if (!isLoggedIn) {
    return (
      <AdminLogin
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        onSubmit={handleLoginSubmit}
        onBackToSite={() => { window.location.search = ''; }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Layout component */}
      <AdminSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pendingInquiriesCount={stats.pendingInquiries}
        lowStockCount={stats.lowStockCount}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 m-0">
              {currentPage === 'overview' && 'Portal Performance Overview'}
              {currentPage === 'products' && 'Menu Catalog Manager'}
              {currentPage === 'bookings' && 'Customer Reservations & Orders'}
              {currentPage === 'inventory' && 'Inventory Stock & Auditing'}
              {currentPage === 'audit-logs' && 'Historical Physical Audit Logs'}
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1 m-0">
              {currentPage === 'overview' && 'Real-time sales indicators, booking feeds, and inventory thresholds.'}
              {currentPage === 'products' && 'Add, edit, or delete items from the customer catalog.'}
              {currentPage === 'bookings' && 'Track dine-in bookings, details, and order specifications.'}
              {currentPage === 'inventory' && 'Conduct audits, log physical counts, and review safety levels.'}
              {currentPage === 'audit-logs' && 'Audit trail records of physical inventory adjustments.'}
            </p>
          </div>
          <div>
            <button 
              type="button" 
              className="bg-transparent hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-600 hover:border-blue-600 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all outline-none"
              onClick={() => { window.location.search = ''; }}
            >
              View Customer Site
            </button>
          </div>
        </header>

        <div className="p-8 box-border">
          {currentPage === 'overview' && (
            <DashboardOverview
              stats={stats}
              inventory={inventory}
              inquiries={inquiries}
              onViewInventory={() => setCurrentPage('inventory')}
              onViewBookings={() => setCurrentPage('bookings')}
            />
          )}

          {currentPage === 'products' && (
            <CatalogManager
              products={products}
              addProduct={addProduct}
              editProduct={editProduct}
              deleteProduct={deleteProduct}
              resetProducts={resetProducts}
            />
          )}

          {currentPage === 'bookings' && (
            <BookingsManager
              inquiries={inquiries}
              resolveInquiry={resolveInquiry}
              deleteInquiry={deleteInquiry}
            />
          )}

          {currentPage === 'inventory' && (
            <InventoryManager
              inventory={inventory}
              addInventoryItem={addInventoryItem}
              logAuditRecord={logAuditRecord}
              resetInventory={resetInventory}
              stockMovements={stockMovements}
              logStockMovement={logStockMovement}
              resetStockMovements={resetStockMovements}
            />
          )}

          {currentPage === 'audit-logs' && (
            <AuditLogsManager
              auditLogs={auditLogs}
            />
          )}
        </div>
      </div>
    </div>
  );
}
